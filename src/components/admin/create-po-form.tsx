'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPurchaseOrder } from '@/lib/actions/admin/purchase-orders';
import type { Supplier, AdminProduct } from '@/lib/types';

type LineItem = {
  productId:   string;
  quantity:    string;
  costPerUnit: string;
};

type Props = {
  suppliers:   Supplier[];
  products:    AdminProduct[];
  adminUserId: string;
};

const emptyItem = (): LineItem => ({ productId: '', quantity: '', costPerUnit: '' });

export function CreatePoForm({ suppliers, products, adminUserId }: Props) {
  const router = useRouter();

  const [supplierId,       setSupplierId]       = useState('');
  const [orderNumber,      setOrderNumber]      = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes,            setNotes]            = useState('');
  const [items,            setItems]            = useState<LineItem[]>([emptyItem()]);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  // ---- line item helpers ----

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // ---- computed total ----

  const total = items.reduce((sum, item) => {
    const qty  = parseFloat(item.quantity)    || 0;
    const cost = parseFloat(item.costPerUnit) || 0;
    return sum + qty * cost;
  }, 0);

  // ---- submit ----

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!orderNumber.trim()) return setError('Order number is required.');

    // Validate and coerce line items
    const validatedItems: { product_id: string; quantity: number; cost_per_unit: number }[] = [];
    for (const [i, item] of items.entries()) {
      if (!item.productId)                  return setError(`Row ${i + 1}: select a product.`);
      const qty  = parseInt(item.quantity,    10);
      const cost = parseFloat(item.costPerUnit);
      if (isNaN(qty)  || qty  <= 0) return setError(`Row ${i + 1}: quantity must be a positive integer.`);
      if (isNaN(cost) || cost <= 0) return setError(`Row ${i + 1}: cost must be a positive number.`);
      validatedItems.push({ product_id: item.productId, quantity: qty, cost_per_unit: cost });
    }

    // Duplicate product check
    const productIds = validatedItems.map((i) => i.product_id);
    if (new Set(productIds).size !== productIds.length) {
      return setError('Each product can only appear once per order. Remove duplicates.');
    }

    setSaving(true);
    const result = await createPurchaseOrder(
      {
        supplier_id:       supplierId || null,
        order_number:      orderNumber.trim(),
        expected_delivery: expectedDelivery || null,
        notes:             notes.trim() || null,
        items:             validatedItems,
      },
      adminUserId
    );
    setSaving(false);

    if (result) {
      setError(result);
    } else {
      router.push('/admin/purchase-orders');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Header fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="space-y-1.5">
          <Label htmlFor="po-number">Order number *</Label>
          <Input
            id="po-number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. PO-2026-001"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="po-supplier">Supplier</Label>
          <select
            id="po-supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full border bg-background text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">No supplier</option>
            {suppliers.filter((s) => s.active).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="po-delivery">Expected delivery</Label>
          <Input
            id="po-delivery"
            type="date"
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
          />
        </div>

      </div>

      <div className="space-y-1.5">
        <Label htmlFor="po-notes">Notes</Label>
        <Textarea
          id="po-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          rows={2}
        />
      </div>

      {/* Line items */}
      <div className="space-y-3">
        <h3 className="font-medium">Line items</h3>

        <div className="bg-card border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-right px-4 py-2 font-medium w-28">Quantity</th>
                <th className="text-right px-4 py-2 font-medium w-32">Cost / unit</th>
                <th className="text-right px-4 py-2 font-medium w-28">Subtotal</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, index) => {
                const qty      = parseFloat(item.quantity)    || 0;
                const cost     = parseFloat(item.costPerUnit) || 0;
                const subtotal = qty * cost;
                return (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="w-full border bg-background text-sm px-2 py-1.5 outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}{p.sku ? ` (${p.sku})` : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        className="text-right"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.costPerUnit}
                        onChange={(e) => updateItem(index, 'costPerUnit', e.target.value)}
                        placeholder="0.00"
                        className="text-right"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground font-mono">
                      {subtotal > 0 ? `$${subtotal.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-muted-foreground hover:text-destructive text-lg leading-none"
                          aria-label="Remove row"
                        >
                          &times;
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t bg-muted/30">
              <tr>
                <td colSpan={3} className="px-4 py-2 text-sm text-right font-medium">
                  Total
                </td>
                <td className="px-4 py-2 text-right font-mono font-bold">
                  ${total.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <Button type="button" variant="outline" onClick={addItem}>
          + Add product
        </Button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create purchase order'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/purchase-orders')}
        >
          Cancel
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
