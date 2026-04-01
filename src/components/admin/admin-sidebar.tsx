'use client';

/**
 * AdminSidebar
 *
 * Client Component - needs to be a client component because it uses
 * the usePathname() hook to highlight the currently active nav link.
 * Hooks cannot run in Server Components.
 *
 * Props:
 *   userName - the user's full name (or null), fetched server-side in layout.tsx
 *              and passed down as a prop. We don't fetch it here because that would
 *              require an extra client-side round trip.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Home, Package, Star, Warehouse, Truck, Building2, CalendarDays } from 'lucide-react';

// ============================================================
// NAV ITEMS
// Each item has:
//   href  - the route it links to
//   label - the text shown in the sidebar
//   icon  - a Lucide icon component
// ============================================================

const navItems = [
  { href: '/admin',                  label: 'Dashboard',       icon: Home         },
  { href: '/admin/orders',           label: 'Orders',          icon: ShoppingBag  },
  { href: '/admin/appointments',     label: 'Appointments',    icon: CalendarDays },
  { href: '/admin/products',         label: 'Products',        icon: Package      },
  { href: '/admin/reviews',          label: 'Reviews',         icon: Star         },
  { href: '/admin/inventory',        label: 'Inventory',       icon: Warehouse    },
  { href: '/admin/suppliers',        label: 'Suppliers',       icon: Building2    },
  { href: '/admin/purchase-orders',  label: 'Purchase Orders', icon: Truck        },
  { href: '/admin/users',            label: 'Users',           icon: User         },
];

type Props = {
  userName: string | null;
};

export function AdminSidebar({ userName }: Props) {

  // ============================================================
  // Get the current pathname
  //
  // Call the usePathname() hook and store the result in a variable
  // called `pathname`. This gives you the current URL path as a
  // string, e.g. '/dashboard/orders' or '/dashboard/profile'.
  //
  // You'll use it below to detect which nav item is active.
  // ============================================================

  const pathname = usePathname();


  return (
    <aside className="w-full lg:w-64 shrink-0">

      {/* User greeting */}
      <div className="mb-6 px-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Signed in as</p>
        <p className="font-semibold truncate">{userName ?? 'My Account'}</p>
      </div>

      {/* Nav links */}
      <nav className="grid grid-cols-2 gap-1 lg:grid-cols-1">
        {navItems.map(({ href, label, icon: Icon }) => {

          // ============================================================
          // Determine if this nav item is active
          //
          // A link is "active" when the current page is that link's route.
          // Use pathname (from above) and check if it starts with `href`.
          //
          // Why startsWith and not strict equality (===)?
          //   A future page like /dashboard/orders/abc123 should still
          //   keep the "Orders" link highlighted. startsWith handles that.
          //
          // Store the result in a boolean variable called `isActive`.
          // ============================================================

          const isActive = (href === "/admin")
          ? pathname === href
          : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
