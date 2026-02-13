import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/actions/products';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductInfo } from '@/components/products/product-info';

type ProductPageProps = {
  params: Promise<{ slug: string }>  // Next.js 15 uses Promise
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Extract slug from URL params
  const { slug } = await params;
  
  // Fetch product data
  const product = await getProductBySlug(slug);
  
  // Handle not found
  if (!product) {
    notFound();  // Triggers not-found.tsx
  }
  
  // Render product
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        
        {/* Breadcrumbs - TODO: Add in Phase 4 */}
        
        {/* Product Grid - Image + Info Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* LEFT: Image Gallery */}
          <ProductImageGallery 
            images={product.images}
            productName={product.name}
          />
          
          {/* RIGHT: Product Info */}
          <ProductInfo product={product} />
          
        </div>
        
        {/* Related Products - TODO: Add in Phase 4 */}
        
      </div>
    </div>
  )
}