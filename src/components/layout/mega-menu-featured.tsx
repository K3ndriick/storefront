import Link from 'next/link'

type FeaturedLink = {
  href: string
  label: string
  variant?: 'default' | 'featured' | 'destructive'
}

type MegaMenuFeaturedProps = {
  links: FeaturedLink[]
}

/**
 * Featured links component for mega menus
 * Pure content component - no layout/border concerns
 * 
 * Note: Parent component controls layout, borders, and alignment
 */
export function MegaMenuFeatured({ links }: MegaMenuFeaturedProps) {
  return (
    <div className="flex flex-col">
      <div className="space-y-4">
        {links.map((link) => {
          // Determine styling based on variant
          const baseClasses = "block font-bold transition-all px-4 py-2 rounded-md whitespace-nowrap text-left hover:underline underline-offset-2"
          const variantClasses = 
            link.variant === 'destructive' 
              ? "text-destructive"
              : "text-foreground"
          
          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`${baseClasses} ${variantClasses}`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}