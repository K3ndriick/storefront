'use client';

// react-hook-form manages the form state and wires inputs to React.
// zod defines the validation rules as a schema.
// zodResolver is the bridge - it runs your zod schema when the form submits
// and passes errors back to react-hook-form in the right format.

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ShippingAddress } from '@/lib/types/order';

// ============================================================
// VALIDATION SCHEMA
// Define the rules each field must meet before the form submits.
// zod methods: z.string(), .min(n, 'message'), .email('message'), .optional()
// ============================================================

// Fill in the validation rules for each field
// Reference: ShippingAddress type in lib/types/order.ts for the field names
// Think about: what's the minimum length for a name? what makes an email valid?
// For optional fields (address_line2, state) use z.string().optional()
const shippingSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Phone is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().nullable(),
  postal_code: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
})

// Infer the TypeScript type directly from the schema
// This means we don't need to maintain a separate type for form values
type ShippingFormValues = z.infer<typeof shippingSchema>

type Props = {
  onSubmit: (data: ShippingAddress) => void
  defaultValues?: Partial<ShippingFormValues>
}

export const ShippingAddressForm = ({ onSubmit, defaultValues }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { country: 'AU', ...defaultValues },
  })

  // defaultValues arrive asynchronously (fetched after mount in the parent).
  // useForm only reads defaultValues on first render, so we reset whenever
  // the prop changes to populate the fields once the data is available.
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      reset({ country: 'AU', ...defaultValues })
    }
  }, [defaultValues, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 border">
      <h2 className="text-2xl font-bold">Shipping Address</h2>

      <div className="grid gap-4 md:grid-cols-2">

        {/* Full name */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register('phone')} />
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Address line 1 */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="address_line1">Street Address</Label>
          <Input id="address_line1" {...register('address_line1')} />
          {errors.address_line1 && <p className="text-sm text-destructive">{errors.address_line1.message}</p>}
        </div>

        {/* Address line 2 */}
        <div className="md:col-span-2 space-y-1">
          <Label htmlFor="address_line2">Apartment, suite, etc. (optional)</Label>
          <Input id="address_line2" {...register('address_line2')} />
        </div>

        {/* City */}
        <div className="space-y-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        {/* State */}
        <div className="space-y-1">
          <Label htmlFor="state">State (optional)</Label>
          <Input id="state" {...register('state')} />
        </div>

        {/* Postal code */}
        <div className="space-y-1">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input id="postal_code" {...register('postal_code')} />
          {errors.postal_code && <p className="text-sm text-destructive">{errors.postal_code.message}</p>}
        </div>

        {/* Country */}
        <div className="space-y-1">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} />
          {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
        </div>

      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        Continue to Payment
      </Button>
    </form>
  )
}
