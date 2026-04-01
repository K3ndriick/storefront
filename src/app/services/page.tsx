import Link from 'next/link';
import { Clock, DollarSign, ArrowRight } from 'lucide-react';
import { getServices } from '@/lib/actions/appointments';

export const metadata = {
  title: 'Repair & Installation Services | PowerProShop',
  description: 'Book a professional equipment repair, installation, or maintenance service.',
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Repair &amp; Installation Services</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Professional equipment service by our certified technicians.
            Book online 24/7 - we&apos;ll confirm your appointment within one business day.
          </p>
        </div>

        {/* Service cards */}
        {services.length === 0 ? (
          <p className="text-muted-foreground">No services available at this time. Please check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div key={service.id} className="border bg-card flex flex-col">

                {/* Body */}
                <div className="p-6 flex-1 space-y-4">
                  <h2 className="text-xl font-semibold">{service.name}</h2>

                  {service.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  {/* Duration + price */}
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{Number(service.price).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/services/${service.id}/book`}
                    className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Book Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Trust signals */}
        <div className="mt-16 border-t pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-semibold mb-1">Certified Technicians</p>
            <p className="text-sm text-muted-foreground">Trained on all major brands of gym equipment</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Transparent Pricing</p>
            <p className="text-sm text-muted-foreground">Fixed service rates - no hidden fees</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Book Online 24/7</p>
            <p className="text-sm text-muted-foreground">No phone calls required</p>
          </div>
        </div>

      </div>
    </div>
  );
}
