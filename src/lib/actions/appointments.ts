'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Service, Appointment, AppointmentWithService, CreateAppointmentInput } from '@/lib/types/appointment';
import { sendAppointmentConfirmation } from '@/lib/email';

// ============================================================
// GET ALL ACTIVE SERVICES
// Used on the public /services page.
// RLS allows unauthenticated reads on active rows, so the
// regular server client is sufficient here.
// ============================================================

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('price', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Service[];
}

// ============================================================
// GET SINGLE SERVICE
// Used on the booking page to display service details.
// ============================================================

export async function getService(id: string): Promise<Service | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .eq('active', true)
    .single();

  return data as Service | null;
}

// ============================================================
// GET AVAILABLE TIME SLOTS
// Computes which 30-minute slots are free on a given date
// for a given service.
//
// Slots are NOT stored in the database - they are derived:
//   all possible slots (9AM-5PM, 30-min increments)
//   minus slots where an existing appointment overlaps.
//
// Overlap check: a proposed slot [start, start+duration) conflicts
// with an existing booking if:
//   existing.appointment_time < proposed.end_time
//   AND existing.end_time > proposed.appointment_time
//
// We fetch all non-cancelled bookings for the day and filter
// client-side rather than writing complex SQL - the number of
// bookings per day is small enough that this is fine.
// ============================================================

export async function getAvailableTimeSlots(serviceId: string, date: string): Promise<string[]> {
  const supabase = await createClient();

  // Need service duration to compute end time of each candidate slot
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single();

  if (!service) return [];

  // Fetch all booked time ranges for this date (any service, not just this one -
  // the shop has one technician, so all bookings block the same calendar)
  const { data: booked } = await supabase
    .from('appointments')
    .select('appointment_time, end_time')
    .eq('appointment_date', date)
    .neq('status', 'cancelled');

  const bookedRanges = booked ?? [];

  // Generate all 30-minute slots from 09:00 to 17:00
  // A slot is valid only if it plus the service duration fits before 17:00
  const slots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    for (const mins of [0, 30]) {
      const totalMins = hour * 60 + mins;
      const slotEnd = totalMins + service.duration_minutes;

      // Slot must finish by 17:00 (1020 minutes from midnight)
      if (slotEnd > 17 * 60) continue;

      const label = `${String(hour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      const endLabel = minutesToTime(slotEnd);

      // Check against all existing bookings for overlap
      const isBlocked = bookedRanges.some((booking) => {
        const bookedStart = timeToMinutes(booking.appointment_time);
        const bookedEnd   = timeToMinutes(booking.end_time);
        // Overlap: proposed starts before existing ends AND proposed ends after existing starts
        return totalMins < bookedEnd && slotEnd > bookedStart;
      });

      if (!isBlocked) slots.push(label);
    }
  }

  return slots;
}

// ============================================================
// CREATE APPOINTMENT
// Inserts the appointment row and returns it.
//
// end_time is calculated here (not by the client) to ensure it
// is always consistent with the service duration.
//
// Uses the regular server client - RLS INSERT policy allows
// authenticated users to create their own appointments.
// ============================================================

export async function createAppointment(input: CreateAppointmentInput): Promise<{ appointment: Appointment | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { appointment: null, error: 'You must be logged in to book an appointment' };

  // Fetch service fields needed for end_time calculation and confirmation email
  const { data: service } = await supabase
    .from('services')
    .select('name, duration_minutes, price')
    .eq('id', input.service_id)
    .single();

  if (!service) return { appointment: null, error: 'Service not found' };

  const startMins = timeToMinutes(input.appointment_time);
  const endMins   = startMins + service.duration_minutes;
  const end_time  = minutesToTime(endMins);

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      user_id:          user.id,
      service_id:       input.service_id,
      appointment_date: input.appointment_date,
      appointment_time: input.appointment_time,
      end_time,
      duration_minutes: service.duration_minutes,
      customer_name:    input.customer_name,
      customer_email:   input.customer_email,
      customer_phone:   input.customer_phone,
      equipment_type:   input.equipment_type   ?? null,
      equipment_brand:  input.equipment_brand  ?? null,
      issue_description: input.issue_description ?? null,
    })
    .select()
    .single();

  if (error) return { appointment: null, error: error.message };

  // Send confirmation email - best-effort, does not affect the booking result
  await sendAppointmentConfirmation({
    customerName:    input.customer_name,
    customerEmail:   input.customer_email,
    serviceName:     service.name ?? '',
    appointmentDate: input.appointment_date,
    appointmentTime: input.appointment_time,
    duration:        service.duration_minutes,
    price:           service.price,
  });

  return { appointment: data as Appointment, error: null };
}

// ============================================================
// GET USER APPOINTMENTS
// Returns the current user's appointments, joined with service
// name/price/duration, ordered by date descending.
// Used on /dashboard/appointments.
// ============================================================

export async function getUserAppointments(): Promise<AppointmentWithService[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name, price, duration_minutes)')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: false });

  if (error) return [];
  return data as AppointmentWithService[];
}

// ============================================================
// CANCEL APPOINTMENT
// Allows a customer to cancel their own pending or confirmed
// appointment.
//
// Uses the admin client to bypass RLS - customers have no
// UPDATE policy. The state machine check (only pending/confirmed
// can be cancelled) is enforced here in the server action.
// ============================================================

export async function cancelAppointment(appointmentId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'Not authenticated';

  // Fetch the appointment to verify ownership + current status
  const admin = createAdminClient();
  const { data: appointment } = await admin
    .from('appointments')
    .select('user_id, status')
    .eq('id', appointmentId)
    .single();

  if (!appointment) return 'Appointment not found';

  if (appointment.user_id !== user.id) return 'Not authorised';
  
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    return 'Only pending or confirmed appointments can be cancelled';
  }

  const { error } = await admin
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentId);

  if (error) return error.message;
  return null;
}

// ============================================================
// HELPERS
// Convert between 'HH:MM' or 'HH:MM:SS' strings and minutes
// since midnight. Used throughout this file for overlap math.
// ============================================================

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
