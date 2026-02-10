import { getProducts } from '@/lib/actions/products';
import { ProductCard } from '@/components/product/product-card';

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            All Products
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Showing {products.length} products
          </p>
        </div>

        {/* Product Grid */}
        {/* Design Rule #1: Max 3 columns on desktop, generous gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Pass the product data to ProductCard component */}
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State - Show if no products */}
        {products.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No products found.</p>
        </div>
        )}

      </div>
    </div>
  )
}