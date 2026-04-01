import Link from 'next/link'
import Image from 'next/image'

export function Hero() {
  return (
    <section className="relative bg-foreground text-background overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-40 md:py-56">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Transform Your Fitness Journey
          </h1>
          <p className="text-lg md:text-xl text-background/80 mb-8">
            Premium gym equipment and expert repair services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="bg-background text-foreground px-8 py-4 rounded-md font-semibold hover:bg-background/90 transition text-center"
            >
              Shop Equipment
            </Link>
            <Link
              href="/services"
              className="bg-transparent border-2 border-background text-background px-8 py-4 rounded-md font-semibold hover:bg-background hover:text-foreground transition text-center"
            >
              Book Repair Service
            </Link>
          </div>
        </div>
      </div>

      {/* Photographer credit */}
      <p className="absolute bottom-3 right-4 z-10 text-xs text-white/40">
        Photo by{' '}
        <a
          href="https://unsplash.com/@anastase"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/70 transition-colors"
        >
          Anastase Maragos
        </a>
        {' '}on Unsplash
      </p>
    </section>
  )
}
