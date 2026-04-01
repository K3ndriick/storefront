'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { AppointmentWithService, AppointmentStatus } from '@/lib/types/appointment';

// ============================================================
// VALID STATUS TRANSITIONS (state machine)
// Mirrors the same pattern used in admin/reviews.ts.
//
// pending   -> confirmed  (owner accepts the booking)
// pending   -> cancelled  (owner rejects before confirming)
// confirmed -> completed  (service has been performed)
// confirmed -> cancelled  (owner cancels an accepted booking)
// completed -> (terminal) no further transitions allowed
// cancelled -> (terminal) no further transitions allowed
// ============================================================

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

// ============================================================
// GET ALL APPOINTMENTS (admin)
// Returns all appointments joined with service name/price/duration,
// ordered by date ascending so the soonest appointment is first.
// Admin client bypasses RLS so all rows are visible regardless
// of which user made the booking.
// ============================================================

export async function getAdminAppointments(): Promise<AppointmentWithService[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name, price, duration_minutes)')
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });

  if (error) {
    console.error(`getAdminAppointments error: ${error.message}`);
    throw error;
  }

  return (data ?? []) as AppointmentWithService[];
}

// ============================================================
// UPDATE APPOINTMENT STATUS (admin)
// Validates the transition against the state machine before
// writing. Sets confirmed_at / completed_at timestamps when
// moving into those states.
// Returns null on success, error string on failure.
// ============================================================

export async function updateAppointmentStatus(appointmentId: string, newStatus: AppointmentStatus): Promise<string | null> {
  const supabase = createAdminClient();

  // Fetch current status to validate the transition
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', appointmentId)
    .single();

  if (fetchError || !appointment) return 'Appointment not found';

  const allowed = VALID_TRANSITIONS[appointment.status as AppointmentStatus];

  if (!allowed.includes(newStatus)) {
    return `Cannot transition from ${appointment.status} to ${newStatus}`;
  }

  // Build the update payload - set the relevant timestamp if applicable
  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'confirmed') updatePayload.confirmed_at = new Date().toISOString();
  if (newStatus === 'completed') updatePayload.completed_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from('appointments')
    .update(updatePayload)
    .eq('id', appointmentId);

  if (updateError) return updateError.message;

  revalidatePath('/admin/appointments');
  return null;
}
