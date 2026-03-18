'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressForm } from '@/components/dashboard/address-form';
import type { Address } from '@/lib/types/address';

type Props = {
  address: Address;
  onSetDefault: () => void;
  onDelete: () => void;
  onEdited: () => void;
};

export function AddressCard({ address, onSetDefault, onDelete, onEdited }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="bg-card border p-6">
        <h3 className="font-semibold mb-4">Edit address</h3>
        <AddressForm address={address} onDone={() => { setEditing(false); onEdited(); }} />
      </div>
    );
  }

  return (
    <div className="bg-card border p-6">
      <div className="flex items-start justify-between gap-4">

        <div className="flex gap-3">
          <MapPin className="w-4 h-4 mt-1 shrink-0 text-muted-foreground" />
          <div className="text-sm space-y-0.5">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{address.name}</p>
              {address.label && (
                <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                  {address.label}
                </span>
              )}
              {address.is_default && (
                <span className="text-xs bg-primary text-primary-foreground rounded px-1.5 py-0.5">
                  Default
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{address.address_line1}</p>
            {address.address_line2 && (
              <p className="text-muted-foreground">{address.address_line2}</p>
            )}
            <p className="text-muted-foreground">
              {address.city}
              {address.state ? `, ${address.state}` : ''} {address.postal_code}
            </p>
            <p className="text-muted-foreground">{address.country}</p>
            {address.phone && (
              <p className="text-muted-foreground">{address.phone}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>

      </div>

      {!address.is_default && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onSetDefault}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Set as default
          </button>
        </div>
      )}
    </div>
  );
}
