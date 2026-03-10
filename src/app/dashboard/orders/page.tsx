/**
 * Dashboard - Orders page
 *
 * Shows the signed-in user's full order history.
 * Server Component: data is fetched at request time, no client JS needed.
 */

import { getUserOrders } from '@/lib/actions/orders';
import { createClient } from '@/lib/supabase/server';
import { OrderCard } from '@/components/orders/order-card';

export default async function DashboardOrdersPage() {

  // ============================================================
  // Get the current user and fetch their orders
  //
  // Think about:
  //   - How did dashboard/layout.tsx get the current user?
  //   - What does getUserOrders() need, and where does that come from?
  //   - What should `orders` look like when you're done?
  // ============================================================

  // get the supabase client, get the current user, then fetch their orders
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userOrders = await getUserOrders(user!.id);





  // ============================================================
  // RENDER
  // ============================================================

  // Empty state - shown when the user has no orders yet
  if (userOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <h2 className="text-xl font-semibold">Order History</h2>
      
      {/* YOUR TASK: map over orders and render an <OrderCard> for each one */}
      {/* Hint: OrderCard takes a single `order` prop */}

      {userOrders.map((order) => (
        <OrderCard order={order} key={order.id}/>
      ))}

    </div>
  );
}
