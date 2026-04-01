'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Clock, DollarSign, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAvailableTimeSlots, createAppointment } from '@/lib/actions/appointments';
import type { Service } from '@/lib/types/appointment';

// ============================================================
// FORM SCHEMA
// Only the customer details step requires validation.
// Date and time are controlled state - not part of the form.
// ============================================================

const bookingSchema = z.object({
  customer_name:     z.string().min(2, 'Name is required'),
  customer_email:    z.string().email('Enter a valid email'),
  customer_phone:    z.string().min(6, 'Phone number is required'),
  equipment_type:    z.string().optional(),
  equipment_brand:   z.string().optional(),
  issue_description: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type Props = {
  service: Service;
  defaultValues?: {
    customer_name:  string;
    customer_email: string;
    customer_phone: string;
  };
};

type Step = 'date' | 'time' | 'details' | 'success';

export function BookingFlow({ service, defaultValues }: Props) {
  const router = useRouter();

  const [step, setStep]             = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots]   = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  });

  // ============================================================
  // STEP 1 -> 2: Date selected
  // Fetch available slots for the chosen date, then advance.
  // ============================================================

  async function handleDateConfirm() {
    if (!selectedDate) return;
    setSlotsLoading(true);
    const slots = await getAvailableTimeSlots(service.id, selectedDate);
    setTimeSlots(slots);
    setSlotsLoading(false);
    setStep('time');
  }

  // ============================================================
  // STEP 2 -> 3: Time slot selected
  // ============================================================

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep('details');
  }

  // ============================================================
  // STEP 3: Submit booking
  // ============================================================

  async function onSubmit(values: BookingFormValues) {
    setSubmitError(null);

    const { appointment, error } = await createAppointment({
      service_id:        service.id,
      appointment_date:  selectedDate,
      appointment_time:  selectedTime,
      customer_name:     values.customer_name,
      customer_email:    values.customer_email,
      customer_phone:    values.customer_phone,
      equipment_type:    values.equipment_type,
      equipment_brand:   values.equipment_brand,
      issue_description: values.issue_description,
    });

    if (error || !appointment) {
      setSubmitError(error ?? 'Something went wrong. Please try again.');
      return;
    }

    setStep('success');
  }

  // ============================================================
  // Minimum bookable date: tomorrow
  // Same-day bookings are not accepted - the owner needs time to
  // confirm. toISOString().split('T')[0] gives 'YYYY-MM-DD'.
  // ============================================================

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // ============================================================
  // RENDER
  // ============================================================

  // Success screen
  if (step === 'success') {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
          <span className="text-primary-foreground text-xl font-bold">&#10003;</span>
        </div>
        <h2 className="text-2xl font-bold">Booking Received</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          We&apos;ll review your request and send a confirmation email within one business day.
        </p>
        <div className="flex gap-3 justify-center pt-4">
          <Button variant="outline" onClick={() => router.push('/services')}>
            Back to Services
          </Button>
          <Button onClick={() => router.push('/dashboard/appointments')}>
            View My Appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Service summary strip */}
      <div className="border bg-muted/30 px-5 py-4 flex flex-wrap gap-6">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{service.duration_minutes} min</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span>{Number(service.price).toFixed(2)}</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {(['date', 'time', 'details'] as const).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            {i > 0 && <span>/</span>}
            <span className={step === s ? 'text-foreground font-medium' : ''}>
              {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </span>
        ))}
      </div>

      {/* ---- STEP 1: DATE ---- */}
      {step === 'date' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select a date</h2>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border bg-background px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div>
            <Button onClick={handleDateConfirm} disabled={!selectedDate || slotsLoading}>
              {slotsLoading ? 'Checking availability...' : 'See Available Times'}
            </Button>
          </div>
        </div>
      )}

      {/* ---- STEP 2: TIME ---- */}
      {step === 'time' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('date')}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Back to date selection"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">Select a time</h2>
          </div>

          <p className="text-sm text-muted-foreground">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-AU', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>

          {timeSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              No available times on this date. Please choose another day.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => handleTimeSelect(slot)}
                  className="border px-3 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- STEP 3: CUSTOMER DETAILS ---- */}
      {step === 'details' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep('time')}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Back to time selection"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">Your details</h2>
          </div>

          {/* Booking summary */}
          <div className="border px-4 py-3 text-sm space-y-1 bg-muted/30">
            <p><span className="text-muted-foreground">Date:</span> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><span className="text-muted-foreground">Time:</span> {selectedTime}</p>
          </div>

          {/* Required fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Full name</Label>
              <Input id="customer_name" {...register('customer_name')} />
              {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Email</Label>
              <Input id="customer_email" type="email" {...register('customer_email')} />
              {errors.customer_email && <p className="text-xs text-destructive">{errors.customer_email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input id="customer_phone" type="tel" {...register('customer_phone')} />
              {errors.customer_phone && <p className="text-xs text-destructive">{errors.customer_phone.message}</p>}
            </div>
          </div>

          {/* Optional equipment fields */}
          <div className="space-y-4">
            <p className="text-sm font-medium">Equipment details <span className="text-muted-foreground font-normal">(optional)</span></p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="equipment_type">Equipment type</Label>
                <Input id="equipment_type" placeholder="e.g. Treadmill" {...register('equipment_type')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="equipment_brand">Brand</Label>
                <Input id="equipment_brand" placeholder="e.g. NordicTrack" {...register('equipment_brand')} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="issue_description">Issue description</Label>
              <textarea
                id="issue_description"
                rows={3}
                placeholder="Describe the problem or what you need done..."
                className="w-full border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                {...register('issue_description')}
              />
            </div>
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </form>
      )}

    </div>
  );
}
