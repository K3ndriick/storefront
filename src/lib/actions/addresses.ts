'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Address, AddressFormData } from '@/lib/types/address';

export async function getUserAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createAddress(input: AddressFormData): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (input.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user!.id);
  }

  const { error } = await supabase.from('addresses').insert({
    user_id: user!.id,
    label: input.label || null,
    name: input.name,
    address_line1: input.address_line1,
    address_line2: input.address_line2 || null,
    city: input.city,
    state: input.state || null,
    postal_code: input.postal_code,
    country: input.country,
    phone: input.phone || null,
    is_default: input.is_default,
  });

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}

export async function updateAddress(
  id: string,
  input: AddressFormData
): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (input.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user!.id);
  }

  const { error } = await supabase
    .from('addresses')
    .update({
      label: input.label || null,
      name: input.name,
      address_line1: input.address_line1,
      address_line2: input.address_line2 || null,
      city: input.city,
      state: input.state || null,
      postal_code: input.postal_code,
      country: input.country,
      phone: input.phone || null,
      is_default: input.is_default,
    })
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}

export async function deleteAddress(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}

export async function setDefaultAddress(id: string): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Clear existing default
  const { error: clearError } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', user!.id);

  if (clearError) return clearError.message;

  // Set new default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user!.id);

  if (error) return error.message;
  revalidatePath('/dashboard/addresses');
  return null;
}
