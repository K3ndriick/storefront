import Link from 'next/link';
import type { Order } from '@/lib/types/order';

// Maps each order status to a Tailwind colour so the badge is visually distinct
const statusStyles: Record<Order['status'], string> = {
  pending:    'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-purple-100 text-purple-800',
  delivered:  'bg-green-100 text-green-800',
  cancelled:  'bg-red-100 text-red-800',
}

type Props = {
  order: Order
}

export const OrderCard = ({ order }: Props) => {
  // Format the ISO date string into a readable date (e.g. "24 Feb 2026")
  const date = new Date(order.created_at).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-card border p-6 hover:bg-accent/50 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        {/* Left: order ref + date */}
        <div>
          <p className="font-mono font-bold text-sm">{order.order_number}</p>
          <p className="text-xs text-muted-foreground mt-1">{date}</p>
        </div>

        {/* Centre: status badge */}
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[order.status]}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>

        {/* Right: total */}
        <p className="font-bold">${order.total.toFixed(2)}</p>

      </div>
    </Link>
  )
}
