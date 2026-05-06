# PowerProShop - Case Study

---

## TL;DR

PowerProShop is a full-stack B2C e-commerce and business management platform built for a non-technical SME business owner in the gym equipment retail and repair industry. Built entirely by a single developer on a unified Next.js stack, the system digitised every aspect of the business - from online product sales and appointment bookings to admin reporting and inventory management - replacing a pen-and-paper operation with zero prior digital infrastructure. The result is a production-ready platform spanning 37 pages and 15+ user flows, currently in final security review

---

## The Problem

The client runs a gym equipment retail and repair shop - one brick-and-mortar location, one owner, no staff. Before this project, every aspect of the business was manual: stock was tracked in notebooks and Excel spreadsheets, customers called the shop to place orders or book repair appointments, and there was no way to check sales figures or inventory without physically being in the store.

The business was growing and the manual approach wasn't scaling. An increasing volume of phone calls for orders and service bookings was becoming unmanageable. There was no online presence, no customer records, and no visibility into business performance from outside the shop. The owner wanted to expand reach, reduce the operational burden of phone-based orders, and establish a professional digital presence - without needing to become technical themselves.

---

## Constraints & Context

These constraints shaped every technical decision made throughout the project:

- **Single operator** - the client is the sole owner and employee; no IT support, no internal team
- **Low technical literacy** - the admin interface had to be operable by someone comfortable with email and Excel, nothing more
- **Single developer** - the entire system was designed and built by one person
- **Greenfield from zero** - no existing codebase, database, or infrastructure to build on
- **SME budget** - open-source and free-tier tooling preferred; costs had to stay minimal
- **Self-teaching in parallel** - several technologies (Stripe webhooks, Redis rate limiting, Zustand, Google Places API) were learned and implemented during the build itself

---

## Goals

Success meant delivering a system that solved all three layers of the client's problem:

- A public-facing e-commerce storefront where customers can browse, filter, and purchase products online
- An online appointment booking system for equipment servicing, repair, and installation
- A customer account area with order history, booking history, and profile management
- An admin dashboard giving the owner a real-time view of orders, appointments, inventory levels, and revenue
- A complete digital business presence - replacing every pen-and-paper process with a maintainable digital equivalent

---

## Architecture Overview

PowerProShop is a **monolithic full-stack application** built on the Next.js App Router. The entire system - storefront, checkout, admin, booking flow, inventory - lives in one codebase, deployed as a single unit to Vercel.

This was a deliberate choice for a client at this scale. A single deployable unit is easier to reason about, cheaper to run, and simpler for a solo developer to maintain. Microservices would have introduced orchestration complexity with no benefit at this business size.

The system has four primary external dependencies:

- **Supabase** - PostgreSQL database, authentication, and file storage. Row Level Security (RLS) is enforced at the database level on every table, so data access is controlled even if application-layer checks are bypassed.
- **Stripe** - Payment processing. Card data never touches the server; Stripe Elements handles it client-side. A webhook listener handles post-payment order confirmation server-to-server.
- **Upstash Redis** - Rate limiting on authentication endpoints to protect against brute-force and credential stuffing attacks.
- **Google Places API** - Address autocomplete on the checkout shipping form.

```
Browser
  |
  +-- Next.js App Router (Vercel)
  |     +-- Server Components  -->  Server Actions  -->  Supabase (PostgreSQL + RLS)
  |     +-- Client Components  -->  Zustand stores  -->  localStorage
  |     +-- Edge Middleware    -->  Upstash Redis (rate limiting)
  |
  +-- Stripe Elements (client-side card input)
  |     +-- Stripe Webhook  -->  Next.js API Route  -->  Order confirmation
  |
  +-- Google Places API (address autocomplete)
```

> See [ARCHITECTURE.md](./ARCHITECTURE.md) for a deeper breakdown of request lifecycle, data layering, and component boundaries.

---

## Key Decisions

### 1. Monolith over microservices

**Decision:** Single Next.js application for all functionality - storefront, checkout, admin, booking, inventory.

**Why:** The client is one person running one shop. There is no team needing independent deployment, no traffic pattern requiring independent scaling, and no budget for service orchestration overhead. Microservices solve organisational and scaling problems this business does not have yet.

**Trade-off:** The codebase will be harder to split later if the business grows significantly. Clean module boundaries between customer-facing and admin features were maintained throughout to make a future split more tractable if needed.

