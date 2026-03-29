# 🚀 Phases 6-10: Advanced Features & Admin - Implementation Guide

**Project:** PowerProShop E-Commerce Platform  
**Phases:** 6, 7, 8, 9, 10 - Advanced Features, Reviews, Services, Admin, Inventory  
**Created:** February 19, 2026  
**Total Duration:** ~40-50 hours  
**Status:** Ready for Implementation After Phase 5

---

## 📋 Table of Contents

1. [Phase 6: User Dashboard](#phase-6-user-dashboard)
2. [Phase 7: Product Reviews](#phase-7-product-reviews)
3. [Phase 8: Appointment Booking](#phase-8-appointment-booking)
4. [Phase 9: Admin Dashboard](#phase-9-admin-dashboard)
5. [Phase 10: Inventory Management](#phase-10-inventory-management)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Guide](#deployment-guide)

---

# Phase 6: User Dashboard

**Duration:** 6-8 hours  
**Complexity:** ⭐⭐⭐ Moderate  
**Prerequisites:** Phase 5 (Orders) complete

---

## 🎯 Overview

### What We're Building
A comprehensive user dashboard where customers can:
- View order history with filters
- Track order status
- Manage profile information
- Update password
- Manage saved addresses
- View order analytics

### Business Value
- Improved customer experience
- Reduced support requests (self-service)
- Customer retention
- Repeat purchase enablement

---

## 🏗️ Architecture

### Dashboard Structure
```
/dashboard
├── /orders          # Order history with filters
├── /profile         # Profile management
├── /addresses       # Saved addresses
└── /settings        # Account settings
```

---

## 📦 Implementation Steps

### Step 1: Dashboard Layout (1 hour)

**File:** `app/dashboard/layout.tsx`

```typescript
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard')

  const navItems = [
    { href: '/dashboard/orders', label: 'Orders' },
    { href: '/dashboard/profile', label: 'Profile' },
    { href: '/dashboard/addresses', label: 'Addresses' },
    { href: '/dashboard/settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <nav className="space-y-2">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 rounded hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="col-span-12 lg:col-span-9">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Order History with Filters (2 hours)

**File:** `app/dashboard/orders/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { getUserOrders } from '@/lib/actions/orders'
import { OrderCard } from '@/components/orders/OrderCard'
import { Select } from '@/components/ui/select'
import type { Order } from '@/lib/types/order'

export default function DashboardOrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    
    getUserOrders(user.id).then(data => {
      setOrders(data)
      setLoading(false)
    })
  }, [user])

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Select
          value={filter}
          onValueChange={setFilter}
          options={[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
          ]}
        />
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-muted-foreground">No orders found</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Step 3: Profile Management (2 hours)

**File:** `app/dashboard/profile/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name required'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { profile, updateProfile } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    try {
      await updateProfile(data)
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-lg border">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={profile?.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Email cannot be changed
          </p>
        </div>

        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input {...register('full_name')} />
          {errors.full_name && (
            <p className="text-sm text-destructive">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input {...register('phone')} placeholder="+61 4XX XXX XXX" />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  )
}
```

### Step 4: Saved Addresses (2 hours)

**Database Schema:**
```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'AU',
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own addresses"
ON addresses FOR ALL
USING (auth.uid() = user_id);
```

**File:** `app/dashboard/addresses/page.tsx`

```typescript
// Full CRUD for addresses
// - List addresses
// - Add new address
// - Edit address
// - Delete address
// - Set as default
```

---

## ✅ Success Criteria

- [ ] Users can view filtered order history
- [ ] Users can update profile
- [ ] Users can manage addresses
- [ ] Users can change password
- [ ] Dashboard is mobile responsive
- [ ] All forms validate correctly

---

# Phase 7: Product Reviews

**Duration:** 6-8 hours  
**Complexity:** ⭐⭐⭐⭐ Moderate-High  
**Prerequisites:** Phase 4 (Auth) complete

---

## 🎯 Overview

### What We're Building
A complete review system where customers can:
- Write reviews for purchased products
- Rate products (1-5 stars)
- Upload review images
- View all reviews for a product
- Admin moderation (Phase 9)

### Business Value
- Social proof increases conversions
- Customer engagement
- Product feedback
- SEO benefits (user-generated content)

---

## 📦 Database Schema

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id), -- Optional: verify purchase
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  
  -- Moderation
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  
  -- Metadata
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate reviews per user per product
  UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
ON reviews FOR SELECT
USING (status = 'approved');

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);
```

---

## 🔨 Implementation

### Step 1: Review Form Component (2 hours)

**File:** `components/reviews/ReviewForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createReview } from '@/lib/actions/reviews'

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Review must be at least 20 characters'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

