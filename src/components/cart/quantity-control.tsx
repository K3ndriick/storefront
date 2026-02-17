'use client';

/**
 * QuantityControl
 *
 * A reusable [ - | n | + ] stepper for selecting a numeric quantity.
 *
 * Design decisions:
 * - This component is "controlled" - it holds NO internal state.
 *   The parent owns the value and provides onChange to update it.
 *   This means the same component works in CartItem (calls updateQuantity)
 *   or on a product page (would call a local useState setter).
 *
 * - The minus button is disabled when value <= min (default: 1).
 *   This prevents the user from going below the minimum without needing
 *   any guard logic in the parent.
 *
 * - The plus button is disabled when value >= max (default: 10).
 *   CartItem passes item.maxQuantity here, which is Math.min(stock, 10).
 *
 * - The component calls onChange(value - 1) or onChange(value + 1).
 *   It does NOT call removeItem when reaching 0 - that logic lives in
 *   updateQuantity() inside the cart store, keeping this component
 *   unaware of cart business rules.
 *
 * Usage:
 *   <QuantityControl
 *     value={item.quantity}
 *     onChange={(qty) => updateQuantity(item.productId, qty)}
 *     max={item.maxQuantity}
 *   />
 */

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  /** The current quantity value (controlled - managed by the parent) */
  value: number
  /** Called with the new value when + or - is clicked */
  onChange: (value: number) => void
  /** Minimum allowed value - the minus button disables at this point (default: 1) */
  min?: number
  /** Maximum allowed value - the plus button disables at this point (default: 10) */
  max?: number
  /** Disables both buttons entirely, e.g. during a loading state */
  disabled?: boolean
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false
}: Props) {
  return (
    <div className="flex items-center gap-2">

      {/* Decrease button - disabled at min boundary */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(value - 1)}
        disabled={value <= min || disabled}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </Button>

      {/* Current value display - fixed width to prevent layout shift */}
      <span className="w-12 text-center font-medium">
        {value}
      </span>

      {/* Increase button - disabled at max boundary */}
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={() => onChange(value + 1)}
        disabled={value >= max || disabled}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </Button>

    </div>
  )
}
