'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createAddress, updateAddress } from '@/lib/actions/addresses';
import type { Address, AddressFormData } from '@/lib/types/address';

const addressSchema = z.object({
  label:         z.string(),
  name:          z.string().min(1, 'Name is required'),
  address_line1: z.string().min(1, 'Address is required'),
  address_line2: z.string(),
  city:          z.string().min(1, 'City is required'),
  state:         z.string(),
  postal_code:   z.string().min(4, 'Postal code is required'),
  country:       z.string().default('AU'),
  phone:         z.string(),
  is_default:    z.boolean().default(false),
});

type Props = {
  address?: Address;
  onDone: () => void;
};

export function AddressForm({ address, onDone }: Props) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label:         address?.label         ?? '',
      name:          address?.name          ?? '',
      address_line1: address?.address_line1 ?? '',
      address_line2: address?.address_line2 ?? '',
      city:          address?.city          ?? '',
      state:         address?.state         ?? '',
      postal_code:   address?.postal_code   ?? '',
      country:       address?.country       ?? 'AU',
      phone:         address?.phone         ?? '',
      is_default:    address?.is_default    ?? false,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = async (data: AddressFormData) => {
    setError(null);
    const result = address
      ? await updateAddress(address.id, data)
      : await createAddress(data);

    if (result) {
      setError(result);
    } else {
      onDone();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Home, Work..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="+61 4XX XXX XXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address_line1"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main Street" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address_line2"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Address line 2 <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Apartment, unit, floor..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Melbourne" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State <span className="text-muted-foreground">(optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="VIC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal code</FormLabel>
                <FormControl>
                  <Input placeholder="3000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Set as default address
              </FormLabel>
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : address ? 'Save changes' : 'Add address'}
          </Button>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
        </div>

      </form>
    </Form>
  );
}
