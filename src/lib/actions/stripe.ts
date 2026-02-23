'use server';

import { stripe } from '@/lib/stripe/server';
import { stripeConfig } from '@/lib/stripe/config';

// Creates a Stripe PaymentIntent on the server and returns the clientSecret
// to the browser so it can render the payment form and confirm the payment.
//
// amount: the order total in dollars (e.g. 150.00)
// Stripe requires amounts in cents (e.g. 15000) - you'll need to convert.
// OFFICIAL STRIPE DOCS: https://docs.stripe.com/api/payment_intents/create

export const createPaymentIntent = async (amount: number) => {
  try {
    // Call stripe.paymentIntents.create() with:
    //   - amount: converted to cents (multiply by 100, round to avoid floating point issues)
    //   - currency: from stripeConfig
    //   - automatic_payment_methods: { enabled: true }
    //     (this lets Stripe show the right payment options for the customer's region)
    //
    // const paymentIntent = await stripe.paymentIntents.create({ ... })
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: stripeConfig.currency,
      automatic_payment_methods: { enabled: true }
    });

    // Return an object with two fields:
    //   - clientSecret: paymentIntent.client_secret
    //   - paymentIntentId: paymentIntent.id
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    }

  } catch (error) {
    console.error('Failed to create payment intent:', error)
    throw new Error('Failed to create payment intent')
  }
}
