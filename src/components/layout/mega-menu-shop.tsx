import { MegaMenuContainer } from './mega-menu-container'
import { MegaMenuFeatured } from './mega-menu-featured'
import { MegaMenuGrid } from './mega-menu-grid'
import { shopMenuData } from '@/data/navigation'

/**
 * Shop mega menu - Refactored to use composition
 * Features: Left sidebar with featured links + 3-column product grid
 * 
 * Layout: 4/8 column split for better visual balance
 * Border: Positioned at 33% for optical centering
 */
export function MegaMenuShop() {
  return (
    <MegaMenuContainer>
      <div className="flex gap-8">
        {/* Featured sidebar - 4 columns (33% width) for better balance */}
        {shopMenuData.featured && (
          <div className="flex-shrink-0 border-r pr-8">
            <MegaMenuFeatured links={shopMenuData.featured} />
          </div>
        )}
        
        {/* Product categories grid - 8 columns (67% width) */}
        <div className="flex-1">
          <MegaMenuGrid columns={shopMenuData.columns} />
        </div>
      </div>
    </MegaMenuContainer>
  )
}