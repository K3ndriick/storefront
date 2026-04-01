import Link from 'next/link';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import { Github, Globe } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-24">

        <div className="space-y-8">

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Portfolio Project</p>
            <h1 className="text-4xl font-bold">PowerProShop</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              This is a full-stack e-commerce and business management platform built as a real-world development project.
              It is not a live commercial store.
            </p>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">What was built</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">E-commerce</span> - product catalog, filtering, cart, Stripe checkout, order history</li>
              <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Auth</span> - email/password login, signup, password reset via Supabase Auth</li>
              <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Appointments</span> - service catalog, real-time slot availability, online booking, email confirmations</li>
              <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Dashboard</span> - order history, appointment management, saved addresses, profile settings</li>
              <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Admin</span> - analytics, product CRUD, order management, appointment queue, review moderation</li>
              <li className="flex gap-2"><span className="text-foreground font-medium shrink-0">Inventory</span> - stock adjustments, audit log, suppliers, purchase orders, checkout reservations</li>
            </ul>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">Tech stack</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>Next.js 16 (App Router)</span>
              <span>TypeScript</span>
              <span>Supabase (PostgreSQL + Auth)</span>
              <span>Stripe Payments</span>
              <span>Tailwind CSS v3</span>
              <span>shadcn/ui + Radix</span>
              <span>Zustand</span>
              <span>Nodemailer (Mailtrap)</span>
            </div>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">Pages not yet built</h2>
            <p className="text-sm text-muted-foreground">
              The following pages are intentionally out of scope for this build and would be completed pre-launch
              for a real deployment: Contact, FAQ, Shipping &amp; Returns, Privacy Policy, Terms of Service, Cookie Policy.
            </p>
          </div>

          <div className="border-t pt-8 space-y-4">
            <h2 className="font-semibold text-lg">Built by</h2>
            <p className="text-sm text-muted-foreground">
              Kendriick - self-taught developer building full-stack web applications with Next.js, TypeScript, and Supabase.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/kenjc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
              <a
                href="https://yourportfolio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Globe className="w-4 h-4" />
                Portfolio
              </a>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              View the Store
            </Link>
            <Link
              href="/products"
              className="border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Browse Products
            </Link>
            <Link
              href="/services"
              className="border px-5 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
            >
              Book a Service
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