type Props = {
  productId: string
  onSuccess?: () => void
}

export function ReviewForm({ productId, onSuccess }: Props) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  })

  const handleRatingClick = (value: number) => {
    setRating(value)
    setValue('rating', value)
  }

  const onSubmit = async (data: ReviewFormData) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to write a review',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createReview({
        product_id: productId,
        user_id: user.id,
        rating: data.rating,
        title: data.title,
        content: data.content,
      })

      toast({
        title: 'Review submitted',
        description: 'Your review is pending approval.',
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label>Rating</Label>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingClick(value)}
              onMouseEnter={() => setHoveredRating(value)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={`w-8 h-8 ${
                  value <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive mt-1">Please select a rating</p>
        )}
      </div>

      <div>
        <Label htmlFor="title">Review Title</Label>
        <Input {...register('title')} placeholder="Sum up your experience" />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="content">Your Review</Label>
        <Textarea
          {...register('content')}
          rows={6}
          placeholder="What did you like or dislike? What did you use this product for?"
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  )
}
```

### Step 2: Display Reviews (2 hours)

**File:** `components/reviews/ReviewList.tsx`

```typescript
'use client'

import { Star } from 'lucide-react'
import { format } from 'date-fns'
import type { Review } from '@/lib/types/review'

type Props = {
  reviews: Review[]
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map(review => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <h4 className="font-semibold">{review.title}</h4>
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {review.user_name} • {format(new Date(review.created_at), 'PPP')}
            {review.verified_purchase && (
              <span className="ml-2 text-accent">✓ Verified Purchase</span>
            )}
          </p>

          <p className="text-sm">{review.content}</p>
        </div>
      ))}
    </div>
  )
}
```

### Step 3: Review Summary (1 hour)

**File:** `components/reviews/ReviewSummary.tsx`

```typescript
'use client'

import { Star } from 'lucide-react'

type Props = {
  averageRating: number
  totalReviews: number
  ratingDistribution: { rating: number; count: number }[]
}

export function ReviewSummary({
  averageRating,
  totalReviews,
  ratingDistribution,
}: Props) {
  return (
    <div className="bg-card p-6 rounded-lg border">
      <div className="text-center mb-6">
        <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= Math.round(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">{totalReviews} reviews</p>
      </div>

      <div className="space-y-2">
        {ratingDistribution.map(({ rating, count }) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm w-12">{rating} star</span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full"
                style={{
                  width: `${(count / totalReviews) * 100}%`,
                }}
              />
            </div>
            <span className="text-sm w-12 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Step 4: Integration with Product Page (1 hour)

Update `app/products/[slug]/page.tsx` to include reviews:

```typescript
// Add reviews section
<section className="mt-12">
  <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div>
      <ReviewSummary
        averageRating={productReviews.averageRating}
        totalReviews={productReviews.total}
        ratingDistribution={productReviews.distribution}
      />
    </div>
    <div className="lg:col-span-2">
      <ReviewForm productId={product.id} />
      <ReviewList reviews={productReviews.reviews} />
    </div>
  </div>
</section>
```

---

## ✅ Success Criteria

- [ ] Users can write reviews
- [ ] Star rating system works
- [ ] Reviews display on product pages
- [ ] Review summary calculates correctly
- [ ] Duplicate review prevention
- [ ] Verified purchase badge works

---

# Phase 8: Appointment Booking

**Duration:** 8-10 hours  
**Complexity:** ⭐⭐⭐⭐ High  
**Prerequisites:** Phase 4 (Auth) complete

---

## 🎯 Overview

### What We're Building
Equipment repair & service booking system:
- Service catalog (repair, installation, maintenance)
- Calendar availability view
- Appointment booking
- Email confirmations
- Admin appointment management

### Business Value
- **30% of revenue** (secondary business)
- Differentiation from competitors
- Local customer service
- Recurring revenue stream

---

## 📦 Database Schema

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL, -- e.g., 60, 120
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  user_id UUID NOT NULL REFERENCES auth.users(id),
  service_id UUID NOT NULL REFERENCES services(id),
  
  -- Appointment details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, canceled
  
  -- Customer info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  
  -- Equipment details
  equipment_type TEXT,
  equipment_brand TEXT,
  issue_description TEXT,
  
  -- Admin notes
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
ON services FOR SELECT
USING (active = true);

CREATE POLICY "Users can view own appointments"
ON appointments FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 🔨 Implementation

### Step 1: Service Catalog (2 hours)

**Seed services data:**
```sql
INSERT INTO services (name, description, duration_minutes, price) VALUES
('Equipment Repair', 'Professional repair service for gym equipment', 120, 89.00),
('Home Installation', 'Equipment installation at your home', 90, 69.00),
('Equipment Assembly', 'Assembly service for new equipment', 60, 49.00),
('Maintenance Check', 'Preventive maintenance inspection', 45, 39.00);
```

**File:** `app/services/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from '@/components/services/ServiceCard'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-4">Repair & Installation Services</h1>
        <p className="text-muted-foreground mb-12">
          Professional equipment service by certified technicians
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Step 2: Appointment Booking Flow (4 hours)

**File:** `app/services/[id]/book/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from '@/components/ui/calendar'
import { AppointmentForm } from '@/components/appointments/AppointmentForm'
import { TimeSlotPicker } from '@/components/appointments/TimeSlotPicker'

export default function BookAppointmentPage({
  params,
}: {
  params: { id: string }
}) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [step, setStep] = useState(1)

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Book Appointment</h1>

        {/* Step 1: Select Date */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Date</h2>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setStep(2)
              }}
              disabled={(date) => date < new Date()}
            />
          </div>
        )}

        {/* Step 2: Select Time */}
        {step === 2 && selectedDate && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Time</h2>
            <TimeSlotPicker
              date={selectedDate}
              serviceId={params.id}
              onSelect={(time) => {
                setSelectedTime(time)
                setStep(3)
              }}
            />
          </div>
        )}

        {/* Step 3: Customer Details */}
        {step === 3 && selectedDate && selectedTime && (
          <AppointmentForm
            serviceId={params.id}
            date={selectedDate}
            time={selectedTime}
          />
        )}
      </div>
    </div>
  )
}
```

### Step 3: Available Time Slots (2 hours)

**File:** `lib/actions/appointments.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAvailableTimeSlots(
  serviceId: string,
  date: string
): Promise<string[]> {
  const supabase = await createClient()

  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes')
    .eq('id', serviceId)
    .single()

  if (!service) return []

  // Get existing appointments for the day
  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_time, duration_minutes')
    .eq('appointment_date', date)
    .neq('status', 'canceled')

  // Generate available slots (9 AM - 5 PM)
  const allSlots = []
  for (let hour = 9; hour < 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 16) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }

  // Filter out booked slots
  const bookedSlots = new Set(appointments?.map(a => a.appointment_time) || [])
  const availableSlots = allSlots.filter(slot => !bookedSlots.has(slot))

  return availableSlots
}

export async function createAppointment(data: any) {
  const supabase = await createClient()
  
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  // TODO: Send confirmation email

  return appointment
}
```

---

## ✅ Success Criteria

- [ ] Users can view service catalog
- [ ] Users can select appointment date
- [ ] Available time slots show correctly
- [ ] Users can book appointments
- [ ] Confirmation emails sent
- [ ] Users can view their appointments
- [ ] Admin can manage appointments

---

# Phase 9: Admin Dashboard

**Duration:** 10-12 hours  
**Complexity:** ⭐⭐⭐⭐⭐ Very High  
**Prerequisites:** All previous phases

---

## 🎯 Overview

### What We're Building
Comprehensive admin dashboard for shop owner:
- Product management (CRUD)
- Order management
- Appointment management
- Review moderation
- User management
- Analytics dashboard

### Business Value
- **CRITICAL FOR SHOP OWNER**
- Self-service product management
- Order processing
- Customer service tools
- Business insights

---

## 📦 Implementation

### Step 1: Admin Authentication (2 hours)

**Database:**
```sql
-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'customer';

-- Update your user to admin
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

**File:** `lib/auth/admin-check.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}
```

### Step 2: Admin Layout (1 hour)

**File:** `app/admin/layout.tsx`

```typescript
import { redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/auth/admin-check'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) redirect('/')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```

### Step 3: Product Management (3 hours)

**File:** `app/admin/products/page.tsx`

```typescript
// Product list with:
// - Search
// - Filters
// - Edit button
// - Delete button
// - Add new product button

// Features:
// - View all products
// - Edit product details
// - Update stock
// - Toggle in_stock status
// - Delete products (soft delete)
```

**File:** `app/admin/products/[id]/edit/page.tsx`

```typescript
// Product edit form with:
// - All product fields
// - Image upload
// - Category selection
// - Price management
// - Stock management
// - Marketing flags (featured, new, bestseller)
```

### Step 4: Order Management (2 hours)

**File:** `app/admin/orders/page.tsx`

```typescript
// Order management with:
// - Order list (all orders)
// - Status filters
// - Search by order number
// - Update order status
// - View order details
// - Print invoice
```

### Step 5: Analytics Dashboard (2 hours)

**File:** `app/admin/page.tsx`

```typescript
// Dashboard showing:
// - Total revenue (this month)
// - Total orders (this month)
// - Pending orders
// - Low stock alerts
// - Recent orders
// - Top selling products
// - Revenue chart
```

### Step 6: Review Moderation (1 hour)

**File:** `app/admin/reviews/page.tsx`

```typescript
// Review moderation:
// - List pending reviews
// - Approve button
// - Reject button
// - View product
// - Filter by status
```

---

## ✅ Success Criteria

- [ ] Admin-only access enforced
- [ ] Products can be created/edited/deleted
- [ ] Orders can be managed
- [ ] Appointments can be viewed/managed
- [ ] Reviews can be moderated
- [ ] Analytics dashboard shows key metrics
- [ ] Mobile responsive admin panel

---

# Phase 10: Inventory Management

**Duration:** 6-8 hours  
**Complexity:** ⭐⭐⭐⭐ High  
**Prerequisites:** Phase 9 (Admin) complete

---

## 🎯 Overview

### What We're Building
Inventory tracking and management:
- Real-time stock tracking
- Low stock alerts
- Stock history
- Reorder management
- Supplier tracking
- Stock adjustments

### Business Value
- Prevent overselling
- Automate reordering
- Track inventory costs
- Supplier management

---

## 📦 Database Schema

```sql
CREATE TABLE stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id),
  adjustment_type TEXT NOT NULL, -- sale, restock, return, adjustment
  quantity_change INTEGER NOT NULL, -- positive for increase, negative for decrease
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, ordered, received, canceled
  total_cost DECIMAL(10, 2),
  expected_delivery DATE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  received_at TIMESTAMPTZ
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  cost_per_unit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔨 Implementation

### Step 1: Low Stock Alerts (2 hours)

**File:** `app/admin/inventory/page.tsx`

```typescript
// Inventory dashboard:
// - Products below low_stock_threshold
// - Out of stock products
// - Stock value summary
// - Recent stock movements
```

### Step 2: Stock Adjustment (2 hours)

**File:** `components/admin/StockAdjustmentForm.tsx`

```typescript
// Form to adjust stock:
// - Select product
// - Adjustment type (restock, return, damaged, etc.)
// - Quantity change
// - Reason/notes
// - Logs to stock_adjustments table
```

### Step 3: Supplier Management (2 hours)

**File:** `app/admin/suppliers/page.tsx`

```typescript
// Supplier CRUD:
// - List suppliers
// - Add supplier
// - Edit supplier
// - Deactivate supplier
// - View supplier's products
```

### Step 4: Purchase Orders (2 hours)

**File:** `app/admin/purchase-orders/page.tsx`

```typescript
// Purchase order management:
// - Create PO
// - Add products to PO
// - Send to supplier
// - Mark as received
// - Auto-update stock on receipt
```

---

## ✅ Success Criteria

- [ ] Low stock alerts working
- [ ] Stock adjustments logged
- [ ] Suppliers can be managed
- [ ] Purchase orders functional
- [ ] Stock auto-updates on PO receipt
- [ ] Stock history viewable

---

# Testing Strategy

## Unit Testing (Optional)

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

**Key areas to test:**
- Cart calculations
- Review rating calculations
- Appointment time slot logic
- Stock adjustment logic

---

## E2E Testing (Recommended)

```bash
npm install --save-dev @playwright/test
```

**Critical user flows:**
1. Browse → Add to Cart → Checkout → Order
2. Register → Review Product
3. Book Appointment
4. Admin: Create Product → Update Stock

---

# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations complete
- [ ] RLS policies tested
- [ ] Admin account created
- [ ] Products seeded
- [ ] Services seeded
- [ ] Stripe in production mode
- [ ] Email configured (switch from Mailtrap)

## Deployment Steps

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Deploy to production
vercel --prod
```

### 2. Domain Configuration

1. Add custom domain in Vercel
2. Configure DNS records
3. Update Supabase redirect URLs
4. Update Stripe redirect URLs

### 3. Email Configuration

**Switch from Mailtrap to production email:**

Option A: Resend (Recommended)
```bash
npm install resend

# Add to .env
RESEND_API_KEY=your_key
```

Option B: SendGrid
```bash
npm install @sendgrid/mail
```

### 4. Monitoring

**Add error tracking:**
```bash
npm install @sentry/nextjs
```

**Add analytics:**
- Google Analytics
- Vercel Analytics
- Stripe Dashboard

---

## 🎉 Project Complete!

### What You've Built

**Customer Features:**
- ✅ Product browsing & filtering
- ✅ Shopping cart
- ✅ User accounts
- ✅ Checkout & payments
- ✅ Order history
- ✅ Product reviews
- ✅ Service booking

**Admin Features:**
- ✅ Product management
- ✅ Order management
- ✅ Inventory tracking
- ✅ Review moderation
- ✅ Analytics dashboard

**Business Capabilities:**
- ✅ Online sales (70% revenue)
- ✅ Service bookings (30% revenue)
- ✅ Customer database
- ✅ Order tracking
- ✅ Inventory management

---

## 📊 Final Statistics

**Estimated Total:**
- Duration: 80-100 hours
- Files Created: 150+
- Lines of Code: 15,000+
- Database Tables: 15+
- Features: 50+

**Tech Stack:**
- Next.js 16
- TypeScript
- Supabase
- Stripe
- Tailwind CSS
- shadcn/ui
- Zustand

---

**🚀 Ready to launch your e-commerce platform!** 💪
