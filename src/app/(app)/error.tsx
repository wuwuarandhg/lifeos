'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in development
    console.error('[lifeOS] Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
        <p className="mt-1 text-sm text-text-tertiary">
          An unexpected error occurred. Your data is safe — try refreshing or resetting the view.
        </p>
        {error.digest && (
          <p className="mt-2 text-2xs font-mono text-text-muted">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            <RotateCcw size={16} />
            Try again
          </button>
          <a
            href="/today"
            className="inline-flex items-center gap-2 rounded-lg border border-surface-3 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-1"
          >
            Go to Today
          </a>
        </div>
      </div>
    </div>
  );
}
