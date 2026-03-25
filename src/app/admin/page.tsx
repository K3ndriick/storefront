import { getAnalyticsSummary } from "@/lib/actions/admin/analytics";

export default async function AdminPage() {
    // fetch ana;ytics data from DB
    const analytics = await getAnalyticsSummary();

    const stats = [
      { label: 'Revenue This Month', value: `$${analytics.revenueThisMonth.toFixed(2)}` },
      { label: 'Revenue All Time', value: `$${analytics.revenueAllTime.toFixed(2)}` },
      { label: 'Orders This Month', value: `${analytics.ordersThisMonth}` },
      { label: 'Orders All Time', value: `${analytics.ordersAllTime}` },
      { label: 'Processing Orders', value: `${analytics.processingOrders}` },
      { label: 'Pending Orders', value: `${analytics.pendingOrders}` },
      { label: 'Total Products', value: `${analytics.totalProducts}` },
      { label: 'Low Stock Products', value: `${analytics.lowStockCount}` },
      { label: 'Total Customers', value: `${analytics.totalCustomers}` },
    ]


    return(
      <div className="min-h-screen bg-background">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div className="bg-card border p-6" key={stat.label}>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    )
}
