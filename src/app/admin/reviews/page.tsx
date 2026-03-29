import { getAdminReviews } from '@/lib/actions/admin/reviews';
import { createClient } from '@/lib/supabase/server';
import { ReviewModerateForm } from '@/components/admin/review-moderate-form';
import { Star } from 'lucide-react';
import { notFound } from 'next/navigation';

const statusStyles: Record<string, string> = {
  pending:  'badge-status-pending',
  approved: 'badge-status-delivered',
  rejected: 'badge-status-cancelled',
};

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const reviews = await getAdminReviews();

  if (reviews.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No reviews yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Moderation</h2>

      <div className="space-y-4">
        {reviews.map((review) => {
          const date = new Date(review.created_at).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div key={review.id} className="bg-card border p-6 space-y-3">

              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-sm">{review.title}</p>
                </div>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusStyles[review.status]}`}>
                  {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                </span>
              </div>

              {/* Meta */}
              <p className="text-xs text-muted-foreground">
                {review.profiles.full_name ?? 'Anonymous'} &middot; {date}
              </p>

              {/* Body */}
              <p className="text-sm leading-relaxed">{review.body}</p>

              {/* Actions */}
              <ReviewModerateForm
                reviewId={review.id}
                currentStatus={review.status}
                moderatorId={user.id}
              />

            </div>
          );
        })}
      </div>
    </div>
  );
}