**In hindsight:** Justifiable. The single deployable made iteration fast and debugging straightforward throughout the entire build.

---

### 2. Server Actions over a REST API

**Decision:** Next.js Server Actions (`lib/actions/*`) for all data mutations and server-side fetches, rather than a separate REST or GraphQL API layer.

**Why:** Server Actions are co-located with the Next.js app, run on the server (keeping secrets server-side), and eliminate the need for a separate API layer with its own auth, validation, and error handling. For a single-developer project on a unified stack, this dramatically reduces surface area and cognitive overhead.

**Trade-off:** Server Actions are tightly coupled to Next.js. If the frontend ever needed to be replaced or a mobile app added, there would be no portable API to reuse.

**In hindsight:** The right call for this scope. Portability was not a requirement and the development speed benefit was significant.

---

### 3. Supabase over a custom backend

**Decision:** Supabase for database, auth, and storage - rather than building a custom Node/Express backend with a separate auth system.

**Why:** A custom backend would have required implementing session management, token handling, password reset flows, email confirmation, and file storage from scratch - all solved problems. Supabase provided all of that out of the box, plus a PostgreSQL database and Row Level Security that enforces data access rules at the database level regardless of application code.

**Trade-off:** Vendor lock-in on auth and database infrastructure. Supabase-specific client libraries are used throughout the codebase.

**In hindsight:** The RLS alone justified the choice. Security guarantees that live in the database - not just application code - are meaningfully stronger, and implementing auth correctly from scratch is a project in itself.

---

### 4. Stock reservation via atomic DB function over optimistic decrement

**Decision:** Stock is decremented by a PostgreSQL function (`reduce_stock()`) called inside the order creation Server Action, not by an application-layer update after a stock check.

**Why:** Two customers buying the last unit simultaneously is a real race condition. Application-layer stock checks read the count then decrement it - two concurrent reads can both see `stock: 1`, both pass validation, and both succeed, resulting in an oversell. A database function runs atomically inside a transaction; only one can win.

A stock reservation system was also added to hold inventory during the checkout flow itself (not just at order confirmation), with a TTL that expires if payment is not completed. The Stripe webhook enforces expiry server-side, so a browser closing mid-payment cannot leave a reservation open indefinitely.

**Trade-off:** Significantly more complex than a simple stock field decrement. Required understanding PostgreSQL transactions, designing a reservation state machine, and coordinating the webhook to act as the authority on reservation outcome.

**In hindsight:** Essential. The naive approach would have produced real bugs in production.

---

### 5. Stripe webhook as source-of-truth for order confirmation

**Decision:** Orders are confirmed by the Stripe webhook (`POST /api/webhooks/stripe`), not solely by the client-side payment success callback.

**Why:** If a user's browser closes, loses connectivity, or navigates away immediately after Stripe processes the payment, the client-side callback never fires - the payment succeeds but no order gets created. The webhook fires server-to-server regardless of browser state.

**Trade-off:** Requires idempotency handling - Stripe may deliver the same webhook event more than once under retry logic. Each incoming event is checked against the stored `stripe_payment_intent_id` before processing to prevent duplicate orders being created.

**In hindsight:** Non-negotiable for any real payment integration. The client-side callback is a UX convenience (redirect to success page); the webhook is the actual system of record.

---

### 6. Zustand over Redux for client state

**Decision:** Zustand for the cart store and filter store; React Context only for auth state.

**Why:** Redux carries significant boilerplate - action creators, reducers, selectors - for what is essentially a localStorage-persisted array of cart items and a handful of filter flags. React Context re-renders all consumers on any state change, which is acceptable for low-frequency auth updates but causes unnecessary renders for a cart that changes on every quantity adjustment.

Zustand lets components subscribe to a specific state slice (`state => state.itemCount()`), so only components that depend on that slice re-render. Cart totals, item counts, and shipping costs are computed functions derived from a single `items[]` array - no derived state to keep in sync.

**Trade-off:** Less ecosystem tooling than Redux. Zustand is simpler but less established for very large or complex state graphs.

**In hindsight:** Acceptable as Zustand's DevTools integration, persistence middleware, and selective subscriptions covered everything needed with a fraction of the boilerplate.

---

## Hard Problems

### The Stripe Webhook & Order Reliability

The original checkout flow handled order confirmation entirely client-side - once Stripe returned a payment success, the callback created the order in the database and redirected to the success page. The flaw is obvious in hindsight: if the browser closed, lost connection, or the tab was killed the moment after payment went through, the callback never fired. The payment would succeed on Stripe's end but no order would exist in the system.

