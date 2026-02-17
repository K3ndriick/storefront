import { ProductGrid } from '@/components/products/product-grid'
import { Hero } from '@/components/layout/hero'
import { CategoryNav } from '@/components/layout/category-nav'
import { getFeaturedProducts } from '@/lib/actions/products'

// Mock data - will replace with Supabase later
const featuredProducts = await getFeaturedProducts(6);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Category Navigation */}
      <CategoryNav />

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Equipment
            </h2>
            <p className="mt-2 text-gray-600">
              Premium gym and sports equipment for serious athletes
            </p>
          </div>
          <a
            href="/products"
            className="hidden sm:block text-blue-600 hover:text-blue-700 font-medium"
          >
            View all products →
          </a>
        </div>

        <ProductGrid products={featuredProducts} />
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
                  <svg
                    className="w-5 h-5 text-accent mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Same-day service available
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-accent mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Certified technicians
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-accent mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  90-day warranty on all repairs
                </li>
              </ul>
              <a
                href="/appointments"
                className="inline-block bg-background text-foreground px-8 py-3 rounded-md font-medium hover:bg-background/90 transition-colors"
              >
                Book Service Appointment
              </a>
            </div>
            <div className="hidden md:block">
              <div className="bg-background/10 border border-background/20 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">🔧</div>
                <p className="text-xl font-semibold mb-2">Expert Repairs</p>
                <p className="text-background/70">Treadmills • Bikes • Weights</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}