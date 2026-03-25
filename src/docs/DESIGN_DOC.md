# 🎨 GymProShop Design System v1.0

**Last Updated:** February 7, 2026  
**Status:** Production Ready

---

## 📋 Table of Contents
1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Design Rules](#design-rules)
5. [Component Patterns](#component-patterns)
6. [Navigation Patterns](#navigation-patterns)
7. [Form Patterns](#form-patterns)
8. [Status Badges](#status-badges)

---

## 🎨 Color System

### **Philosophy**
Following Nike, Adidas, Lululemon, Gymshark pattern:
- **Black & White dominant** (95% of the UI)
- **ONE accent color** (teal) used sparingly (5% of UI)
- **Red** only for sales/errors

### **CSS Variables** (`app/globals.css`)

```css
:root {
  /* Backgrounds */
  --background: 0 0% 100%;              /* White #FFFFFF */
  --foreground: 0 0% 9%;                /* Black #171717 */
  
  /* Primary (Black buttons, headers) */
  --primary: 0 0% 9%;                   /* #171717 */
  --primary-foreground: 0 0% 98%;       /* White */
  
  /* Accent (Teal - MINIMAL USE) */
  --accent: 180 58% 41%;                /* Teal #2B9DAA */
  --accent-foreground: 0 0% 98%;        /* White */
  
  /* Muted (Subtle elements) */
  --muted: 0 0% 96%;                    /* Light gray #F5F5F5 */
  --muted-foreground: 0 0% 46%;         /* Mid gray #757575 */
  
  /* Borders */
  --border: 0 0% 90%;                   /* #E5E5E5 */
  
  /* Destructive (Sales, Errors) */
  --destructive: 0 84% 60%;             /* Red #EF4444 */

  /* Success (Inline positive feedback text only) */
  --success: 140 64% 22%;               /* Dark green */
}
```

### **Usage Rules**

| Element | Class | When to Use |
|---------|-------|-------------|
| **Primary Buttons** | `bg-primary text-primary-foreground` | Add to Cart, Checkout, Submit |
| **Text** | `text-foreground` | All body text, headings |
| **Links** | `text-foreground hover:text-accent` | Navigation links |
| **Link Underline** | `border-b-2 border-accent` | Active nav state |
| **Badges** | `bg-accent text-accent-foreground` | Cart count (2), "New" badge |
| **Icons (small)** | `text-accent` | Checkmarks, notification dots |
| **Sale Tags** | `bg-destructive text-destructive-foreground` | SALE, -50% OFF |
| **Success Text** | `text-success` | Inline confirmation ("Profile updated", "FREE") |
| **Disabled** | `bg-muted text-muted-foreground` | Disabled buttons |

### **Accent Color Restrictions**
✅ **ALLOWED:**
- Cart notification badge
- Link hover states
- Small checkmark icons
- Active navigation underline
- Progress indicators

❌ **FORBIDDEN:**
- Primary buttons (use black)
- Large backgrounds
- Headings
- Product cards
- Hero sections

---

## 📝 Typography

### **Font Stack**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

**Reasoning:**
- ✅ System fonts = fastest load time
- ✅ Native to each OS = familiar feel
- ✅ No external requests
- ✅ Nike/Adidas use system fonts
- ✅ Professional, clean appearance

### **Type Scale**

```css
/* Headings */
.text-6xl    /* 60px - Hero only */
.text-5xl    /* 48px - Page headers */
.text-4xl    /* 36px - Section headers */
.text-3xl    /* 30px - Subsection headers */
.text-2xl    /* 24px - Card titles, prices */
.text-xl     /* 20px - Large body */
.text-lg     /* 18px - Emphasized text */

/* Body */
.text-base   /* 16px - Default body */
.text-sm     /* 14px - Secondary text */
.text-xs     /* 12px - Captions, labels */
```

### **Font Weights**

```css
.font-normal    /* 400 - Body text */
.font-medium    /* 500 - Emphasized body */
.font-semibold  /* 600 - Subheadings, links */
.font-bold      /* 700 - Headings */
```

**Usage:**
- Body text: `font-normal` (400)
- Navigation: `font-medium` (500)
- Product names: `font-semibold` (600)
- Headers: `font-bold` (700)

### **Line Height**

```css
.leading-tight    /* 1.25 - Headings */
.leading-normal   /* 1.5 - Body text */
.leading-relaxed  /* 1.625 - Long-form content */
```

### **Letter Spacing**

```css
.tracking-tight   /* -0.025em - Large headings */
.tracking-normal  /* 0 - Default */
.tracking-wide    /* 0.025em - All caps labels */
```

### **Typography Examples**

```tsx
// Page Header
<h1 className="text-5xl font-bold leading-tight tracking-tight">
  Transform Your Fitness Journey
</h1>

// Section Header
<h2 className="text-3xl font-bold mb-4">
  Featured Products
</h2>

// Product Name
<h3 className="text-lg font-semibold">
  Professional Treadmill Pro X3000
</h3>

// Body Text
<p className="text-base leading-normal text-foreground">
  Premium gym equipment for home and professional use.
</p>

// Caption / Category
<p className="text-xs uppercase tracking-wide text-muted-foreground">
  Cardio Equipment
</p>

// Price
<span className="text-2xl font-bold">$1,299.99</span>
```

---

## 📐 Spacing System

### **Scale**
Based on Tailwind's 4px base unit:

```
2  = 8px   (tight spacing)
4  = 16px  (default)
6  = 24px  (comfortable)
8  = 32px  (section breaks)
12 = 48px  (major sections)
16 = 64px  (page sections)
24 = 96px  (hero sections)
```

### **Component Spacing**

```tsx
// Card Padding
className="p-4"              // Mobile: 16px
className="sm:p-6"           // Desktop: 24px

// Section Padding
className="py-16 lg:py-24"   // Vertical: 64px → 96px

// Grid Gaps
className="gap-6 lg:gap-8"   // 24px → 32px

// Stack (vertical)
className="space-y-4"        // 16px between items
className="space-y-8"        // 32px between sections
```

### **Container Width**

```tsx
// Standard container
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Max widths:
// max-w-7xl = 1280px (standard)
// max-w-6xl = 1152px (narrow)
// max-w-5xl = 1024px (content)
```

---

## 🎯 Design Rules

### **Rule 1: Strategic White Space**
**"Breathe Between Every Element"**

```tsx
// Product Grid - MAX 3 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

// Section Spacing
<section className="py-16 lg:py-24">
  <div className="mb-12">...</div>  {/* Header */}
  <div className="gap-8">...</div>  {/* Content */}
</section>
```

**Principles:**
- Never more than 3 columns on desktop
- Generous gaps (8 = 32px minimum)
- Large section padding (py-16+)

### **Rule 2: Content-First Hierarchy**
**"Images Tell the Story"**

```tsx
// Product Card - 80% image, 20% text
<div className="aspect-square">  {/* Image */}
  <Image fill className="object-cover" />
</div>
<div className="p-4">           {/* Text - minimal */}
  <h3 className="line-clamp-2">...</h3>
</div>
```

**Principles:**
- Always use `aspect-square` for products
- Minimal text overlay
- Dark gradients for readability
- High-quality images (min 800px)

### **Rule 3: Geometric Precision**
**"Sharp Where It Matters, Soft Where It Doesn't"**

```tsx
// Border Radius
.rounded-none  // Product images (sharp)
.rounded-md    // Buttons, inputs (6px)
.rounded-lg    // Cards (8px)
.rounded-full  // Badges, pills
```

**Principles:**
- Product images: Sharp corners (`rounded-none`)
- Cards: Subtle rounds (`rounded-lg`)
- Buttons: Geometric (`rounded-md`)
- Badges: Full rounds (`rounded-full`)

---

## 🧩 Component Patterns

### **Button Hierarchy**

```tsx
// Primary Action (Black)
<button className="bg-primary text-primary-foreground px-8 py-3 rounded-md 
                   font-medium hover:bg-primary/90 transition-colors">
  Add to Cart
</button>

// Secondary Action (Outline)
<button className="border-2 border-primary text-foreground px-8 py-3 rounded-md
                   font-medium hover:bg-primary hover:text-primary-foreground 
                   transition-colors">
  Learn More
</button>

// Tertiary (Ghost)
<button className="text-foreground hover:text-accent transition-colors">
  View All →
</button>
```

### **Product Card**

```tsx
<Link href={`/products/${slug}`} 
      className="group block border rounded-lg overflow-hidden 
                 hover:shadow-lg transition-shadow">
  
  {/* Image - 80% of card */}
  <div className="aspect-square bg-secondary overflow-hidden">
    <Image 
      fill 
      className="object-cover group-hover:scale-105 transition-transform duration-300"
    />
  </div>
  
  {/* Content - 20% of card */}
  <div className="p-4">
    <p className="text-xs uppercase text-muted-foreground">Category</p>
    <h3 className="font-semibold group-hover:text-accent transition-colors line-clamp-2">
      Product Name
    </h3>
    <span className="text-2xl font-bold">$299.99</span>
  </div>
</Link>
```

### **Link Styling**

```tsx
// Navigation Link
<a href="/products" 
   className="text-foreground hover:text-accent transition-colors">
  Shop
</a>

// Underlined Link
<a href="/products" 
   className="text-foreground hover:text-accent underline-offset-4 hover:underline">
  View All Products →
</a>

// Active Nav (Lululemon-style underline)
<a href="/products" 
   className="text-foreground border-b-2 border-accent">
  Shop
</a>
```

---

## 🧭 Navigation Patterns

### **Header Structure**

```tsx
// Sticky Header - NO transparency
<header className="sticky top-0 z-50 w-full border-b bg-background">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      {/* Logo | Navigation | Actions */}
    </div>
  </div>
</header>
```

**Key Points:**
- ❌ NO `bg-background/95` transparency
- ✅ Solid `bg-background`
- ✅ Sticky positioning
- ✅ Border bottom for separation

### **Mega Menu Pattern**

Following Salomon/Reebok:

```tsx
// On Hover - Show Mega Menu
<div className="group relative">
  <button className="relative py-2">
    Shop
    {/* Underline on hover */}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent 
                     group-hover:w-full transition-all duration-300" />
  </button>
  
  {/* Mega Menu */}
  <div className="absolute top-full left-0 w-screen bg-background border-t 
                  opacity-0 invisible group-hover:opacity-100 
                  group-hover:visible transition-all">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Multi-column layout */}
    </div>
  </div>
</div>
```

### **Nav Items**

**Primary Navigation:**
- Shop (mega menu)
- Services (mega menu) 
- Contact (no menu)

**Secondary (right side):**
- Search
- Account
- Cart (with badge)

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
default:  320px+  (mobile)
sm:       640px+  (tablet)
md:       768px+  (small desktop)
lg:       1024px+ (desktop)
xl:       1280px+ (large desktop)
```

### **Grid Patterns**

```tsx
// Products
grid-cols-1           // Mobile: 1 column
sm:grid-cols-2        // Tablet: 2 columns
lg:grid-cols-3        // Desktop: 3 columns (MAX)

// Categories
grid-cols-2           // Mobile: 2 columns
sm:grid-cols-3        // Tablet: 3 columns
lg:grid-cols-5        // Desktop: 5 columns
```

---

## Form Patterns

### **Field Structure**

Every form field follows the same vertical stack:

```tsx
<div className="space-y-1">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" {...register('email')} />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email.message}</p>
  )}
</div>
```

- `space-y-1` between label, input, and error
- Error messages: `text-sm text-destructive` (red, never custom colors)
- Labels: default weight (`font-normal`) -no bolding

### **Form Spacing**

```tsx
// Single-column form (auth pages)
<form className="space-y-4">

// Multi-column form (checkout, profile)
<div className="grid gap-4 md:grid-cols-2">
  <div className="space-y-1">...</div>  {/* Half-width field */}
  <div className="md:col-span-2 space-y-1">...</div>  {/* Full-width field */}
</div>
```

### **Submit Button**

Always full-width, always disabled during submission:

```tsx
<Button type="submit" className="w-full" disabled={isSubmitting}>
  {isSubmitting ? 'Signing in...' : 'Sign in'}
</Button>
```

### **Input Styles**

Inputs use the shadcn `<Input>` component which applies:
- `border-input` border color (CSS variable)
- `focus-visible:ring-1 focus-visible:ring-ring` focus state
- `rounded-md` border radius (consistent with buttons)
- `disabled:opacity-50` disabled state

Never style inputs with raw `border-gray-300` or custom focus colors -always use the `<Input>` component.

### **Form Card Wrapper**

Forms on standalone pages (checkout, auth) sit inside a card:

```tsx
<form className="space-y-6 bg-card p-6 border">
```

No `rounded-lg` on form wrappers -sharp edges are intentional (geometric precision rule).

---

## Status Badges

### **Order Status Colors**

Order status badges use CSS variables defined in `globals.css`. Never use hardcoded Tailwind color classes (e.g. `bg-yellow-100`) -always use the utility classes below.

| Status | Utility Class | Appearance |
|--------|--------------|------------|
| `pending` | `badge-status-pending` | Amber tint |
| `processing` | `badge-status-processing` | Blue tint |
| `shipped` | `badge-status-shipped` | Purple tint |
| `delivered` | `badge-status-delivered` | Green tint |
| `cancelled` | `badge-status-cancelled` | Red tint |

### **Usage**

```tsx
const statusStyles: Record<Order['status'], string> = {
  pending:    'badge-status-pending',
  processing: 'badge-status-processing',
  shipped:    'badge-status-shipped',
  delivered:  'badge-status-delivered',
  cancelled:  'badge-status-cancelled',
}

<span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[order.status]}`}>
  {order.status}
</span>
```

### **CSS Variables** (`globals.css`)

Each status has a `*-bg` and `*-fg` pair:

```css
--status-pending-bg / --status-pending-fg
--status-processing-bg / --status-processing-fg
--status-shipped-bg / --status-shipped-fg
--status-delivered-bg / --status-delivered-fg
--status-cancelled-bg / --status-cancelled-fg
```

### **Rules**
- Status badge colors are the **only exception** to the black/white/teal/red color rule
- These colors only appear in badge contexts -never for backgrounds, text, or UI chrome
- Cancelled maps to red tones, consistent with the destructive color philosophy

---

## ✅ Quality Checklist

Before shipping any component:

- [ ] Uses CSS variables (`bg-primary` not `bg-black`)
- [ ] Accent color used sparingly (<5% of component)
- [ ] Max 3 columns on desktop
- [ ] Generous spacing (gap-8 minimum)
- [ ] Mobile-first responsive
- [ ] System fonts only
- [ ] Proper font weights
- [ ] Hover states defined
- [ ] Accessible (WCAG AA)
- [ ] No transparency effects
- [ ] Proper border radius

---

## 🚀 Implementation Notes

### **DO:**
✅ Use semantic class names (`bg-primary`, `text-accent`)  
✅ Follow mobile-first approach  
✅ Use system fonts  
✅ Stick to 3 design rules  
✅ Keep accent color minimal  
✅ Test on mobile devices  
✅ Use proper semantic HTML  

### **DON'T:**
❌ Hardcode colors (`bg-black`, `bg-teal-500`)  
❌ Use 4+ grid columns  
❌ Add transparency to header  
❌ Overuse accent color  
❌ Use custom fonts  
❌ Skip accessibility  
❌ Forget hover states  

---

## 📊 Design Metrics

**Target Performance:**
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s

**Achieved through:**
- System fonts (no font downloads)
- CSS variables (minimal CSS)
- Optimized images (WebP)
- No unnecessary JavaScript

---

**Version History:**
- v1.0 - Initial design system (Feb 7, 2026)
