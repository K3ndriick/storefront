import { ReactNode } from 'react'

type MegaMenuContainerProps = {
  children: ReactNode
}

/**
 * Base container for all mega menus
 * Handles positioning, visibility, transitions, and hover behavior
 * No gap between navbar and menu (gap issue fixed)
 */
export function MegaMenuContainer({ children }: MegaMenuContainerProps) {
  return (
    <div 
      className="absolute top-0 left-0 right-0 
        before:content-[''] before:absolute before:h-4 before:-top-4 
        before:left-0 before:right-0 before:bg-transparent
        opacity-0 invisible 
        group-hover:opacity-100 group-hover:visible 
        transition-all duration-200 
        pointer-events-none group-hover:pointer-events-auto"
    >
      {/* Full-width background with border-t for subtle separation */}
      <div className="w-full bg-background shadow-lg border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}