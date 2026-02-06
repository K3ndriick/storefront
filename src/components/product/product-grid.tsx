'use client';

import { ProductCard } from './product-card';

type Product = {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
  rating: number
  inStock: boolean
}

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}