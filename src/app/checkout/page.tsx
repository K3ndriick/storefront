'use client';

// The checkout page manages a two-step flow:
//   Step 1 -> Shipping address form
//   Step 2 -> Stripe payment form (only rendered once we have a clientSecret)
//
// The OrderSummary sidebar is always visible on both steps.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';
import { useAuth } from '@/lib/auth/auth-context';
import { useCartStore } from '@/store/useCartStore';
import { createPaymentIntent } from '@/lib/actions/stripe';
import { ShippingAddressForm } from '@/components/checkout/shipping-address-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import type { ShippingAddress } from '@/lib/types/order';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const items = useCartStore(state => state.items);
  const total = useCartStore(state => state.total());

  // Step tracker: 1 = shipping address, 2 = payment
  const [step, setStep] = useState(1);

  // These are set after the user submits shipping and we create the payment intent
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Redirect to cart if there's nothing to check out.
  // Only on step 1 - on step 2 the cart will be empty after a successful
  // payment and we don't want to override the success page redirect.
  useEffect(() => {
    if (step === 1 && items.length === 0) router.push('/cart')
  }, [items, router, step]);

  // ============================================================
  // SHIPPING SUBMIT HANDLER
  // Called by ShippingAddressForm when the user submits their address.
  // ============================================================

  // Implement this arrow function
  // It receives a ShippingAddress and should:
  //
  // 1. Save the address to state (setShippingAddress)
  //
  // 2. Call createPaymentIntent(total) - this is a server action
  //    It returns { clientSecret, paymentIntentId }
  //
  // 3. Save clientSecret and paymentIntentId to state
  //
  // 4. Advance the step to 2 (setStep)
  //
  // Note: createPaymentIntent is async - this function must be async too
  const handleShippingSubmit = async (address: ShippingAddress) => {
    setShippingAddress(address);
    
    const paymentIntent = await createPaymentIntent(total);
    
    setClientSecret(paymentIntent.clientSecret);
    setPaymentIntentId(paymentIntent.paymentIntentId);
    
    setStep(2);
  }


  // ============================================================
  // RENDER
  // ============================================================

  // proxy.ts handles the auth redirect -- but during the brief loading
  // window before auth resolves, user might be null. Render nothing.
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4">

        {/* Page header */}
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-sm">
          <span className={step === 1 ? 'font-bold' : 'text-muted-foreground'}>
            1. Shipping
          </span>
          <span className="text-muted-foreground">→</span>
          <span className={step === 2 ? 'font-bold' : 'text-muted-foreground'}>
            2. Payment
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main area - left 2/3 */}
          <div className="lg:col-span-2 space-y-6">

            {/* Render the correct component based on the current step */}
            
            {step === 1 && (
              <ShippingAddressForm onSubmit={handleShippingSubmit}/>
            )}

            {(step === 2 && clientSecret && shippingAddress && paymentIntentId) && (
              <Elements
                stripe={getStripe()}
                options={{ clientSecret }}
              >
                <PaymentForm
                  shippingAddress={shippingAddress}
                  paymentIntentId={paymentIntentId}
                />
              </Elements>
            )}

          </div>

          {/* Sidebar - right 1/3 */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>

        </div>
      </div>
    </div>
  )
}
