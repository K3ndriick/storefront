// Shared Stripe configuration - imported by both server.ts and client.ts.
// No Stripe SDK imported here, just plain values.

export const stripeConfig = {
  // Reference the two environment variables you added to .env.local
  // Remember: one needs NEXT_PUBLIC_ prefix (browser-safe), one doesn't (server-only)
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,

  // Business constants - AUD because this is an Australian business
  currency: 'aud',
  country: 'AU',
}
