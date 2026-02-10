// data/navigation.ts
// Single source of truth for all navigation menus

export type MenuLink = {
  href: string
  label: string
  variant?: 'default' | 'featured' | 'destructive'
}

export type MenuColumn = {
  title: string
  titleHref?: string
  links: MenuLink[]
}

export type MegaMenuData = {
  featured?: MenuLink[]
  columns: MenuColumn[]
}

// ============================================
// SHOP MEGA MENU DATA
// ============================================
export const shopMenuData: MegaMenuData = {
  // Left sidebar - Featured links
  featured: [
    { 
      href: '/products?new_arrival=true',
      label: 'NEW ARRIVALS',
      variant: 'featured'
    },
    { 
      href: '/products?bestsellers=true',
      label: 'BEST SELLERS',
      variant: 'featured'
    },
    { 
      href: '/products?onSale=true', 
      label: 'SALE',
      variant: 'destructive'
    },
  ],

  // Right side - Product categories
  columns: [
    {
      title: 'Equipment',
      titleHref: '/products?categories=cardio,strength,weights',
      links: [
        { href: '/products?category=cardio', label: 'Cardio Machines' },
        { href: '/products?category=strength', label: 'Strength Equipment' },
        { href: '/products?category=weights', label: 'Free Weights' },
      ]
    },
    {
      title: 'Accessories',
      titleHref: '/products?category=accessories',
      links: [
        { href: '/products?category=accessories&search=mat', label: 'Yoga & Exercise Mats' },
        { href: '/products?category=accessories&search=band', label: 'Resistance Bands' },
        { href: '/products?category=accessories&search=glove', label: 'Gloves & Grips' },
        { href: '/products?category=accessories&search=bottle', label: 'Water Bottles' },
        { href: '/products?category=accessories&search=bag', label: 'Gym Bags' },
      ]
    },
    {
      title: 'Recovery',
      titleHref: '/products?category=recovery',
      links: [
        { href: '/products?category=recovery&search=foam', label: 'Foam Rollers' },
        { href: '/products?category=recovery&search=massage', label: 'Massage Guns' },
        { href: '/products?category=recovery&search=compression', label: 'Compression Gear' },
      ]
    }
  ]
}

// ============================================
// SERVICES MEGA MENU DATA
// ============================================
export const servicesMenuData: MegaMenuData = {
  columns: [
    {
      title: 'Repair & Maintenance',
      links: [
        { href: '/services/repairs', label: 'Equipment Repairs' },
        { href: '/services/maintenance', label: 'Maintenance Plans' },
        { href: '/services/diagnostics', label: 'Diagnostics' },
        { href: '/services/emergency', label: 'Emergency Service' },
      ]
    },
    {
      title: 'Installation',
      links: [
        { href: '/services/installation/home', label: 'Home Installation' },
        { href: '/services/installation/commercial', label: 'Commercial Setup' },
        { href: '/services/assembly', label: 'Assembly Service' },
      ]
    },
    {
      title: 'Support',
      links: [
        { href: '/services/warranty', label: 'Warranty Info' },
        { href: '/services/book-appointment', label: 'Book Appointment' },
        { href: '/services/service-areas', label: 'Service Areas' },
        { href: '/services/pricing', label: 'Service Pricing' },
      ]
    }
  ]
}