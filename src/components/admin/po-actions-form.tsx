'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updatePurchaseOrderStatus, receivePurchaseOrder } from '@/lib/actions/admin/purchase-orders';
import type { PurchaseOrderStatus } from '@/lib/types';

type Props = {
  poId: string;
  currentStatus: PurchaseOrderStatus;
  adminUserId: string;
};

// Valid transitions for each non-terminal status
const TRANSITIONS: Record<'pending' | 'ordered', { value: PurchaseOrderStatus; label: string }[]> = {
  pending: [
    { value: 'ordered',   label: 'Ordered'   },
    { value: 'cancelled', label: 'Cancelled' },
  ],
  ordered: [
    { value: 'received',  label: 'Received'  },
    { value: 'cancelled', label: 'Cancelled' },
  ],
};

export function PoActionsForm({ poId, currentStatus, adminUserId }: Props) {
  const router = useRouter();

  // No actions available for terminal states
  if (currentStatus === 'received' || currentStatus === 'cancelled') {
    return null;
  }

  const options = TRANSITIONS[currentStatus];

  const [selected, setSelected] = useState<PurchaseOrderStatus>(options[0].value);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 'received' triggers the RPC which also writes stock adjustments.
    // All other transitions are simple status updates.
    const result = selected === 'received'
      ? await receivePurchaseOrder(poId, adminUserId)
      : await updatePurchaseOrderStatus(poId, selected as Extract<PurchaseOrderStatus, 'ordered' | 'cancelled'>);

    setLoading(false);

    if (result) {
      setError(result);
    } else {
      setSuccess(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <select
          value={selected}
          onChange={(e) => { setSelected(e.target.value as PurchaseOrderStatus); setSuccess(false); }}
          className="border bg-background text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <Button
          onClick={handleSubmit}
          disabled={loading || selected === currentStatus}
        >
          {loading ? 'Saving...' : 'Update status'}
        </Button>
      </div>

      {error   && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Status updated.</p>}
    </div>
  );
}
