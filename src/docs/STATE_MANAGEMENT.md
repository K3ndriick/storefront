# State Management - Deep Dive

This document explains every state mechanism used in PowerProShop, why each one was chosen, and exactly how they work.

---

## Overview - Four Mechanisms, Four Purposes

| Mechanism                         | What it manages                         | Persisted?            | Where defined                   |
|-----------------------------------|-----------------------------------------|-----------------------|---------------------------------|
| **Zustand** (`useCartStore`)      | Cart items, quantities, computed totals | localStorage          | `store/useCartStore.ts`         |
| **Zustand** (`useFilterStore`)    | Product filters, sort, view mode        | localStorage          | `store/useFilterStore.ts`       |
| **React Context** (`AuthContext`) | User, profile, session, loading state   | Supabase cookie       | `lib/auth/auth-context.tsx`     |
| **URL search params**             | Active category / search query for SSR  | URL (browser history) | Read in `app/products/page.tsx` |

The rule of thumb: pick the mechanism that naturally fits the persistence and sharing requirements of the data.

---

## 1. Cart Store - `store/useCartStore.ts`

### What it stores

```typescript
items: CartItem[]   // the entire cart
```

Everything else - totals, counts, item lookups - is **derived from `items[]`** at call time, not stored separately. This means state can never go out of sync.

### Computed values (functions, not stored state)

| Function      | Formula                                            |
|---------------|----------------------------------------------------|
| `itemCount()` | `items.reduce((sum, i) => sum + i.quantity, 0)`    |
| `subtotal()`  | `sum of (effectivePrice * quantity)` for all items |
| `tax()`       | `subtotal() * 0.10`                                |
| `shipping()`  | `$0` if `subtotal() >= $1000`, otherwise `$50`     |
| `total()`     | `subtotal() + tax() + shipping()`                  |

`effectivePrice` is `sale_price` if the product is on sale, otherwise `price`.

### Actions

| Action                           | What it does                                                             |
|----------------------------------|--------------------------------------------------------------------------|
| `addItem(product, quantity)`     | Validates stock → appends new `CartItem` or increments existing quantity |
| `removeItem(productId)`          | Filters out the item with that ID                                        |
| `updateQuantity(productId, qty)` | Sets quantity; throws if `qty > maxQuantity`                             |
| `clearCart()`                    | Sets `items: []` - called after successful order creation                |

### Business rules enforced in the store

- `maxQuantity = Math.min(stock_quantity, 10)` - never more than 10 of any one item
- Throws `"Product is out of stock"` if `in_stock` is false
- Throws `"Cannot exceed maximum quantity"` if the new quantity would exceed `maxQuantity`
- Errors are thrown (not swallowed) so the calling component can show a toast

### Middleware stack

```typescript
devtools(
  persist(
    storeFunction,
    { name: 'cart-storage' }   // localStorage key
  )
)
```

- `persist` serialises `items[]` to `localStorage` on every change and rehydrates on first render
- `devtools` connects to Redux DevTools browser extension for state inspection

### Where components read it

```typescript
// Header - just the count for the badge
const itemCount = useCartStore(state => state.itemCount())

// Cart page - the full items list
const items = useCartStore(state => state.items)

// CartSummary - computed totals
const subtotal = useCartStore(state => state.subtotal())
const total    = useCartStore(state => state.total())
```

Zustand only re-renders a component when the specific slice it subscribes to changes.

---

## 2. Filter Store - `store/useFilterStore.ts`

### What it stores

```typescript
sortBy:               ProductSortOption   // e.g. 'price-asc'
priceRange:           [number, number]    // [min, max] in dollars
selectedCategories:   string[]
selectedBrands:       string[]
inStockOnly:          boolean
onSaleOnly:           boolean
viewMode:             'grid' | 'list'
```

### Default state

A `defaultState` object is defined once and used in two places:

1. As the initial store values
2. Inside `resetFilters()` - resets everything back to defaults in one call

### Actions

| Action                          | What it does                                           |
|---------------------------------|--------------------------------------------------------|
| `setSortBy(value)`              | Updates the sort field                                 |
| `setPriceRange([min, max])`     | Updates the price slider range                         |
| `toggleCategory(cat)`           | Adds or removes a category from `selectedCategories[]` |
| `toggleBrand(brand)`            | Adds or removes a brand from `selectedBrands[]`        |
| `setInStockOnly(bool)`          | Toggles in-stock filter                                |
| `setOnSaleOnly(bool)`           | Toggles on-sale filter                                 |
| `setViewMode('grid' \| 'list')` | Switches the product grid layout                       |
| `resetFilters()`                | Resets all filter fields back to `defaultState`        |

### Middleware stack

```typescript
devtools(
  persist(
    storeFunction,
    { name: 'powerproshop-filters' }   // localStorage key
  )
)
```

Filter preferences survive page refreshes and navigation - the user does not lose their "In Stock Only" checkbox when they visit a product detail page and come back.

### Convenience hooks (exported separately)

The file exports focused hooks so components only subscribe to what they need:

