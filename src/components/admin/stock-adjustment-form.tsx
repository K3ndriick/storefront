'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createStockAdjustment } from '@/lib/actions/admin/inventory';
import type { AdminProduct, AdjustmentType } from '@/lib/types';

type Props = {
  products: AdminProduct[];
  adminUserId: string;
};

const ADJUSTMENT_TYPES: { value: AdjustmentType; label: string }[] = [
  { value: 'restock',    label: 'Restock'     },
  { value: 'return',     label: 'Return'      },
  { value: 'adjustment', label: 'Adjustment'  },
];

export function StockAdjustmentForm({ products, adminUserId }: Props) {
  const [productId,   setProductId]   = useState('');
  const [type,        setType]        = useState<AdjustmentType>('restock');
  const [delta,       setDelta]       = useState('');
  const [reason,      setReason]      = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState(false);

  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const qty = parseInt(delta, 10);
    if (!productId)       return setError('Select a product.');
    if (isNaN(qty) || qty === 0) return setError('Enter a non-zero quantity.');

    // For restock and return, the delta must be positive.
    // For adjustment it can be negative (write-off) or positive.
    const quantityChange = type === 'adjustment' ? qty : Math.abs(qty);

    setSaving(true);
    const result = await createStockAdjustment(
      { product_id: productId, adjustment_type: type, quantity_change: quantityChange, reason: reason || null },
      adminUserId
    );
    setSaving(false);

    if (result) {
      setError(result);
    } else {
      setSuccess(true);
      setProductId('');
      setDelta('');
      setReason('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Product */}
      <div className="space-y-1.5">
        <Label htmlFor="adj-product">Product</Label>
        <select
          id="adj-product"
          value={productId}
          onChange={(e) => { setProductId(e.target.value); setSuccess(false); }}
          className="w-full border bg-background text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Select a product...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}{p.sku ? ` (${p.sku})` : ''} - current stock: {p.stock_quantity}
            </option>
          ))}
        </select>
      </div>

      {/* Type + Quantity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="adj-type">Type</Label>
          <select
            id="adj-type"
            value={type}
            onChange={(e) => setType(e.target.value as AdjustmentType)}
            className="w-full border bg-background text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
          >
            {ADJUSTMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="adj-qty">
            {type === 'adjustment' ? 'Quantity (+ or -)' : 'Quantity'}
          </Label>
          <Input
            id="adj-qty"
            type="number"
            value={delta}
            onChange={(e) => { setDelta(e.target.value); setSuccess(false); }}
            placeholder={type === 'adjustment' ? 'e.g. -3 or 5' : 'e.g. 10'}
          />
        </div>
      </div>

      {/* Preview */}
      {selectedProduct && delta && !isNaN(parseInt(delta, 10)) && (
        <p className="text-sm text-muted-foreground">
          Stock will change from{' '}
          <span className="font-mono font-medium">{selectedProduct.stock_quantity}</span>
          {' '}to{' '}
          <span className="font-mono font-medium">
            {selectedProduct.stock_quantity + (
              type === 'adjustment'
                ? parseInt(delta, 10)
                : Math.abs(parseInt(delta, 10))
            )}
          </span>
        </p>
      )}

      {/* Reason */}
      <div className="space-y-1.5">
        <Label htmlFor="adj-reason">Reason (optional)</Label>
        <Input
          id="adj-reason"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setSuccess(false); }}
          placeholder="e.g. Supplier delivery, damaged goods..."
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Record adjustment'}
      </Button>

      {error   && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Adjustment recorded.</p>}
    </form>
  );
}
