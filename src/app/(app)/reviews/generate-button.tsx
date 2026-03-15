'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { generateWeeklyReviewAction } from '@/app/actions';

interface GenerateReviewButtonProps {
  large?: boolean;
  weekStart?: string;
}

export function GenerateReviewButton({ large, weekStart }: GenerateReviewButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateWeeklyReviewAction(weekStart);
      if (result.review) {
        router.push(`/reviews/${result.review.id}`);
      }
    });
  };

  if (large) {
    return (
      <button
        onClick={handleGenerate}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        {isPending ? 'Generating…' : 'Generate Weekly Review'}
      </button>
    );
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
      {isPending ? 'Generating…' : 'Generate This Week'}
    </button>
  );
}