```typescript
export const useSortBy              = () => useFilterStore(state => state.sortBy)
export const usePriceRange          = () => useFilterStore(state => state.priceRange)
export const useSelectedCategories  = () => useFilterStore(state => state.selectedCategories)
export const useActiveFilterCount   = () => useFilterStore(state => /* counts active non-default filters */)
```

Using these hooks instead of `useFilterStore(state => state)` prevents unnecessary re-renders - a component subscribed to `useSortBy` will not re-render when `inStockOnly` changes.

### How filtering works (no server round-trip)

```
Products[] arrive from the server as a prop to <FilteredProductList>
    │
    ▼
useMemo() runs filter + sort logic against the local products[] prop
    applies: inStockOnly → onSaleOnly → priceRange → selectedCategories → selectedBrands
    then sorts by: sortBy value
    │
    ▼
Filtered + sorted list renders - instant, no network call
```

The server only fetches by `category` (from the URL). Everything else filters client-side.

---

## 3. Auth Context - `lib/auth/auth-context.tsx`

### Why React Context instead of Zustand?

Auth state has two requirements that make React Context the better fit:

1. **Supabase owns persistence** - auth is stored in a cookie managed by Supabase, not localStorage. There is no need for Zustand's `persist` middleware.
2. **It is not performance-critical** - auth state changes infrequently (login, logout, profile update). The broader re-renders that Context triggers are not a problem here.

### What it stores

```typescript
user:    User | null      // Supabase auth user object (id, email, etc.)
profile: Profile | null   // Row from public.profiles (full_name, avatar_url, etc.)
session: Session | null   // Supabase session (contains the access token)
loading: boolean          // true until the initial auth check completes
```

`loading` is critical - it starts as `true` and becomes `false` once we know whether a session exists. Components check `loading` before rendering auth-dependent UI to avoid a flash of the wrong state.

### Initialisation sequence (on every page load)

```
AuthProvider mounts (it lives in the root layout)
    │
    ▼
supabase.auth.getSession()
    reads the auth cookie from the browser
    if session exists → setUser(), setSession(), fetchProfile(userId)
    if no session    → setLoading(false)
    │
    ▼
supabase.auth.onAuthStateChange() listener registered
    fires on every future login / logout / token refresh
    same logic: update state → fetchProfile if session exists
    │
    ▼
fetchProfile(userId)
    queries public.profiles WHERE id = userId
    setProfile(data)
    setLoading(false)   ← always in the finally block
```

### Auth methods (exposed via `useAuth()`)

| Method                              | What it calls                                                   |
|-------------------------------------|-----------------------------------------------------------------|
| `signUp(email, password, fullName)` | `supabase.auth.signUp()` with `options.data.full_name`          |
| `signIn(email, password)`           | `supabase.auth.signInWithPassword()`                            |
| `signOut()`                         | `supabase.auth.signOut()` then `router.push('/')`               |
| `resetPassword(email)`              | `supabase.auth.resetPasswordForEmail()` with a `redirectTo` URL |
| `updatePassword(newPassword)`       | `supabase.auth.updateUser({ password })`                        |
| `updateProfile(updates)`            | Updates `public.profiles` row, then re-fetches profile          |

All methods **throw on error**. The calling component (a form) catches the error and shows a toast. This keeps the auth layer simple - it does not know about UI.

### How components consume it

```typescript
// Any component
const { user, profile, loading, signOut } = useAuth()

// Guard against rendering before auth is confirmed
if (loading) return <Spinner />
if (!user)   return <RedirectToLogin />
```

`useAuth()` throws a clear error if called outside of `<AuthProvider>`, preventing silent failures.

---

## 4. URL Search Params - SSR-Compatible Category Filtering

### Why URL params for category?

Category filtering is the one filter that needs to work **server-side** - it is the filter that changes _which products_ the server fetches, not how already-fetched products are displayed.

Making the category a URL param (`/products?category=cardio`) means:

- Pages are shareable and bookmarkable with the filter applied
- The server can read the param and pass it to `getProducts()` before sending HTML
- Search engines can index `/products?category=cardio` as a distinct page

### How it flows

```
URL: /products?category=cardio
    │
    ▼
app/products/page.tsx  (Server Component)
    const { category } = await searchParams
    const products = await getProducts({ category })
    renders <FilteredProductList products={products} />
    │
    ▼
Client-side Zustand filters apply on top of the server-fetched set
```

Category is the only filter in URL params. All other filters (price range, brand, in-stock, sort) are Zustand because they do not need SSR and do not need to be shareable.

---

## Decision Guide - Which Mechanism to Use

| Scenario                                                                 | Use                             |
|--------------------------------------------------------------------------|---------------------------------|
| Data that must survive page refresh, client-only                         | Zustand + `persist`             |
| Data shared across many components, changes rarely                       | React Context                   |
| Data that needs to be indexed by search engines or shareable via link    | URL search params               |
| Data that changes on every user action and drives complex derived values | Zustand (computed functions)    |
| Server-fetched data passed down the component tree                       | Props (no state manager needed) |
