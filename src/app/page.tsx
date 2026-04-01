import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Wrench } from 'lucide-react'
import { ProductGrid } from '@/components/products/product-grid'
import { Hero } from '@/components/layout/hero'
import { getFeaturedProducts } from '@/lib/actions/products'

export const metadata: Metadata = {
  title: 'GymProShop - Premium Gym Equipment & Repair Services',
  description:
    'Shop premium gym equipment and book professional repair services. Treadmills, bikes, weights, and more - delivered to your door.',
  openGraph: {
    title: 'GymProShop - Premium Gym Equipment & Repair Services',
    description:
      'Shop premium gym equipment and book professional repair services. Treadmills, bikes, weights, and more - delivered to your door.',
    type: 'website',
  },
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-accent mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(6)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              Featured Equipment
            </h2>
            <p className="mt-2 text-muted-foreground">
              Premium gym and sports equipment for serious athletes
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
          >
            View all products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No featured products yet</p>
            <p className="text-sm">Check back soon - new equipment is on its way.</p>
          </div>
        )}
      </section>

      {/* Repair Services CTA */}
      <section className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Equipment Repair & Servicing
              </h2>
              <p className="text-background/80 mb-6">
                Professional maintenance and repair services for all types of gym
                equipment. Keep your gear in peak condition with our expert
                technicians.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckIcon />
                  Same-day service available
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  Certified technicians
                </li>
                <li className="flex items-center">
                  <CheckIcon />
                  90-day warranty on all repairs
                </li>
              </ul>
              <Link
                href="/services"
                className="inline-block bg-background text-foreground px-8 py-3 rounded-md font-medium hover:bg-background/90 transition-colors"
              >
                Book Service Appointment
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="bg-background/10 border border-background/20 rounded-lg p-8 text-center">
                <Wrench className="w-16 h-16 mx-auto mb-4 text-background/70" />
                <p className="text-xl font-semibold mb-2">Expert Repairs</p>
                <p className="text-background/70">Treadmills / Bikes / Weights</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
