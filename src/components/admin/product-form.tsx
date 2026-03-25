'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createProduct, updateProduct, deleteProduct } from '@/lib/actions/admin/products';
import type { Product } from '@/lib/types/products';

type Props = {
  product?: Product
}

export function ProductForm({ product } : Props) {
  const router = useRouter();
  const isEdit = !!product; // double negation

  // variables for product attributes
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? '');
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [category, setCategory] = useState(product?.category ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [price, setPrice] = useState(product?.price.toString() ?? "");
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity.toString() ?? "");
  const [salePrice, setSalePrice] = useState(product?.sale_price?.toString() ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(product?.low_stock_threshold.toString() ?? "");
  const [inStock, setInStock] = useState(product?.in_stock ?? false);
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);

    if (!isEdit) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const inputData = {
      name,
      slug,
      description: description || null,
      // short_description,
      price: parseFloat(price),
      sale_price: salePrice ? parseFloat(salePrice) : null, 
      // cost_price: number | null
      category,
      // subcategory: string | null
      brand: brand || null, 
      sku: sku || null,
      in_stock: inStock,
      stock_quantity: parseInt(stockQuantity),
      low_stock_threshold: parseInt(lowStockThreshold),
      images: product?.images ?? [],
      // primary_image: string | null
      featured,
      // new_arrival: boolean
      // bestseller: boolean
      
      // Metadata
      // created_at: string
      // updated_at: string
    }

    if (isEdit) {
      const productId = product!.id;
      const result = await updateProduct(productId, inputData);

      if (result) {
        setError(result); 
        setSaving(false);
        return;
      }
    } else {
      try {
        await createProduct(inputData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create product');
        setSaving(false);
        return;
      }
    }
    router.push('/admin/products');
  }


  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Basic info */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Basic Information
        </h2>

        <div className="space-y-1">
          <Label>Name</Label>
          <Input value={name} onChange={e => handleNameChange(e.target.value)} required />
        </div>

        <div className="space-y-1">
          <Label>Slug</Label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} required
            className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground">URL: /products/{slug || '...'}</p>
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Category</Label>
            <Input value={category} onChange={e => setCategory(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Brand</Label>
            <Input value={brand} onChange={e => setBrand(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>SKU</Label>
          <Input value={sku} onChange={e => setSku(e.target.value)} className="font-mono" />
        </div>
      </section>

      {/* Pricing */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Pricing
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Price ($)</Label>
            <Input
              type="number" step="0.01" min="0"
              value={price} onChange={e => setPrice(e.target.value)} required
            />
          </div>
          <div className="space-y-1">
            <Label>Sale Price ($) <span className="text-muted-foreground font-normal">optional</span></Label>
            <Input
              type="number" step="0.01" min="0"
              value={salePrice} onChange={e => setSalePrice(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Inventory */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Inventory
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Stock Quantity</Label>
            <Input
              type="number" min="0"
              value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required
            />
          </div>
          <div className="space-y-1">
            <Label>Low Stock Threshold</Label>
            <Input
              type="number" min="0"
              value={lowStockThreshold} onChange={e => setLowStockThreshold(e.target.value)} required
            />
          </div>
        </div>
      </section>

      {/* Flags */}
      <section className="space-y-4 bg-card border p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Visibility
        </h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)}
            className="w-4 h-4" />
          <span className="text-sm font-medium">Active (visible on storefront)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
            className="w-4 h-4" />
          <span className="text-sm font-medium">Featured (shown on homepage)</span>
        </label>
      </section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>

      {isEdit && (
        <div className="border-t pt-8">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">
            Danger Zone
          </h2>
          {!confirmDelete ? (
            <Button
              type="button"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setConfirmDelete(true)}
            >
              Delete Product
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <p className="text-sm text-destructive font-medium">
                This will remove the product from the storefront. Are you sure?
              </p>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  const result = await deleteProduct(product!.id);
                  if (result) {
                    setError(result);
                    setDeleting(false);
                    setConfirmDelete(false);
                  } else {
                    router.push('/admin/products');
                  }
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </form>
  )
}