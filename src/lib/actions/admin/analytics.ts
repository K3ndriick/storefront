'use server';

import { createAdminClient } from "@/lib/supabase/admin";
import { AnalyticsSummary } from "@/lib/types";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = createAdminClient();

  let currentDate = new Date();
  let year = currentDate.getFullYear();
  let month = String(currentDate.getMonth() + 1).padStart(2, '0');;

  let startDate = `${year}-${month}-01`;

  const [monthlyOrdersAnalytics, alltimeOrdersAnalytics, productsAnalytics, profilesAnalytics] = await Promise.all([
    // orders this month
    supabase.from('orders').select("*").gte("created_at", startDate),
    // orders all time
    supabase.from('orders').select("*"),
    // products
    supabase.from('products').select("*"),
    // profiles
    supabase.from('profiles').select("*")
  ]);

  return {
    revenueThisMonth: monthlyOrdersAnalytics.data?.reduce((accumulator, currentOrder) => 
      accumulator + currentOrder.total,
      0,
    ) ?? 0,
    revenueAllTime: alltimeOrdersAnalytics.data?.reduce((accumulator, currentOrder) => 
      accumulator + currentOrder.total,
      0,
    ) ?? 0,
    ordersThisMonth: monthlyOrdersAnalytics.data?.length ?? 0,
    ordersAllTime: alltimeOrdersAnalytics.data?.length ?? 0,
    pendingOrders: alltimeOrdersAnalytics.data?.filter((order) => order.status === "pending").length ?? 0,
    processingOrders: alltimeOrdersAnalytics.data?.filter((order) => order.status === "processing").length ?? 0,
    lowStockCount: productsAnalytics.data?.filter((product) => product.stock_quantity <= product.low_stock_threshold).length ?? 0,
    totalProducts: productsAnalytics.data?.length ?? 0,
    totalCustomers: profilesAnalytics.data?.filter((profile) => profile.role === "customer").length ?? 0,
  }
}
