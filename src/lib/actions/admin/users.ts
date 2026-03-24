'use server';

import { createAdminClient } from "@/lib/supabase/admin";

const PROFILE_ROLES = ['admin', 'customer'] as const;
type ProfileRoles = typeof PROFILE_ROLES[number];

export async function getAllUsers() {
  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    throw(error);
  } 
  
  // return obj of user IDs
  const { data: orderCounts } = await supabase
    .from("orders")
    .select("user_id");

  // reduce func to count the instances that a user ID has appeared in teh previous orderCounts obj
  // final result is { abc: 2, xyz: 1 }
  const orderCountMap = (orderCounts ?? []).reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.user_id] = (accumulator[row.user_id] ?? 0) + 1
    
    return accumulator;
  }, {})

  // then map the profiles to our orderCount results
  return (profiles ?? []).map((profile) => ({
    ...profile,
    order_count: orderCountMap[profile.id] ?? 0,
  }));
}

export async function updateUserRole(id: string, role: ProfileRoles): Promise<string | null> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return (`Unable to update user role: ${error.message}`);
  }

  return null;
}