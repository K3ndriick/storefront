import { MegaMenuColumn } from './mega-menu-column'

type MenuLink = {
  href: string
  label: string
}

type MenuColumn = {
  title: string
  links: MenuLink[]
}

type MegaMenuGridProps = {
  columns: MenuColumn[]
  centered?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

/**
 * Flexible grid layout for mega menu columns
 * Automatically adjusts column count based on data
 */
export function MegaMenuGrid({ 
  columns, 
  centered = false,
  maxWidth = 'full' 
}: MegaMenuGridProps) {
  // Determine grid columns based on number of items (max 4)
  const gridCols = Math.min(columns.length, 4)
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[gridCols] || 'grid-cols-3'

  // Container max width options
  const maxWidthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    full: 'w-full',
  }[maxWidth]

  // Wrapper classes for centering
  const wrapperClasses = centered ? 'flex justify-center' : ''
  
  return (
    <div className={wrapperClasses}>
      <div className={`grid ${gridClasses} gap-8 ${maxWidthClasses}`}>
        {columns.map((column) => (
          <MegaMenuColumn 
            key={column.title}
            title={column.title}
            links={column.links}
          />
        ))}
      </div>
    </div>
  )
}