I had actually dealt with this pattern before in a previous project built in CakePHP, where a Stripe webhook was required for the same reason. That prior experience made the gap here immediately recognisable. The fix was to implement a webhook handler - a server-side endpoint that Stripe calls directly, independent of the browser. Because this is server-to-server, it fires regardless of what the user's browser does.

The non-obvious part was idempotency. Stripe's webhook delivery is at-least-once - the same event can arrive more than once if Stripe doesn't receive a timely 200 response. Without handling this, a duplicate webhook delivery would create two orders for the same payment. The solution is to check whether a `stripe_payment_intent_id` already exists in the orders table before processing - if it does, the order was already created and the event is silently acknowledged and skipped. The webhook was tested locally using the Stripe CLI before deploying.

---

### The Stock Reservation Race Condition

The inspiration came from observing how real e-commerce sites behave - items going "held" or "reserved" during checkout rather than only decrementing at the point of purchase. The problem with decrementing stock only at order confirmation is that two users can simultaneously reach checkout with the last unit, both see it as available, and both complete payment. By the time the second order fires, the stock is already gone.

The solution was a reservation system. When a user proceeds to checkout, `reserve_stock()` - a PostgreSQL function - runs for each cart item. It does not directly decrement `stock_quantity`. Instead, it calculates available stock dynamically: `stock_quantity - SUM(active reservations)`. If that number covers the requested quantity, a row is written to `stock_reservations` with a 15-minute TTL. If not, it raises an exception and checkout is blocked.

The concurrency control lives in the database. The function issues a `FOR UPDATE` lock on the product row, so two simultaneous checkout attempts for the same product queue behind that lock rather than both reading the same available count and both succeeding. Once the 15 minutes expire, the reservation is ignored in future availability calculations - no cleanup job needed.

The webhook adds a final enforcement layer: before confirming an order on `payment_intent.succeeded`, it verifies that a valid, non-expired reservation exists for each item. If the timer already ran out and the user somehow completed payment anyway, the order is rejected and an automatic refund is issued via `stripe.refunds.create()`. This makes the TTL a genuine security control, not just a UX feature.

---

## What I'd Do Differently
- Should have written test cases as I iteratively went through developing features
- Non-essential integrations like Google Places can be added post initial live (which was what was done so good)
- If this were an actual e-commerce site for a real business, all Stripe features should have been completed in its allocated sprint instead of breaking it up into sprints that have a big time jump

---

## Lessons Learned

Building this project as a solo developer while learning several technologies for the first time required a different kind of discipline. When something breaks with no teammates to ask, you have to develop a systematic approach to debugging and a habit of reading primary documentation rather than relying on second-hand explanations.

Being self-taught on the Next.js and React stack meant constantly challenging my own foundational assumptions. It was uncomfortable at times, but it ultimately served as a strong refinement process - gaps in understanding surface quickly when you are responsible for the entire system.

Time estimation needs to account for learning, not just building. When a sprint involves a tool you have never used before, the time cost is not just implementation - it is reading docs, failing, re-reading, and only then implementing correctly. Underestimating this repeatedly across the project was the most consistent friction point.

Scope discipline matters more on solo projects than on teams. Without a product manager or tech lead to push back, it is easy to keep adding features. Deferring non-essential integrations like Google Places to post-launch - rather than blocking initial delivery on them - was the right instinct and one worth repeating.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), TypeScript |
| **Styling** | Tailwind CSS v3, shadcn/ui |
| **Database** | Supabase (PostgreSQL), Row Level Security |
| **Auth** | Supabase Auth (email/password) |
| **Payments** | Stripe (Elements, PaymentIntents, Webhooks) |
| **State** | Zustand (cart, filters), React Context (auth) |
| **Rate Limiting** | Upstash Redis |
| **Address Autocomplete** | Google Places API |
| **Hosting** | Vercel |
| **Email (dev)** | Mailtrap |

---

## Links
- **Live demo:** [powerproshop.vercel.app](https://powerproshop.vercel.app)
- **Github repo** [github.com/K3ndriick/powerproshop-fullstack](https://github.com/K3ndriick/powerproshop-fullstack)
- **Architecture deep-dive:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Data flow:** [DATA_FLOW.md](./DATA_FLOW.md)
- **State management:** [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
