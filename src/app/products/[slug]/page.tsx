import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/lib/actions/products';
import { getProductReviews, getReviewSummary, hasUserReviewedProduct, getDeliveredOrderIdForProduct } from '@/lib/actions/reviews';
import { createClient } from '@/lib/supabase/server';
import { ProductImageGallery } from '@/components/products/product-image-gallery';
import { ProductInfo } from '@/components/products/product-info';
import { RelatedProducts } from '@/components/products/related-products';
import { ReviewSummary } from '@/components/reviews/review-summary';
import { ReviewList } from '@/components/reviews/review-list';
import { ReviewForm } from '@/components/reviews/review-form';
import { generateProductDetailBreadcrumbs } from '@/lib/utils/breadcrumbs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

type ProductPageProps = {
  params: Promise<{ slug: string }>  // Next.js 15 uses Promise
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const breadcrumbs = generateProductDetailBreadcrumbs(product);

  // Fetch reviews and summary - no auth required
  const [reviews, summary] = await Promise.all([
    getProductReviews(product.id),
    getReviewSummary(product.id),
  ]);

  // Get current user, then check review eligibility conditionally
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [qualifyingOrderId, alreadyReviewed] = user
    ? await Promise.all([
        getDeliveredOrderIdForProduct(product.id),
        hasUserReviewedProduct(product.id),
      ])
    : [null, false];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* Breadcrumbs */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <BreadcrumbItem key={crumb.href}>
                  {!isLast ? (
                    <>
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      <BreadcrumbSeparator />
                    </>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Grid - Image + Info Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <ProductImageGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Reviews Section */}
        <section className="mt-16 border-t pt-12">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Left: summary widget */}
            <div>
              <ReviewSummary summary={summary} />
            </div>

            {/* Right: form + list */}
            <div className="lg:col-span-2 space-y-10">

              {/* Form area - conditional on auth + purchase state */}
              {!user && (
                <p className="text-sm text-muted-foreground">
                  <Link href="/login" className="underline">Log in</Link> to write a review.
                </p>
              )}
              {user && alreadyReviewed && (
                <p className="text-sm text-muted-foreground">You have already reviewed this product.</p>
              )}
              {user && !alreadyReviewed && !qualifyingOrderId && (
                <p className="text-sm text-muted-foreground">Purchase and receive this product to leave a review.</p>
              )}
              {user && !alreadyReviewed && qualifyingOrderId && (
                <ReviewForm productId={product.id} orderId={qualifyingOrderId} />
              )}

              <ReviewList reviews={reviews} />
            </div>

          </div>
        </section>

        {/* Related Products Section */}
        <RelatedProducts currentProduct={product} />

      </div>
    </div>
  )
}
