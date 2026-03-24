'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { AdminOrder } from "@/lib/types";
import { OrderWithItems } from "@/lib/types";
import { revalidatePath } from "next/cache";

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('orders')
    .select("id, order_number, status, total, created_at, shipping_name, shipping_email")
    .order("created_at", { ascending: false });

    if (error) {
      console.error(`Unable to perform admin orders retrieval: ${error.message}`)
      throw error;
    }

    return (data ?? []).map((order) => ({
      ...order,
      customer_name: order.shipping_name,
      customer_email: order.shipping_email
    }));
}

export async function getAdminOrderById(id: string): Promise<OrderWithItems> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .eq("id", id)
    .single();

    if (error) {
      console.error(`Unable to perform getAdminOrderById: ${error.message}`)
      throw error;
    }

    return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<string | null> {
  if (!ORDER_STATUSES.includes(status)) return 'Invalid status';
  
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

    if (error) {
      return(error.message);
    } else {
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${id}`);

      return null;
    }
}
