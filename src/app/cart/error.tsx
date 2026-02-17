'use client'

/**
 * Cart Error Boundary
 *
 * Next.js renders this when an unhandled error occurs in the /cart route.
 * The `error` prop is the thrown Error object.
 * The `reset` prop is a function that re-renders the page - useful for
 * transient errors (e.g. a network hiccup).
 *
 * Must be 'use client' - Next.js requires error boundaries to be client components.
 *
 * Note: Errors thrown inside Zustand store actions (like addItem) are caught
 * by the component's try/catch, NOT this boundary. This boundary only catches
 * errors that escape all component-level handling and propagate up the tree.
 */

import { Button } from '@/components/ui/button'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CartError({ error, reset }: Props) {
  return (
    <main className="container mx-auto px-4 py-24 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <h2 className="text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          {error.message || 'An unexpected error occurred loading your cart.'}
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <a href="/products">Back to Products</a>
          </Button>
        </div>
      </div>
    </main>
  )
}
