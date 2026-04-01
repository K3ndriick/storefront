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
// Service booking uses database UUIDs (/services/[id]/book) so we
// cannot deep-link to individual services from static nav data.
// All service links route to /services where the customer selects
// and books. Appointment management links to the dashboard.
export const servicesMenuData: MegaMenuData = {
  columns: [
    {
      title: 'What We Offer',
      titleHref: '/services',
      links: [
        { href: '/services', label: 'Equipment Repair' },
        { href: '/services', label: 'Home Installation' },
        { href: '/services', label: 'Equipment Assembly' },
        { href: '/services', label: 'Maintenance Check' },
      ]
    },
    {
      title: 'Bookings',
      links: [
        { href: '/services', label: 'Book an Appointment', variant: 'featured' },
        { href: '/dashboard/appointments', label: 'My Appointments' },
      ]
    },
    {
      title: 'Pricing',
      links: [
        { href: '/services', label: 'View All Services & Pricing' },
      ]
    }
  ]
}