'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressCard } from '@/components/dashboard/address-card';
import { AddressForm } from '@/components/dashboard/address-form';
import { getUserAddresses, deleteAddress, setDefaultAddress } from '@/lib/actions/addresses';
import type { Address } from '@/lib/types/address';

export default function DashboardAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const data = await getUserAddresses();
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleFormDone = () => {
    setShowForm(false);
    load();
  };

  const handleSetDefault = async (id: string) => {
    // Optimistic update - reflect change immediately in the UI
    setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })));
    const result = await setDefaultAddress(id);
    // Revert to server state if the action failed
    if (result) load();
  };

  const handleDelete = async (id: string) => {
    // Optimistic update - remove the card immediately
    setAddresses(prev => prev.filter(a => a.id !== id));
    const result = await deleteAddress(id);
    // Revert to server state if the action failed
    if (result) load();
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Saved Addresses</h2>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add address
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-card border p-6">
          <h3 className="font-semibold mb-4">New address</h3>
          <AddressForm onDone={handleFormDone} />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 border border-dashed">
          <p className="text-muted-foreground mb-4">No saved addresses yet.</p>
          <Button variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onSetDefault={() => handleSetDefault(address.id)}
              onDelete={() => handleDelete(address.id)}
              onEdited={load}
            />
          ))}
        </div>
      )}

    </div>
  );
}
