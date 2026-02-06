export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform Your
              <br />
              <span className="text-blue-200">Fitness Journey</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Premium gym equipment and expert repair services. Build your dream
              home gym or keep your equipment running like new.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/products"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition text-center"
              >
                Shop Equipment
              </a>
              <a
                href="/appointments"
                className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition border-2 border-blue-400 text-center"
              >
                Book Repair Service
              </a>
            </div>
          </div>

          {/* Right Column - Visual Element */}
          <div className="hidden md:flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">500+</div>
                  <div className="text-sm text-blue-100">Products</div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">10K+</div>
                  <div className="text-sm text-blue-100">Happy Customers</div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">24/7</div>
                  <div className="text-sm text-blue-100">Support</div>
                </div>
                <div className="bg-white/20 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold mb-2">2Y</div>
                  <div className="text-sm text-blue-100">Warranty</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}