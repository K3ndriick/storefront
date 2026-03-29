// ============================================================
// REVIEW TYPES
// ============================================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type Review = {
  id: string
  product_id: string
  user_id: string
  order_id: string

  rating: number
  title: string
  body: string

  status: ReviewStatus
  moderated_by: string | null
  moderated_at: string | null

  verified_purchase: boolean

  created_at: string
  updated_at: string
}

// Joined with profile for display - reviewer name comes from profiles table
export type ReviewWithProfile = Review & {
  profiles: {
    full_name: string | null
  }
}

// ============================================================
// INPUT TYPES
// ============================================================

export type CreateReviewInput = {
  product_id: string
  order_id: string
  rating: number
  title: string
  body: string
}

// ============================================================
// PRODUCT REVIEW SUMMARY
// ============================================================
// Passed to ReviewSummary component - pre-computed, not calculated client-side

export type ReviewSummary = {
  average_rating: number
  review_count: number
  distribution: { rating: number; count: number }[]
}
