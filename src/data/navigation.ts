// data/navigation.ts
// Single source of truth for all navigation menus

export type MenuLink = {
  href: string
  label: string
  variant?: 'default' | 'featured' | 'destructive'
}

export type MenuColumn = {
  title: string
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
      href: '/products/new', 
      label: 'NEW ARRIVALS',
      variant: 'featured'
    },
    { 
      href: '/products/bestsellers', 
      label: 'BEST SELLERS',
      variant: 'featured'
    },
    { 
      href: '/products/sale', 
      label: 'SALE',
      variant: 'destructive'
    },
  ],

  // Right side - Product categories
  columns: [
    {
      title: 'Equipment',
      links: [
        { href: '/products?category=cardio', label: 'Cardio Machines' },
        { href: '/products?category=strength', label: 'Strength Equipment' },
        { href: '/products?category=free-weights', label: 'Free Weights' },
        { href: '/products?category=benches', label: 'Benches & Racks' },
        { href: '/products?category=plates', label: 'Weight Plates' },
      ]
    },
    {
      title: 'Accessories',
      links: [
        { href: '/products?category=mats', label: 'Yoga & Exercise Mats' },
        { href: '/products?category=bands', label: 'Resistance Bands' },
        { href: '/products?category=gloves', label: 'Gloves & Grips' },
        { href: '/products?category=bottles', label: 'Water Bottles' },
        { href: '/products?category=bags', label: 'Gym Bags' },
      ]
    },
    {
      title: 'Recovery',
      links: [
        { href: '/products?category=foam-rollers', label: 'Foam Rollers' },
        { href: '/products?category=massage-guns', label: 'Massage Guns' },
        { href: '/products?category=compression', label: 'Compression Gear' },
        { href: '/products?category=ice-baths', label: 'Ice Baths' },
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