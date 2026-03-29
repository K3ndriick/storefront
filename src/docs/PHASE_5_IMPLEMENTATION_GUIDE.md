# 💳 Phase 5: Checkout & Payments - Implementation Guide

**Project:** PowerProShop E-Commerce Platform  
**Phase:** 5 - Checkout & Stripe Payment Integration  
**Created:** February 19, 2026  
**Estimated Duration:** 10-12 hours  
**Complexity:** ⭐⭐⭐⭐⭐ Very High (Most Complex Phase)

---

## 📋 Quick Reference

**Prerequisites:** Phases 0-4 complete ✅  
**New Dependencies:** `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`  
**Database Tables:** `orders`, `order_items`  
**External Accounts:** Stripe account required  

---

## 🎯 Overview

### What We're Building
A complete checkout and payment system that:
- Accepts credit card payments via Stripe
- Creates orders in the database
- Sends confirmation emails
- Reduces product stock
- Shows order history

### Business Impact
**THIS IS THE REVENUE-GENERATING PHASE** 💰
- Enables actual saleshttps://claude.ai/chat/03c1d13e-3ee2-4ca9-b172-ba404ffef35e
- Completes the e-commerce flow
- Foundation for business analytics

---

## ✅ Prerequisites Checklist

- [x] Phase 3 (Cart) complete
- [x] Phase 4 (Auth) complete
- [x] Supabase configured
- [x] User can add items to cart
- [x] User can log in
- [ ] Stripe account created (we'll do this)
- [ ] Payment flow tested

---

## 🏗️ Architecture Overview

### Checkout Flow
```
Cart → Login Check → Shipping Address → Payment → Order Created → Confirmation
```

### Data Flow
```
1. User clicks "Proceed to Checkout"
2. Check authentication (redirect if needed)
3. Collect shipping address
4. Create Stripe Payment Intent (server)
5. Show Stripe payment form
6. Process payment (Stripe)
7. Create order in database (server)
8. Reduce stock quantities
9. Send confirmation email
10. Clear cart
11. Show success page
```

---

## 📦 What You'll Create

### Files (19 new files)
```
Database:
- orders table
- order_items table

Stripe:
- lib/stripe/config.ts
- lib/stripe/server.ts
- lib/stripe/client.ts

Types:
- lib/types/order.ts

Actions:
- lib/actions/orders.ts
- lib/actions/stripe.ts

Pages:
- app/checkout/page.tsx
- app/checkout/success/page.tsx
- app/orders/page.tsx
- app/orders/[id]/page.tsx

Components:
- components/checkout/ShippingAddressForm.tsx
- components/checkout/PaymentForm.tsx
- components/checkout/OrderSummary.tsx
- components/orders/OrderCard.tsx
- components/orders/OrderDetails.tsx

API:
- app/api/webhooks/stripe/route.ts
```

---
## 🔨 Implementation Steps

### STEP 1: Stripe Account Setup (15 minutes)

#### 1.1 Create Account
1. Go to https://stripe.com
2. Click "Sign up"
3. Complete registration
4. You'll start in **TEST MODE** (perfect for development)

#### 1.2 Get API Keys
1. Dashboard → Developers → API keys
2. Copy these keys:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...`

#### 1.3 Add to Environment
```bash
# Add to .env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

### STEP 2: Install Dependencies (2 minutes)

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

---

### STEP 3: Database Schema (10 minutes)

**Execute in Supabase SQL Editor:**

```sql
-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Pricing
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  
  -- Shipping
  shipping_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_phone TEXT,
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL DEFAULT 'AU',
  
  -- Payment
  stripe_payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Stock reduction function
CREATE OR REPLACE FUNCTION reduce_stock(product_id UUID, quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
```

---

### STEP 4: Type Definitions (5 minutes)

**File:** `lib/types/order.ts`

```typescript
export type Order = {
  id: string
  user_id: string
  order_number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  
  subtotal: number
  tax: number
  shipping: number
  total: number
  
  shipping_name: string
  shipping_email: string
  shipping_phone: string | null
  shipping_address_line1: string
  shipping_address_line2: string | null
  shipping_city: string
  shipping_state: string | null
  shipping_postal_code: string
  shipping_country: string
  
  stripe_payment_intent_id: string | null
  payment_status: 'pending' | 'succeeded' | 'failed'
  
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  product_name: string
  product_image: string | null
  price: number
  quantity: number
}

export type OrderWithItems = Order & {
  items: OrderItem[]
}

export type ShippingAddress = {
  name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}
```

**Update:** `lib/types/index.ts`
```typescript
export * from './order'
```

---

### STEP 5: Stripe Configuration (10 minutes)

**File:** `lib/stripe/config.ts`

```typescript
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  currency: 'aud',
  country: 'AU',
}
```

**File:** `lib/stripe/server.ts`

```typescript
import Stripe from 'stripe'
import { stripeConfig } from './config'

export const stripe = new Stripe(stripeConfig.secretKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
```

**File:** `lib/stripe/client.ts`

```typescript
import { loadStripe } from '@stripe/stripe-js'
import { stripeConfig } from './config'

let stripePromise: ReturnType<typeof loadStripe>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripeConfig.publishableKey)
  }
  return stripePromise
}
```

---
### STEP 6: Server Actions (20 minutes)

**File:** `lib/actions/stripe.ts`

```typescript
'use server'

import { stripe } from '@/lib/stripe/server'
import { stripeConfig } from '@/lib/stripe/config'

export async function createPaymentIntent(amount: number) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: stripeConfig.currency,
      automatic_payment_methods: { enabled: true },
    })

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }
  } catch (error) {
    console.error('Payment intent creation error:', error)
    throw new Error('Failed to create payment intent')
  }
}
```

**File:** `lib/actions/orders.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import type { Order, OrderWithItems, ShippingAddress } from '@/lib/types/order'

type CreateOrderData = {
  user_id: string
  cart_items: Array<{
    product_id: string
    product_name: string
    product_image: string | null
    price: number
    quantity: number
  }>
  shipping_address: ShippingAddress
  subtotal: number
  tax: number
  shipping: number
  total: number
  stripe_payment_intent_id: string
}

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const supabase = await createClient()
  
  // Generate order number
  const date = new Date()
  const orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: data.user_id,
      order_number: orderNumber,
      status: 'pending',
      subtotal: data.subtotal,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      shipping_name: data.shipping_address.name,
      shipping_email: data.shipping_address.email,
      shipping_phone: data.shipping_address.phone,
      shipping_address_line1: data.shipping_address.address_line1,
      shipping_address_line2: data.shipping_address.address_line2,
      shipping_city: data.shipping_address.city,
      shipping_state: data.shipping_address.state,
      shipping_postal_code: data.shipping_address.postal_code,
      shipping_country: data.shipping_address.country,
      stripe_payment_intent_id: data.stripe_payment_intent_id,
      payment_status: 'succeeded',
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const orderItems = data.cart_items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.product_name,
    product_image: item.product_image,
    price: item.price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError

  // Reduce stock
  for (const item of data.cart_items) {
    await supabase.rpc('reduce_stock', {
      product_id: item.product_id,
      quantity: item.quantity,
    })
  }

  return order
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(*)
    `)
    .eq('id', orderId)
    .single()

  if (error) return null
  return data as OrderWithItems
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

