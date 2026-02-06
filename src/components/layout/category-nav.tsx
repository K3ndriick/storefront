const categories = [
  { name: 'All', href: '/products', icon: '🏋️' },
  { name: 'Cardio', href: '/products?category=cardio', icon: '🏃' },
  { name: 'Strength', href: '/products?category=strength', icon: '💪' },
  { name: 'Accessories', href: '/products?category=accessories', icon: '🎒' },
  { name: 'Recovery', href: '/products?category=recovery', icon: '🧘' },
  { name: 'Nutrition', href: '/products?category=nutrition', icon: '🥤' },
]

export function CategoryNav() {
  return (
    <section className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.href}
              className="group flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md transition border border-gray-200 hover:border-blue-300"
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}