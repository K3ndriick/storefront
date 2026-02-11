'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types/products';

type AddToCartButtonProps = {
  product: Product
  disabled?: boolean
}

export function AddToCartButton({ product, disabled = false }: AddToCartButtonProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // state for loading (when adding to cart)
  const [isLoading, setIsLoading] = useState(false);
  
  // state for success feedback (optional - shows "Added!" briefly)
  const [showSuccess, setShowSuccess] = useState(false);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleAddToCart = async () => {
    // TODO: Implement add to cart logic
    // For now (Phase 2B), just console.log the product
    // Later (Phase 3), we'll integrate with Zustand cart store
    console.log(product);
    
    // Step 1: Set loading state to true
    setIsLoading(true);
    
    // Step 2: Simulate adding to cart (console.log for now)
    console.log('Adding to cart:', product.name)
    
    // Step 3: Simulate API delay (remove this later)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Step 4: Set loading state to false
    setIsLoading(false);
    
    // Step 5: Show success state briefly (optional)
    setShowSuccess(true);

    // Step 6: Reset success state after 2 seconds (optional)
    setTimeout(() => { setShowSuccess(false); }, 2000);
  }

  const getButtonText = () => {
    if (disabled) return "Out of Stock"
    if (isLoading) return "Adding..."
    if (showSuccess) return "Added!"
    return "Add to Cart"
  }
  
  // ============================================
  // RENDER
  // ============================================
  return (
    <Button
      onClick={handleAddToCart}
      disabled={disabled}
      className="w-full"
      size="lg"
    >
      {getButtonText()}    
</Button>
  )
}