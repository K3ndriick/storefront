'use client';

import { updateOrderStatus } from "@/lib/actions/admin/orders";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  orderId: string,
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
};

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export function OrderStatusForm({ orderId, currentStatus }: Props) {
  const [selectedOrderStatus, setSelectedOrderStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const result = await updateOrderStatus(orderId, selectedOrderStatus);

    if (result) {
      setError(result);
    } else {
      setSuccess(true);
    }

    setSaving(false);
  }

  return (
    <div className="bg-card border p-6 mt-6">
      <h2 className="font-bold mb-4">Update Status</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <select
          value={selectedOrderStatus}
          onChange={(e) => {
            setSelectedOrderStatus(e.target.value as typeof currentStatus);
            setSuccess(false);
          }}
          className="border bg-background text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>

        <Button
          onClick={handleSubmit}
          disabled={saving || selectedOrderStatus === currentStatus}
        >
          {saving ? 'Saving...' : 'Update status'}
        </Button>
      </div>

      {error   && <p className="text-sm text-destructive mt-3">{error}</p>}
      {success && <p className="text-sm text-green-600 mt-3">Status updated.</p>}
    </div>
  );
}
