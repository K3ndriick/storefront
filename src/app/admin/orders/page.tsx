import { getAdminOrders } from "@/lib/actions/admin/orders";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  pending:    'badge-status-pending',
  processing: 'badge-status-processing',
  shipped:    'badge-status-shipped',
  delivered:  'badge-status-delivered',
  cancelled:  'badge-status-cancelled',
};

export default async function AdminOrdersPage() {
  const adminOrders = await getAdminOrders();

  if (adminOrders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No orders have been placed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Orders</h2>

      <div className="space-y-3">
        {adminOrders.map((order) => {
          const date = new Date(order.created_at).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border p-5 hover:bg-muted transition-colors"
            >
              {/* Order ref + customer */}
              <div className="min-w-0">
                <p className="font-mono font-bold text-sm">{order.order_number}</p>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {order.customer_name} &middot; {order.customer_email}
                </p>
              </div>

              {/* Date + status + total */}
              <div className="flex items-center gap-4 shrink-0">
                <p className="text-sm text-muted-foreground">{date}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[order.status] ?? ''}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <p className="font-bold text-sm w-20 text-right">${order.total.toFixed(2)}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
