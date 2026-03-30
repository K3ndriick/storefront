import { getLowStockProducts, getOutOfStockProducts, getStockAdjustments } from '@/lib/actions/admin/inventory';
import { getAllProducts } from '@/lib/actions/admin/products';
import { createClient } from '@/lib/supabase/server';
import { StockAdjustmentForm } from '@/components/admin/stock-adjustment-form';
import { notFound } from 'next/navigation';

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [lowStock, outOfStock, adjustments, allProducts] = await Promise.all([
    getLowStockProducts(),
    getOutOfStockProducts(),
    getStockAdjustments(),
    getAllProducts(),
  ]);

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">Inventory</h1>

      {/* ---- Low stock alerts ---- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Low stock
          {lowStock.length > 0 && (
            <span className="ml-2 text-sm font-normal text-destructive">
              ({lowStock.length} product{lowStock.length > 1 ? 's' : ''})
            </span>
          )}
        </h2>

        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products below threshold.</p>
        ) : (
          <div className="bg-card border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-right px-4 py-3 font-medium">Threshold</th>
                  <th className="text-right px-4 py-3 font-medium">In stock</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {lowStock.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      {p.sku && <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground font-mono">
                      {p.low_stock_threshold}
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${
                      p.stock_quantity === 0 ? 'text-destructive' : 'text-yellow-600'
                    }`}>
                      {p.stock_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---- Out of stock ---- */}
      {outOfStock.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">
            Out of stock
            <span className="ml-2 text-sm font-normal text-destructive">
              ({outOfStock.length})
            </span>
          </h2>
          <div className="bg-card border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {outOfStock.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.name}</p>
                      {p.sku && <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{p.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---- Record adjustment ---- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Record adjustment</h2>
        <div className="bg-card border p-6 max-w-xl">
          <StockAdjustmentForm products={allProducts} adminUserId={user.id} />
        </div>
      </section>

      {/* ---- Adjustment log ---- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Adjustment history</h2>

        {adjustments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No adjustments recorded yet.</p>
        ) : (
          <div className="bg-card border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">Product</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-right px-4 py-3 font-medium">Change</th>
                  <th className="text-right px-4 py-3 font-medium">New qty</th>
                  <th className="text-left px-4 py-3 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adjustments.map((adj) => {
                  const date = new Date(adj.created_at).toLocaleDateString('en-AU', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  });
                  return (
                    <tr key={adj.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{date}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{adj.products.name}</p>
                        {adj.products.sku && (
                          <p className="text-xs text-muted-foreground font-mono">{adj.products.sku}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{adj.adjustment_type}</td>
                      <td className={`px-4 py-3 text-right font-mono font-medium ${
                        adj.quantity_change > 0 ? 'text-green-600' : 'text-destructive'
                      }`}>
                        {adj.quantity_change > 0 ? '+' : ''}{adj.quantity_change}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{adj.new_quantity}</td>
                      <td className="px-4 py-3 text-muted-foreground">{adj.reason ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
