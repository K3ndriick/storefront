import { getProducts } from '@/lib/actions/products';
import { FilteredProductList } from '@/components/products/filtered-product-list';
import { ProductFilters } from '@/components/products/product-filters';
import { ProductSort } from '@/components/products/product-sort';
import { ProductCard } from '@/components/products/product-card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { generateProductBreadcrumbs } from '@/lib/utils/breadcrumbs';
import type { ProductCategory } from '@/lib/types/products';

type SearchParams = {
  category?: ProductCategory,
  categories?: string,
  search?: string,
  sortBy?: string,
  new_arrival?: string,
  bestseller?: string,
  onSale?: string,
  inStockOnly?: string,
}

type ProductsPageProps = {
  searchParams: Promise<SearchParams>  // ← Changed to Promise
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams first
  const params = await searchParams;
  
  // Parse URL parameters into filter object
  // SERVER-SIDE filters (from URL)
  const filters = {
    category: params.category,
    categories: params.categories 
      ? params.categories.split(',') as ProductCategory[]
      : undefined,
    search: params.search,
    sortBy: params.sortBy as any,
    featured: params.new_arrival === 'true' ? true : undefined,
    inStockOnly: params.inStockOnly === 'true' ? true : undefined,
    onSale: params.onSale === 'true' ? true : undefined,
  }
  
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value !== undefined)
  );
  
  // fetch products from DB
  const products = await getProducts(activeFilters);
  
  // Generate breadcrumbs
  const breadcrumbs = generateProductBreadcrumbs(params);
  
  // Page title
  const getPageTitle = () => {
    if (params.new_arrival === 'true') return 'New Arrivals';
    if (params.bestseller === 'true') return 'Best Sellers';
    if (params.onSale === 'true') return 'Sale';
    if (params.category) {
      return params.category.charAt(0).toUpperCase() + params.category.slice(1);
    }
    if (params.categories) {
      return 'Equipment';
    }
    if (params.search) return `Search: "${params.search}"`
    return 'All Products';
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            {getPageTitle()}
          </h1>
          
          {/* Breadcrumbs */}
          <Breadcrumb className="mt-4">
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                
                return (
                  <BreadcrumbItem key={crumb.href}>
                    {!isLast ? (
                      <>
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
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
          
          {/* Server-Side Active Filters (URL-based) */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {params.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground">
                  Category: {params.category}
                </span>
              )}
              {params.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground">
                  Search: {params.search}
                </span>
              )}
              {params.onSale === 'true' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-destructive text-destructive-foreground">
                  On Sale
                </span>
              )}
            </div>
          )}
        </div>

        {/* ==================== MAIN LAYOUT: SIDEBAR + PRODUCTS ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ==================== FILTERS SIDEBAR (Desktop) ==================== */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters />
            </div>
          </aside>

          {/* ==================== PRODUCTS SECTION ==================== */}
          <div className="lg:col-span-3">
            
            {/* Controls Bar: Count + Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b">
              {/* Product Count */}
              <p className="text-lg text-muted-foreground">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </p>

              {/* Sort Dropdown */}
              <ProductSort />
            </div>

            {/* Uncomment when you want to add mobile filters */}
            {/* <div className="lg:hidden mb-6">
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div> */}

            {/* Filtered Product Grid */}
            <FilteredProductList
              products={products}
            />
            
          </div>
        </div>
      </div>
    </div>
  )
}