---

### STEP 7: Checkout Components (45 minutes)

**File:** `components/checkout/ShippingAddressForm.tsx`

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ShippingAddress } from '@/lib/types/order'

const shippingSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone required'),
  address_line1: z.string().min(5, 'Address required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().optional(),
  postal_code: z.string().min(4, 'Postal code required'),
  country: z.string().default('AU'),
})

type Props = {
  onSubmit: (data: ShippingAddress) => void
}

export function ShippingAddressForm({ onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: { country: 'AU' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-lg border">
      <h2 className="text-2xl font-bold">Shipping Address</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label>Full Name</Label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <Label>Phone</Label>
          <Input {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="md:col-span-2">
          <Label>Address</Label>
          <Input {...register('address_line1')} />
          {errors.address_line1 && <p className="text-sm text-destructive">{errors.address_line1.message}</p>}
        </div>

        <div>
          <Label>City</Label>
          <Input {...register('city')} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div>
          <Label>Postal Code</Label>
          <Input {...register('postal_code')} />
          {errors.postal_code && <p className="text-sm text-destructive">{errors.postal_code.message}</p>}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full">
        Continue to Payment
      </Button>
    </form>
  )
}
```

**File:** `components/checkout/PaymentForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth/auth-context'
import { useCartStore } from '@/store/useCartStore'
import { createOrder } from '@/lib/actions/orders'
import type { ShippingAddress } from '@/lib/types/order'

type Props = {
  shippingAddress: ShippingAddress
  paymentIntentId: string
}

export function PaymentForm({ shippingAddress, paymentIntentId }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { items, subtotal, tax, shipping, total, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !user) return

    setIsProcessing(true)

    try {
      // Confirm payment
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message,
          variant: 'destructive',
        })
        setIsProcessing(false)
        return
      }

      // Create order
      const order = await createOrder({
        user_id: user.id,
        cart_items: items.map(item => ({
          product_id: item.productId,
          product_name: item.name,
          product_image: item.image,
          price: item.salePrice ?? item.price,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        subtotal: subtotal(),
        tax: tax(),
        shipping: shipping(),
        total: total(),
        stripe_payment_intent_id: paymentIntentId,
      })

      clearCart()
      router.push(`/checkout/success?order_id=${order.id}`)
    } catch (error) {
      toast({
        title: 'Order creation failed',
        description: 'Payment succeeded but order creation failed. Contact support.',
        variant: 'destructive',
      })
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border">
      <h2 className="text-2xl font-bold">Payment</h2>
      <PaymentElement />
      <Button type="submit" size="lg" className="w-full" disabled={!stripe || isProcessing}>
        {isProcessing ? 'Processing...' : `Pay $${total().toFixed(2)}`}
      </Button>
    </form>
  )
}
```

**File:** `components/checkout/OrderSummary.tsx`

```typescript
'use client'

import Image from 'next/image'
import { useCartStore } from '@/store/useCartStore'

export function OrderSummary() {
  const items = useCartStore(state => state.items)
  const subtotal = useCartStore(state => state.subtotal())
  const tax = useCartStore(state => state.tax())
  const shipping = useCartStore(state => state.shipping())
  const total = useCartStore(state => state.total())

  return (
    <div className="bg-card p-6 rounded-lg border sticky top-20">
      <h3 className="text-xl font-bold mb-4">Order Summary</h3>
      
      <div className="space-y-4 mb-4">
        {items.map(item => (
          <div key={item.productId} className="flex gap-4">
            {item.image && (
              <div className="relative w-16 h-16 bg-muted rounded">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              <p className="font-bold">${((item.salePrice ?? item.price) * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
```

---
### STEP 8: Checkout Pages (30 minutes)

**File:** `app/checkout/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'
import { useAuth } from '@/lib/auth/auth-context'
import { useCartStore } from '@/store/useCartStore'
import { ShippingAddressForm } from '@/components/checkout/ShippingAddressForm'
import { PaymentForm } from '@/components/checkout/PaymentForm'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { createPaymentIntent } from '@/lib/actions/stripe'
import type { ShippingAddress } from '@/lib/types/order'

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const total = useCartStore(state => state.total())
  const [step, setStep] = useState(1)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)

  if (!user) {
    router.push('/login?redirect=/checkout')
    return null
  }

  const handleShippingSubmit = async (address: ShippingAddress) => {
    setShippingAddress(address)
    const { clientSecret, paymentIntentId } = await createPaymentIntent(total)
    setClientSecret(clientSecret!)
    setPaymentIntentId(paymentIntentId)
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && <ShippingAddressForm onSubmit={handleShippingSubmit} />}
            {step === 2 && clientSecret && shippingAddress && paymentIntentId && (
              <Elements stripe={getStripe()} options={{ clientSecret }}>
                <PaymentForm
                  shippingAddress={shippingAddress}
                  paymentIntentId={paymentIntentId}
                />
              </Elements>
            )}
          </div>
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
```

**File:** `app/checkout/success/page.tsx`

```typescript
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getOrderById } from '@/lib/actions/orders'

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string }
}) {
  const order = searchParams.order_id
    ? await getOrderById(searchParams.order_id)
    : null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
        
        <div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {order && (
          <div className="bg-card p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">Order Number</p>
            <p className="text-2xl font-bold">{order.order_number}</p>
            <p className="text-sm text-muted-foreground mt-4">Total</p>
            <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href={order ? `/orders/${order.id}` : '/orders'}>
              View Order Details
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

---

### STEP 9: Order History Pages (30 minutes)

**File:** `app/orders/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserOrders } from '@/lib/actions/orders'
import { OrderCard } from '@/components/orders/OrderCard'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/orders')

  const orders = await getUserOrders(user.id)

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
          <p className="text-muted-foreground mb-8">
            Start shopping to see your orders here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**File:** `app/orders/[id]/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getOrderById } from '@/lib/actions/orders'
import { OrderDetails } from '@/components/orders/OrderDetails'

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const order = await getOrderById(params.id)

  if (!order || order.user_id !== user.id) {
    redirect('/orders')
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <OrderDetails order={order} />
      </div>
    </div>
  )
}
```

**File:** `components/orders/OrderCard.tsx`

```typescript
import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import type { Order } from '@/lib/types/order'

type Props = {
  order: Order
}

export function OrderCard({ order }: Props) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <p className="font-bold">{order.order_number}</p>
            <span className="px-2 py-1 text-xs rounded bg-accent/10 text-accent">
              {order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created_at), 'PPP')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </Link>
  )
}
```

**File:** `components/orders/OrderDetails.tsx`

```typescript
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import type { OrderWithItems } from '@/lib/types/order'

type Props = {
  order: OrderWithItems
}

export function OrderDetails({ order }: Props) {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{order.order_number}</h1>
          <p className="text-muted-foreground">
            Placed on {format(new Date(order.created_at), 'PPP')}
          </p>
        </div>
        <span className="px-4 py-2 rounded bg-accent/10 text-accent font-medium">
          {order.status}
        </span>
      </div>

      {/* Order Items */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Items</h2>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
              {item.product_image && (
                <div className="relative w-20 h-20 bg-muted rounded">
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div className="text-sm space-y-1">
          <p className="font-medium">{order.shipping_name}</p>
          <p>{order.shipping_address_line1}</p>
          {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
          <p>
            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
          </p>
          <p>{order.shipping_country}</p>
          <p className="pt-2">{order.shipping_email}</p>
          {order.shipping_phone && <p>{order.shipping_phone}</p>}
        </div>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/orders">Back to Orders</Link>
      </Button>
    </div>
  )
}
```

---
### STEP 10: Update Cart (5 minutes)

**Update:** `app/cart/page.tsx`

Change the "Proceed to Checkout" button to link to `/checkout`:

```typescript
<Button asChild size="lg" className="w-full">
  <Link href="/checkout">Proceed to Checkout</Link>
</Button>
```

---

## 🧪 Testing Guide

### Test Stripe Payments

**Test Card Numbers:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155
```

**Test Data:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Testing Checklist

#### Checkout Flow
- [ ] Navigate to cart
- [ ] Click "Proceed to Checkout"
- [ ] Redirected to login if not authenticated
- [ ] Fill shipping address form
- [ ] Form validation works
- [ ] Continue to payment
- [ ] Stripe payment form loads
- [ ] Enter test card (4242...)
- [ ] Payment processes
- [ ] Redirected to success page
- [ ] Order number displayed
- [ ] Cart is cleared

#### Order Creation
- [ ] Order created in database
- [ ] Order number generated correctly
- [ ] Order items saved
- [ ] Stock quantities reduced
- [ ] Payment status = succeeded
- [ ] User can view order in history

#### Order History
- [ ] Navigate to /orders
- [ ] See list of orders
- [ ] Click order to view details
- [ ] Order details display correctly
- [ ] Shipping address shown
- [ ] Items list correct
- [ ] Totals accurate

#### Edge Cases
- [ ] Try checkout with empty cart (should redirect)
- [ ] Try payment with declined card (shows error)
- [ ] Try accessing someone else's order (denied)
- [ ] Verify stock doesn't go negative
- [ ] Test with multiple items
- [ ] Test free shipping threshold

---

## ✅ Success Criteria

**Phase 5 is complete when:**

### Core Functionality
- ✅ Users can checkout and pay
- ✅ Stripe processes payments
- ✅ Orders created in database
- ✅ Stock quantities reduced
- ✅ Order confirmation shown
- ✅ Users can view order history

### Business Logic
- ✅ Tax calculated correctly (10%)
- ✅ Shipping calculated ($0 or $50)
- ✅ Free shipping over $1,000
- ✅ Sale prices used when applicable
- ✅ Order numbers unique

### User Experience
- ✅ Clear checkout steps
- ✅ Form validation works
- ✅ Loading states shown
- ✅ Error messages clear
- ✅ Success confirmation
- ✅ Mobile responsive

---

## 🐛 Common Issues & Solutions

### Issue: "Stripe not defined"
**Solution:** Check environment variables are set correctly

### Issue: Payment succeeds but order not created
**Solution:** Check console for errors in createOrder action

### Issue: Stock not reducing
**Solution:** Verify reduce_stock function exists in database

### Issue: Redirect loop on checkout
**Solution:** Check authentication redirect logic

---

## 🚀 What Comes Next

**Phase 6: User Dashboard**
- Order tracking
- Profile management
- Saved addresses
- Order history with filters

**Phase 7: Product Reviews**
- Write reviews
- Star ratings
- Image uploads
- Admin moderation

---

## 📚 Resources

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe Elements:** https://stripe.com/docs/stripe-js
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security

---

## 🎉 Congratulations!

**You've completed the most complex phase!**

Your e-commerce platform can now:
- Accept payments ✅
- Process orders ✅  
- Track order history ✅
- Generate revenue! 💰

This is a **MAJOR MILESTONE** - you have a functioning e-commerce store!

---

## 📋 Implementation Checklist

### Session 1: Setup (2 hours)
- [ ] Create Stripe account
- [ ] Get API keys
- [ ] Add environment variables
- [ ] Install dependencies
- [ ] Create database schema
- [ ] Create type definitions

### Session 2: Stripe Integration (2 hours)
- [ ] Create Stripe config files
- [ ] Create server actions (stripe + orders)
- [ ] Test payment intent creation

### Session 3: Checkout UI (3 hours)
- [ ] Create ShippingAddressForm
- [ ] Create PaymentForm
- [ ] Create OrderSummary
- [ ] Create checkout page
- [ ] Test full checkout flow

### Session 4: Order History (2 hours)
- [ ] Create OrderCard component
- [ ] Create OrderDetails component
- [ ] Create orders list page
- [ ] Create order detail page
- [ ] Test order viewing

### Session 5: Testing & Polish (2 hours)
- [ ] Test all payment scenarios
- [ ] Test edge cases
- [ ] Mobile responsive check
- [ ] Fix any bugs
- [ ] Performance optimization

---

**Total Estimated Time:** 10-12 hours

**Ready to generate revenue!** 💳🎉
