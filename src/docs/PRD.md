# Product Requirements Document (PRD)

**Project:** GymProShop - E-Commerce & Business Management Platform
**Document Version:** 1.0
**Created:** March 17, 2026
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Personas](#user-personas)
5. [Feature Requirements](#feature-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Constraints](#technical-constraints)
8. [Out of Scope](#out-of-scope)
9. [Dependencies](#dependencies)
10. [Risks & Mitigations](#risks--mitigations)

---

## Executive Summary

GymProShop is a full-stack e-commerce and business management platform built for a single-owner gym equipment retail and repair shop. The business currently operates entirely offline — pen-and-paper inventory, handwritten appointment books, manual receipts — with no digital presence.

This platform digitises every aspect of the business: online product sales, equipment repair bookings, inventory management, customer records, and owner administration. The end result is a professional storefront that competes with established online retailers while preserving the personal, local-service quality that differentiates the business.

---

## Problem Statement

The client operates a profitable gym equipment retail and repair business with zero digital infrastructure. This creates compounding problems:

- **Sales are capped by physical hours.** No online channel means revenue stops at closing time.
- **Customers can't browse before visiting.** Product discovery requires a physical trip to the shop.
- **Inventory is invisible in real time.** Stock errors, oversells, and missed reorders happen regularly.
- **Service bookings require a phone call during business hours.** 30% of revenue is constrained to a single booking channel.
- **No customer data is captured digitally.** There is no purchase history, no way to follow up, no loyalty mechanism.
- **Owner has no business visibility remotely.** Sales, stock levels, and appointments can only be checked in-person.

---

## Goals & Success Metrics

### Launch Goals (0-3 months post-launch)

| Goal | Metric |
|------|--------|
| Website live and functional | All 10 phases deployed to production |
| Products online | 50+ SKUs listed with images and descriptions |
| First online sale | 1 completed order via Stripe |
| Service bookings | 10 online appointments booked |
| Zero data loss | All critical data migrated from Excel/paper |

### Growth Goals (3-6 months)

| Goal | Metric |
|------|--------|
| Online sales penetration | 20% of total revenue via website |
| Customer registrations | 100+ accounts created |
| Service bookings | 50+ online bookings per month |
| Inventory accuracy | 100% stock levels match digital records |
| Owner autonomy | Owner managing system independently |

### Maturity Goals (6-12 months)

| Goal | Metric |
|------|--------|
| Online sales penetration | 40% of total revenue via website |
| Customer base | 500+ registered customers |
| Repeat purchases | Measurable repeat purchase rate |
| Inventory automation | Low-stock alerts triggering reorders |

---

## User Personas

### Persona 1: Shop Owner (Administrator)

- **Role:** Business owner, sole operator
- **Age:** 45-60
- **Tech comfort:** Low-medium (email, Excel, social media)
- **Primary device:** Desktop in-shop + mobile on-the-go

**Needs:**
- Simple, intuitive admin interface requiring minimal training
- At-a-glance sales and stock dashboard accessible from phone
- Self-service product, order, and appointment management
- No dependency on developer for routine operations

**Pain points today:**
- Loses paper records; has no searchable history
- Can't check stock or sales when away from the shop
- Misses follow-up opportunities because customer data isn't captured
- Manual stock counts consume hours weekly

---

### Persona 2: Product Customer (Home Gym Enthusiast)

- **Age:** 25-45
- **Tech comfort:** Medium-high
- **Behaviour:** Researches online before buying, price-conscious, compares specs

**Needs:**
- Browse and filter product catalog at any hour
- Detailed product specs and images before purchase
- Transparent pricing including shipping
- Order history and tracking post-purchase

**Pain points today:**
- Must visit the shop to see what's in stock
- Shop closes at 6pm — no after-hours purchases possible
- Can't compare products side by side

---

### Persona 3: Service Customer (Equipment Owner)

- **Age:** 30-55
- **Tech comfort:** Varies (low to high)
- **Behaviour:** Reacts to equipment breakdowns, values convenience and transparency

**Needs:**
- Book repair or installation appointments online, 24/7
- Know pricing before booking
- Automated appointment reminders
- Service history for warranty/repeat repairs

**Pain points today:**
- Must call during business hours to book
- No reminder system; relies on memory
- No record of previous repairs or parts used

---

## Feature Requirements

Features are organised by implementation phase. Phases 1-6 are complete or near-complete.

---

### Phase 0: Project Setup - COMPLETE

- Next.js 16 App Router, TypeScript, Tailwind CSS v3
- shadcn/ui component library configured
- Supabase project (PostgreSQL database, auth, storage)
- Git version control, ESLint

---

### Phase 1: Homepage & Navigation - COMPLETE

**Customer-facing:**
- Sticky header with logo, mega menu navigation, search icon, user account menu, cart badge
- Mobile hamburger menu
- Hero section with primary CTA ("Shop Equipment") and secondary CTA ("Book Repair")
- Featured products section (6 products from database)
- Repair Services promotional section
- Footer with links (shop, services, support, social)

**Design system:**
- Black/white dominant with teal accent (used <5% of UI)
- System fonts, 3-column max product grid, sharp image corners
- CSS variable-based theming via globals.css

---

### Phase 2A: Product Catalog (Server-Side) - COMPLETE

**Database:**
- Products table (21 fields): name, slug, description, price, sale_price, images, category, brand, SKU, stock_quantity, low_stock_threshold, in_stock, featured flags
- 50 products seeded across 5 categories
- Full-text search, RLS, indexes

**Pages & features:**
- Products listing page (`/products`) with URL-driven category filter
- Product detail page (`/products/[slug]`) with image gallery, specs, Add to Cart
- Breadcrumb navigation
- Loading skeleton states
- Related products section (same category)

---

### Phase 2B: Client-Side Filtering - COMPLETE

**Filter capabilities:**
- Sort by: relevance, price asc/desc, newest, name
- Price range slider (dual handle, $0-$5,000, $50 increments)
- Category multi-select
- Brand multi-select
- In Stock toggle
- On Sale toggle
- Active filter count badge

**Implementation:**
- Zustand filter store with localStorage persistence
- Client-side filtering via useMemo (no server round-trips)
- URL param for category (SSR-compatible, SEO-friendly)

---

### Phase 3: Shopping Cart - COMPLETE

**Cart functionality:**
- Add to cart from product detail page
- Persistent cart via Zustand + localStorage
- Quantity controls (+/- with validation)
- Remove individual items
- Clear entire cart
- Real-time cart badge in header

**Business logic:**
- Sale price handling (uses sale_price when active)
- Max quantity: lower of stock_quantity or 10
- Tax: 10% of subtotal
- Shipping: $50 flat, free on orders over $1,000
- Free shipping progress indicator

---

### Phase 4: User Authentication - COMPLETE

**Auth flows:**
- Email/password registration with Supabase Auth
- Email confirmation (Mailtrap SMTP in development)
- Login with redirect to original destination
- Forgot password / reset password via email link
- Password change (authenticated users)
- Sign out

**Route protection:**
- `proxy.ts` (Next.js 16 edge middleware) protects `/checkout`, `/dashboard`
- Auth pages redirect to `/` if already authenticated

**User profile:**
- `profiles` table mirrors auth.users with full_name, phone, avatar_url
- Profile auto-created on signup via Supabase trigger

---

### Phase 5: Checkout & Payments - COMPLETE

**Checkout flow:**
1. Cart review
2. Login gate (redirect to login if unauthenticated)
3. Shipping address form (name, email, phone, full address)
4. Stripe payment form (card details via Stripe Elements)
5. Order created in database
6. Success confirmation page

**Stripe integration:**
- AUD currency, AU country
- Client-side PaymentIntent flow
- Test mode (4242 4242 4242 4242)

**Orders:**
- `orders` table: order_number (unique), status, subtotal/tax/shipping/total, full shipping address snapshot, stripe_payment_intent_id
- `order_items` table: product_name/price snapshot at time of order, quantity
- RLS: users see only their own orders
- Stock decremented atomically via `reduce_stock()` Supabase function
- Cart cleared on successful payment

---

### Phase 6: User Dashboard - PARTIALLY COMPLETE (~80%)

**Implemented:**
- Dashboard layout with sidebar navigation (`/dashboard`)
- Orders page: order history list with status badges, clickable to detail
- Order detail page: items, totals, shipping address (`/dashboard/orders/[id]`)
- Profile page: edit full name, phone; email read-only
- Settings page: change password form
- Responsive sidebar navigation with active state highlighting

**Not yet implemented:**
- Saved addresses management (`/dashboard/addresses`)

---

### Phase 7: Product Reviews - PLANNED

**Requirements:**
- Star rating (1-5) and written review per product per user
- Verified purchase badge (linked to order)
- Admin moderation queue (pending/approved/rejected)
- Review summary with average rating and distribution bar chart
- Reviews displayed on product detail pages

**Database:** `reviews` table with RLS — anyone sees approved reviews; only owner edits own review.

---

### Phase 8: Appointment Booking - PLANNED

**Requirements:**
- Service catalog page listing repair/installation services with pricing and duration
- Date picker → available time slot picker → customer detail form
- Booking confirmation email (automated)
- Appointment reminders (24h before)
- Customer appointment history in dashboard
- Admin appointment calendar

**Database:** `services` table, `appointments` table with date/time, status, customer and equipment details.

**Business context:** Represents ~30% of total revenue. Available time slots generated 9AM-5PM in 30-minute increments minus existing bookings.

---

### Phase 9: Admin Dashboard - PLANNED

**Access control:** Role-based — `profiles.role = 'admin'` required.

**Modules:**
- Analytics overview: revenue, orders, pending items, low stock alerts
- Product management: full CRUD, image upload, stock updates, featured flags
- Order management: view all orders, update status (pending/processing/shipped/delivered/cancelled)
- Appointment management: view/confirm/complete/cancel bookings
- Review moderation: approve/reject pending reviews
- User management: view customer list, basic account actions

---

### Phase 10: Inventory Management - PLANNED

**Requirements:**
- Low stock alert dashboard (products below `low_stock_threshold`)
- Manual stock adjustment form with reason logging
- Full stock history/audit log
- Supplier management (CRUD)
- Purchase orders: create PO, add line items, mark as received (auto-increments stock)

**Database:** `stock_adjustments`, `suppliers`, `purchase_orders`, `purchase_order_items` tables.

---

## Non-Functional Requirements

### Performance
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Achieved via: system fonts (no download), CSS variables, Next.js server components, optimised images (WebP)

### Security
- PCI DSS compliance via Stripe (card data never touches our server)
- Row Level Security (RLS) on all Supabase tables
- Auth tokens verified server-side via `getUser()` (not `getSession()`)
- HTTPS enforced on all environments
- Environment variables for all secrets (never committed)

### Accessibility
- WCAG AA compliance target
- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support

### Responsiveness
- Mobile-first design
- Tested breakpoints: 320px, 640px, 768px, 1024px, 1280px
- Mobile hamburger menu for navigation
- Touch-friendly interactive elements

### Browser Support
- Modern browsers: Chrome, Firefox, Safari, Edge (last 2 versions)
- No IE11 support required

---

## Technical Constraints

| Constraint | Detail |
|------------|--------|
| Framework | Next.js 16 App Router (cannot downgrade) |
| Database | Supabase (PostgreSQL) — already provisioned |
| Auth | Supabase Auth — email/password only at launch |
| Payments | Stripe — AUD, card payments only at launch |
| Hosting | Vercel (planned) |
| Email (dev) | Mailtrap SMTP — switch to Resend/SendGrid for production |
| Owner tech literacy | Admin UI must be operable by non-technical user |
| Budget | Small business — open-source preferred, costs minimised |

---

## Out of Scope

The following are explicitly excluded from this project:

- **In-store POS integration** — physical register remains separate
- **PayPal / buy-now-pay-later** — Stripe card payments only at launch
- **Social login** (Google, Facebook) — email/password only
- **Two-factor authentication** — post-launch enhancement
- **Multi-location support** — single shop only
- **B2B / wholesale pricing** — future consideration
- **Marketplace integrations** (eBay, Amazon) — not planned
- **Native mobile app** — responsive web only
- **Real-time chat / live support** — not in scope
- **Automatic tax calculation by jurisdiction** — flat 10% GST only

---

## Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Supabase project | External service | Already provisioned; production tier required for launch |
| Stripe account | External service | Test mode active; switch to live mode pre-launch |
| Mailtrap / Resend | External service | Mailtrap for dev; production email provider TBD |
| Vercel | Hosting | Free tier sufficient initially |
| Domain name | Client procurement | Client to register domain before launch |
| Product photography | Content | Client responsible for product images (min 800px) |
| Product data | Content | 200-500 SKUs to be entered post-launch (50 seeded for dev) |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stripe webhook missing — orders lost if browser closes during payment | High | High | Implement webhook handler (flagged in post-phase-5-tasks.md) |
| Inventory overselling — two customers buy last item simultaneously | Medium | Medium | Implement stock reservation during checkout (flagged in post-phase-5-tasks.md) |
| Owner adoption failure — too complex for low-tech user | Medium | High | Keep admin UI simple; provide written guides and video walkthroughs |
| Data loss during paper-to-digital migration | Low | High | Parallel systems during transition; validate all migrated data before cutover |
| Email deliverability issues at launch | Medium | Medium | Configure SPF/DKIM/DMARC; switch from Mailtrap to production email (Resend) |
| Payment disputes / chargebacks | Low | Medium | Stripe Radar fraud tools enabled by default; clear refund policy on site |

---

**Document Owner:** Development Team
**Last Updated:** March 17, 2026
**Review Cadence:** Updated at each phase completion
