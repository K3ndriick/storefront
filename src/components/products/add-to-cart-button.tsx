'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/lib/types/products';

type AddToCartButtonProps = {
  product: Product
  disabled?: boolean
}

export function AddToCartButton({ product, disabled = false }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    // Implement add to cart
    //
    // Steps:
    // 1. Set isAdding to true
    //
    // 2. Call addItem(product, 1) inside a try/catch
    //    - On success: call toast.success() with a title and description
    //      e.g. toast.success('Added to cart', { description: product.name })
    //    - On catch (error): call toast.error() with the error message
    //      Hint: error instanceof Error ? error.message : 'Failed to add to cart'
    //
    // 3. Set isAdding to false in a finally block
    //    (finally runs whether the try succeeded or the catch ran)
    //
    // Note: addItem is synchronous - no await needed, no async on this function
    setIsAdding(true);

    try {
      addItem(product, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className="w-full"
      size="lg"
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? 'Adding...' : disabled ? 'Out of Stock' : 'Add to Cart'}
    </Button>
  )
}