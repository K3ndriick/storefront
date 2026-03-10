# Data Flow - Key User Journeys

This document traces exactly what happens at each layer of the system for the three most important user flows.

---

## 1. Browsing & Filtering Products

### Server-side fetch (on page load)

```
User visits /products?category=cardio
    │
    ▼
middleware.ts
    checks auth cookie - /products is a public route, passes through
    │
    ▼
app/products/page.tsx  (Server Component - runs on the server)
    reads searchParams.category from the URL
    calls getProducts({ category: 'cardio' })  ← Server Action
    │
    ▼
lib/actions/products.ts  getProducts()
    createClient()  ← server Supabase client (reads cookie)
    builds a dynamic Supabase query:
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .eq('category', 'cardio')
        .order('created_at', { ascending: false })
    returns Product[]
    │
    ▼
Supabase PostgreSQL
    RLS policy: "Public can view active products" (deleted_at IS NULL)
    executes query, returns matching rows
    │
    ▼
app/products/page.tsx
    passes products[] as a prop to <FilteredProductList products={products} />
    │
    ▼
Browser renders the page with server-fetched products
```

### Client-side filtering (after load - no server round-trip)

```
User clicks "In Stock Only" checkbox in ProductFilters
    │
    ▼
components/products/product-filters.tsx  (Client Component)
    calls useFilterStore.setInStockOnly(true)
    │
    ▼
store/useFilterStore.ts  (Zustand)
    updates state: { inStockOnly: true }
    persist middleware saves to localStorage key 'powerproshop-filters'
    │
    ▼
components/products/filtered-product-list.tsx  (Client Component)
    subscribed to useFilterStore - re-renders automatically
    useMemo re-runs filter logic on the existing products[] prop:
        if inStockOnly: products.filter(p => p.in_stock)
        then sorts by sortBy value
    │
    ▼
Browser updates the product grid instantly - no network request
```

---

## 2. Adding to Cart & Viewing Cart

### Add to cart

```
User clicks "Add to Cart" on a product detail page
    │
    ▼
components/products/add-to-cart-button.tsx  (Client Component)
    calls useCartStore.addItem(product, quantity)
    │
    ▼
store/useCartStore.ts  (Zustand)
    validates: product.in_stock? maxQuantity = Math.min(stock_quantity, 10)
    checks if item already exists in items[]
    if exists: increments quantity (throws if > maxQuantity)
    if new: builds CartItem object, appends to items[]
    set() updates state
    persist middleware serialises items[] to localStorage key 'cart-storage'
    │
    ▼
components/layout/header.tsx
    subscribed to useCartStore(state => state.itemCount())
    re-renders the cart badge with the new count
    │
    ▼
add-to-cart-button.tsx shows success toast via sonner
```

### View cart

```
User navigates to /cart
    │
    ▼
app/cart/page.tsx  (Client Component - 'use client')
    reads useCartStore(state => state.items)
    persist middleware rehydrates from localStorage on first render
    if items.length === 0 → renders <CartEmpty />
    │
    ▼
Renders CartItem for each item
    each CartItem reads its own data from the items[] prop
    QuantityControl calls useCartStore.updateQuantity() on change
    X button calls useCartStore.removeItem()

CartSummary reads:
    useCartStore(state => state.subtotal())   // sum of effectivePrice * qty
    useCartStore(state => state.tax())        // subtotal * 0.10
    useCartStore(state => state.shipping())   // $0 if subtotal >= $1000, else $50
    useCartStore(state => state.total())      // subtotal + tax + shipping

All computed values re-derive from items[] automatically on every change
```

---

## 3. Checkout & Payment (the most complex flow)

