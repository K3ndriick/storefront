// Server component - fetches and lists all orders for the current user.
// proxy.ts already guarantees the user is authenticated before this renders.

import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/actions/orders';
import { OrderCard } from '@/components/orders/order-card';

export default async function OrdersPage() {
  // Fetch the current user and their orders
  //
  // 1. Create the Supabase server client:
  //      const supabase = await createClient()
  //
  // 2. Get the current user:
  //      const { data: { user } } = await supabase.auth.getUser()
  //    proxy.ts guarantees user is non-null here, so user! is safe
  //
  // 3. Call getUserOrders(user!.id) to get their orders
  //    Store the result in a variable called `orders`
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  const orders = await getUserOrders(user!.id);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">

        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-4">You haven&apos;t placed any orders yet.</p>
            <a href="/products" className="underline hover:text-foreground transition-colors">
              Start shopping
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
