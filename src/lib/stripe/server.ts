// Server-only Stripe SDK instance.
// Import this ONLY in server actions and API routes — never in client components.
// The secret key must never reach the browser.

import Stripe from 'stripe';
import { stripeConfig } from './config';

// Initialise the Stripe SDK and export it as `stripe`
// You need two things:
//   1. The secret key (from stripeConfig)
//   2. The API version: '2024-11-20.acacia'  ← Stripe requires you to pin this
//
// Note: new Stripe(key, { apiVersion: '...' })

export const stripe = new Stripe(stripeConfig.secretKey, { apiVersion: '2026-01-28.clover' });