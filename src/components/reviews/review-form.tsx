'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createReview } from '@/lib/actions/reviews';
import type { CreateReviewInput } from '@/lib/types/review';

const schema = z.object({
  rating: z.number({ message: 'Please select a rating' }).min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  body: z.string().min(20, 'Review must be at least 20 characters'),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  productId: string
  orderId: string
}

export function ReviewForm({ productId, orderId }: Props) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const selectedRating = watch('rating') ?? 0;

  function handleStarClick(value: number) {
    setValue('rating', value, { shouldValidate: true });
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setError(null);

    const input: CreateReviewInput = {
      product_id: productId,
      order_id: orderId,
      rating: values.rating,
      title: values.title,
      body: values.body,
    };

    const result = await createReview(input);

    if (result) {
      setError(result);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="border p-6">
        <p className="font-semibold">Review submitted</p>
        <p className="text-sm text-muted-foreground mt-1">
          Your review is pending approval and will appear here once approved.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 border p-6">
      <h3 className="font-semibold text-lg">Write a review</h3>

      {/* Star rating */}
      <div className="space-y-1">
        <Label>Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= (hoveredStar || selectedRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive">{errors.rating.message}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Sum up your experience"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Body */}
      <div className="space-y-1">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          {...register('body')}
          rows={5}
          placeholder="What did you like or dislike? Would you recommend it?"
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        )}
      </div>

      {/* Server error */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  )
}
