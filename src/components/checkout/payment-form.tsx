'use client';

// Stripe Elements hooks - only work inside an <Elements> provider (set up in the page)
// useStripe()   -> gives you the stripe instance to call confirmPayment()
// useElements() -> gives you access to the mounted card UI elements

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import { useCartStore } from '@/store/useCartStore';
import { createOrder } from '@/lib/actions/orders';
import type { ShippingAddress } from '@/lib/types/order';

type Props = {
  shippingAddress: ShippingAddress
  paymentIntentId: string
}

export const PaymentForm = ({ shippingAddress, paymentIntentId }: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Read cart data - items for building the order, computed values for totals
  // Note: subtotal/tax/shipping/total are functions in this store, call them to get values
  const items = useCartStore(state => state.items);
  const subtotal = useCartStore(state => state.subtotal());
  const tax = useCartStore(state => state.tax());
  const shipping = useCartStore(state => state.shipping());
  const total = useCartStore(state => state.total());
  const clearCart = useCartStore(state => state.clearCart);

  // ============================================================
  // PAYMENT SUBMIT HANDLER
  // This is the core of the checkout flow.
  // ============================================================

  // Implement this arrow function
  // It receives a React.FormEvent and should:
  //
  // 1. Prevent the default form submission (e.preventDefault())
  //
  // 2. Guard: if stripe, elements, or user is missing - return early
  //    (stripe/elements might not be loaded yet; user should always exist here
  //    since proxy.ts protects /checkout, but TypeScript doesn't know that)
  //
  // 3. Set isProcessing to true
  //
  // 4. Call stripe.confirmPayment() - this submits the card details to Stripe
  //    Arguments: { elements, confirmParams: { return_url: window.location.href }, redirect: 'if_required' }
  //    'if_required' means: only redirect if the payment method forces it (e.g. 3D Secure)
  //    For most test cards it won't redirect - result comes back immediately
  //
  // 5. If the result has an error:
  //    - Show a toast with the error message (toast.error())
  //    - Set isProcessing back to false
  //    - return (stop here - don't create the order)
  //
  // 6. Call createOrder() with all the required data.
  //    Map items from the cart to the CartItemInput shape:
  //      product_id: item.productId
  //      product_name: item.name
  //      product_image: item.image
  //      price: item.salePrice ?? item.price  (use sale price if it exists)
  //      quantity: item.quantity
  //
  // 7. Clear the cart (clearCart())
  //
  // 8. Redirect to the success page: /checkout/success?order_id={order.id}
  //    Use router.push() for this
  //
  // Wrap steps 4-8 in try/catch - if anything throws, show a toast.error()
  // and set isProcessing back to false
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required'
      });

      if (error) {
        toast.error("Unable to process payment: " + error.message);
        setIsProcessing(false);
        return;
      }

      const order = await createOrder({
        user_id: user.id,
        cart_items: items.map((cartItem) => ({
          product_id: cartItem.productId,
          product_name: cartItem.name,
          product_image: cartItem.image,
          price: cartItem.salePrice ?? cartItem.price,
          quantity: cartItem.quantity
        })),
        shipping_address: shippingAddress,
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: total,
        stripe_payment_intent_id: paymentIntentId
      })

      clearCart();
      router.push(`/checkout/success?order_id=${order.id}`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to process payment');

      setIsProcessing(false);
      return;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border">
      <h2 className="text-2xl font-bold">Payment</h2>

      {/* Stripe's hosted card UI - renders securely inside an iframe */}
      <PaymentElement />

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  )
}
