import { getAnalyticsSummary } from "@/lib/actions/admin/analytics";
import { getAdminAppointments } from "@/lib/actions/admin/appointments";
import { AppointmentCalendarDynamic } from "@/components/appointments/appointment-calendar-dynamic";

export default async function AdminPage() {
    const [analytics, appointments] = await Promise.all([
        getAnalyticsSummary(),
        getAdminAppointments(),
    ]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-auto lg:auto-rows-[130px] gap-4">

                {/* Low Stock - hero alert, needs immediate attention */}
                <div className="col-span-2 lg:row-span-2 bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-destructive/80 uppercase tracking-wide">Low Stock Products</p>
                    <p className="text-5xl font-bold text-destructive">{analytics.lowStockCount}</p>
                </div>

                {/* Pending Orders */}
                <div className="col-span-1 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Pending Orders</p>
                    <p className="text-2xl font-bold">{analytics.pendingOrders}</p>
                </div>

                {/* Processing Orders */}
                <div className="col-span-1 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Processing Orders</p>
                    <p className="text-2xl font-bold">{analytics.processingOrders}</p>
                </div>

                {/* Orders This Month */}
                <div className="col-span-1 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Orders This Month</p>
                    <p className="text-2xl font-bold">{analytics.ordersThisMonth}</p>
                </div>

                {/* Orders All Time */}
                <div className="col-span-1 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Orders All Time</p>
                    <p className="text-2xl font-bold">{analytics.ordersAllTime}</p>
                </div>

                {/* Calendar - spans full width, 4 rows tall */}
                <div className="col-span-2 lg:col-span-4 lg:row-span-4 bg-card border rounded-xl p-4 overflow-x-auto">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-3">This Week</p>
                    <AppointmentCalendarDynamic appointments={appointments} readOnly height="480px" />
                </div>

                {/* Revenue This Month - wide */}
                <div className="col-span-2 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Revenue This Month</p>
                    <p className="text-3xl font-bold">${analytics.revenueThisMonth.toFixed(2)}</p>
                </div>

                {/* Revenue All Time - wide */}
                <div className="col-span-2 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Revenue All Time</p>
                    <p className="text-3xl font-bold">${analytics.revenueAllTime.toFixed(2)}</p>
                </div>

                {/* Total Products */}
                <div className="col-span-2 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Products</p>
                    <p className="text-2xl font-bold">{analytics.totalProducts}</p>
                </div>

                {/* Total Customers */}
                <div className="col-span-2 bg-card border rounded-xl p-6 flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide">Total Customers</p>
                    <p className="text-2xl font-bold">{analytics.totalCustomers}</p>
                </div>

            </div>
    );
}
