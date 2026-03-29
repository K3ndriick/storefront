import { Star, BadgeCheck } from 'lucide-react';
import type { ReviewWithProfile } from '@/lib/types/review';

type Props = {
  reviews: ReviewWithProfile[]
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const date = new Date(review.created_at).toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })

        return (
          <div key={review.id} className="border-b pb-6 last:border-0">

            {/* Stars + title */}
            <div className="flex items-center gap-3 mb-1">
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

            {/* Reviewer + date + verified badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>{review.profiles.full_name ?? 'Anonymous'}</span>
              <span>·</span>
              <span>{date}</span>
              {review.verified_purchase && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-accent">
                    <BadgeCheck className="w-3 h-3" />
                    Verified purchase
                  </span>
                </>
              )}
            </div>

            {/* Body */}
            <p className="text-sm leading-relaxed">{review.body}</p>

          </div>
        )
      })}
    </div>
  )
}
