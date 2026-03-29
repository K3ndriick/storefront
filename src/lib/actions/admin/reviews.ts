'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type { ReviewWithProfile, ReviewStatus } from '@/lib/types/review';

const VALID_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  pending:  ['approved', 'rejected'],
  approved: ['rejected'],
  rejected: ['approved'],
}

// ============================================================
// GET ALL REVIEWS (moderation queue)
// Returns all reviews regardless of status, newest first.
// Admin client bypasses RLS so pending/rejected are visible.
// ============================================================

export async function getAdminReviews(): Promise<ReviewWithProfile[]> {
  const supabase = createAdminClient();

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`getAdminReviews error: ${error.message}`);
    throw error;
  }

  if (!reviews.length) return [];

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
// MODERATE REVIEW
// Approves or rejects a review, then recalculates and updates
// average_rating + review_count on the product row.
// Returns null on success, error string on failure.
// ============================================================

export async function moderateReview(reviewId: string,newStatus: 'approved' | 'rejected',moderatorId: string): Promise<string | null> {
  const supabase = createAdminClient();

  // Fetch current review to validate the status transition
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('id, product_id, status')
    .eq('id', reviewId)
    .single();

  if (fetchError || !review) return 'Review not found';

  const allowed = VALID_TRANSITIONS[review.status as ReviewStatus];

  if (!allowed.includes(newStatus)) {
    return `Cannot transition from ${review.status} to ${newStatus}`;
  }

  // Update the review status
  const { error: updateError } = await supabase
    .from('reviews')
    .update({
      status: newStatus,
      moderated_by: moderatorId,
      moderated_at: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (updateError) return updateError.message;

  // Recalculate stats from all approved reviews for this product
  const { data: approvedReviews, error: statsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', review.product_id)
    .eq('status', 'approved');

  if (statsError) return statsError.message;

  const count = approvedReviews.length;
  const average =
    count > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

  // Write the updated stats back to the products table
  // Also fetch slug so we can revalidate the correct product page
  const { data: updatedProduct, error: productError } = await supabase
    .from('products')
    .update({
      review_count: count,
      average_rating: parseFloat(average.toFixed(2)),
    })
    .eq('id', review.product_id)
    .select('slug')
    .single();

  if (productError) return productError.message;

  revalidatePath('/admin/reviews');
  if (updatedProduct?.slug) {
    revalidatePath(`/products/${updatedProduct.slug}`);
  }

  return null;
}
