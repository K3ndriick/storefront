'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { moderateReview } from '@/lib/actions/admin/reviews';

type Props = {
  reviewId: string
  currentStatus: 'pending' | 'approved' | 'rejected'
  moderatorId: string
}

export function ReviewModerateForm({ reviewId, currentStatus, moderatorId }: Props) {
  const [loading, setLoading] = useState<'approving' | 'rejecting' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(newStatus: 'approved' | 'rejected') {
    setLoading(newStatus === 'approved' ? 'approving' : 'rejecting');
    setError(null);

    const result = await moderateReview(reviewId, newStatus, moderatorId);

    if (result) setError(result);
    setLoading(null);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus !== 'approved' && (
        <Button
          size="sm"
          disabled={!!loading}
          onClick={() => handle('approved')}
        >
          {loading === 'approving' ? 'Approving...' : 'Approve'}
        </Button>
      )}
      {currentStatus !== 'rejected' && (
        <Button
          size="sm"
          variant="outline"
          disabled={!!loading}
          onClick={() => handle('rejected')}
        >
          {loading === 'rejecting' ? 'Rejecting...' : 'Reject'}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
