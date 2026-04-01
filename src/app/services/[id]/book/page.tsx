import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getService } from '@/lib/actions/appointments';
import { BookingFlow } from '@/components/appointments/booking-flow';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookAppointmentPage({ params }: Props) {
  // Auth gate - booking requires a signed-in user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { id } = await params;
  if (!user) redirect(`/login?redirect=/services/${id}/book`);

  const [{ data: profile }, service] = await Promise.all([
    supabase.from('profiles').select('full_name, phone, email').eq('id', user.id).single(),
    getService(id),
  ]);

  if (!service) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Book Appointment</h1>
          <p className="text-muted-foreground">{service.name}</p>
        </div>

        <BookingFlow
          service={service}
          defaultValues={{
            customer_name:  profile?.full_name  ?? '',
            customer_email: profile?.email      ?? '',
            customer_phone: profile?.phone      ?? '',
          }}
        />
      </div>
    </div>
  );
}