```
User clicks "Proceed to Checkout" on /cart
    │
    ▼
middleware.ts
    /checkout is a protected route
    reads auth cookie - if no session: redirect to /login?redirect=/checkout
    if session exists: passes through
    │
    ▼
app/checkout/page.tsx  (Client Component)
    reads cart from useCartStore
    reads user from useAuth()

User fills in the ShippingAddressForm, then clicks "Pay"
    │
    ▼
components/checkout/payment-form.tsx  (Client Component)
    Step 1 - create a PaymentIntent on the server:
        calls createPaymentIntent(total)  ← Server Action
        │
        ▼
    lib/actions/stripe.ts  createPaymentIntent()
        uses Stripe Node SDK (secret key - server only, never in browser)
        calls stripe.paymentIntents.create({ amount: total * 100, currency: 'aud' })
        returns { clientSecret, paymentIntentId }
        │
        ▼
    payment-form.tsx receives clientSecret
    Stripe Elements renders the card input using clientSecret

User enters card details and submits
    │
    ▼
components/checkout/payment-form.tsx
    calls stripe.confirmPayment() with the clientSecret
    Stripe processes payment on Stripe's servers
    on success: Stripe calls our return_url (or we handle the result in the callback)
    │
    ▼
payment-form.tsx (on payment success)
    calls createOrder(orderData)  ← Server Action
    │
    ▼
lib/actions/orders.ts  createOrder()
    createClient()  ← server Supabase client (authenticated - has user session)
    Step 1: generate order number  ORD-YYYYMMDD-XXXXXXXXX
    Step 2: insert row into orders table with all shipping fields + stripe_payment_intent_id
    Step 3: insert rows into order_items table (one per cart item)
    Step 4: for each item, call supabase.rpc('reduce_stock', { product_id, quantity })
            this is an atomic SQL function - prevents overselling
    Step 5: return the created Order object
    │
    ▼
Supabase PostgreSQL
    RLS: user can only insert orders where user_id = auth.uid()
    reduce_stock() runs inside the DB - atomic, safe
    │
    ▼
payment-form.tsx receives the created Order
    calls useCartStore.clearCart()  ← empties localStorage cart
    calls router.push('/checkout/success?orderId=...')
    │
    ▼
app/checkout/success/page.tsx
    reads orderId from URL params
    calls getOrderById(orderId)  ← Server Action
    renders order confirmation
```

---

## 4. Authentication Flow

### Login

```
User submits login form at /login
    │
    ▼
components/auth/login-form.tsx  (Client Component)
    react-hook-form validates with zod schema
    calls signIn(email, password) from useAuth()
    │
    ▼
lib/auth/auth-context.tsx  signIn()
    calls supabase.auth.signInWithPassword({ email, password })
    Supabase validates credentials, sets auth cookies in the browser
    │
    ▼
auth-context.tsx  onAuthStateChange listener (always running)
    fires with the new session
    calls fetchProfile(user.id)
    fetches the profiles row from Supabase
    sets user, session, profile, loading in React Context state
    │
    ▼
Every component using useAuth() re-renders:
    Header's UserMenu shows the user's name instead of "Sign In"
    │
    ▼
login-form.tsx
    router.push('/products') - or the ?redirect= URL if set by middleware
```

### Session persistence across page refreshes

```
User refreshes any page
    │
    ▼
auth-context.tsx mounts (it's in the root layout)
    calls supabase.auth.getSession()
    Supabase reads the auth cookie from the browser
    if valid session found: fetchProfile() → sets all auth state
    if no session: sets loading = false, user = null
    │
    ▼
Components render with correct auth state - no flash of wrong content
    (loading = true briefly prevents components rendering before auth is known)
```

### Protected route redirect

```
User visits /dashboard while not logged in
    │
    ▼
middleware.ts  (runs on the server before the page renders)
    createServerClient() reads the auth cookie from the request
    supabase.auth.getUser() - no valid session
    request.nextUrl.pathname starts with '/dashboard' → protected
    returns NextResponse.redirect to /login?redirect=/dashboard
    │
    ▼
User logs in at /login
    login-form.tsx reads the ?redirect= param
    after successful sign in, router.push('/dashboard')
```
