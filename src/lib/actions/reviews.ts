'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReviewWithProfile, CreateReviewInput, ReviewSummary } from '@/lib/types/review';

// ============================================================
// CREATE REVIEW
// Called from ReviewForm on the product detail page.
// Verifies the user has a delivered order containing the product
// before allowing submission.
// Returns null on success, error string on failure.
// ============================================================

export async function createReview(input: CreateReviewInput): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'You must be logged in to submit a review';

  // Verify purchase: check the order exists, belongs to the user,
  // is delivered, and contains the product being reviewed
  const { data: orderItem } = await supabase
    .from('order_items')
    .select('id, orders!inner(id, user_id, status)')
    .eq('product_id', input.product_id)
    .eq('order_id', input.order_id)
    .eq('orders.user_id', user.id)
    .eq('orders.status', 'delivered')
    .single();

  if (!orderItem) return 'You can only review products from a delivered order';

  const { error } = await supabase
    .from('reviews')
    .insert({
      product_id: input.product_id,
      order_id: input.order_id,
      user_id: user.id,
      rating: input.rating,
      title: input.title,
      body: input.body,
      verified_purchase: true,
    });

  if (error) {
    // Unique constraint fires when user already reviewed this product
    if (error.code === '23505') return 'You have already reviewed this product';
    return error.message;
  }

  return null;
}

// ============================================================
// GET REVIEWS FOR A PRODUCT
// Returns approved reviews only (RLS enforces this too,
// but the status filter makes the intent explicit).
// Joins profiles so the reviewer's name is available.
// ============================================================

export async function getProductReviews(productId: string): Promise<ReviewWithProfile[]> {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error || !reviews.length) return [];

  // No direct FK from reviews -> profiles so PostgREST can't auto-join.
  // Fetch profiles separately and merge by user_id.
  const userIds = [...new Set(reviews.map((r) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name')
    .in('id', userIds);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return reviews.map((review) => ({
    ...review,
    profiles: profileMap.get(review.user_id) ?? { full_name: null },
  })) as ReviewWithProfile[];
}

// ============================================================
// GET REVIEW SUMMARY FOR A PRODUCT
// Computes the distribution (count per star rating 1-5)
// from the approved reviews returned above.
// Uses the denormalized average_rating + review_count from
// the products table for the headline numbers.
// ============================================================

export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  const supabase = await createClient();

  // Pull the pre-computed stats from the products table
  const { data: product } = await supabase
    .from('products')
    .select('average_rating, review_count')
    .eq('id', productId)
    .single();

  // Compute per-star distribution from approved reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId)
    .eq('status', 'approved');

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    rating: star,
    count: (reviews ?? []).filter((r) => r.rating === star).length,
  }));

  return {
    average_rating: product?.average_rating ?? 0,
    review_count: product?.review_count ?? 0,
    distribution,
  }
}

// ============================================================
// HAS USER REVIEWED PRODUCT
// Used to conditionally show the review form or a
// "you've already reviewed this" message.
//
// Uses the admin client to bypass RLS - the SELECT policy only
// exposes approved reviews, so a user with a pending review
// would incorrectly see the form again without this.
// We still filter by user_id so no other user's data is exposed.
// ============================================================

export async function hasUserReviewedProduct(productId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const admin = createAdminClient();

  const { data } = await admin
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .maybeSingle();

  return !!data;
}

// ============================================================
// GET DELIVERED ORDER ID FOR PRODUCT
// Finds a qualifying order (delivered, belongs to current user,
// contains the given product) to pre-fill the ReviewForm.
// Returns null if the user has no qualifying order.
// ============================================================

export async function getDeliveredOrderIdForProduct(productId: string): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('order_items')
    .select('order_id, orders!inner(user_id, status)')
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .eq('orders.status', 'delivered')
    .limit(1)
    .maybeSingle();

  return data?.order_id ?? null;
}
