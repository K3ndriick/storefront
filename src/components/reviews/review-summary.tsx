import { Star } from 'lucide-react';
import type { ReviewSummary } from '@/lib/types/review';

type Props = {
  summary: ReviewSummary
}

export function ReviewSummary({ summary }: Props) {
  const { average_rating, review_count, distribution } = summary;

  if (review_count === 0) {
    return (
      <div className="border p-6">
        <p className="text-muted-foreground text-sm">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="border p-6 space-y-4">

      {/* Headline */}
      <div className="text-center">
        <p className="text-5xl font-bold">{average_rating.toFixed(1)}</p>
        <div className="flex justify-center gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(average_rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {review_count} {review_count === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Distribution bars */}
      <div className="space-y-2">
        {distribution.map(({ rating, count }) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="text-sm w-10 shrink-0">{rating} star</span>
            <div className="flex-1 bg-muted h-2">
              <div
                className="bg-primary h-2"
                style={{
                  width: review_count > 0 ? `${(count / review_count) * 100}%` : '0%',
                }}
              />
            </div>
            <span className="text-sm w-6 text-right text-muted-foreground">{count}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
