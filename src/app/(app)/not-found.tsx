import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Not Found — lifeOS' };

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
          <FileQuestion size={24} className="text-text-muted" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Page not found</h2>
        <p className="mt-1 text-sm text-text-tertiary">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            href="/today"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
          >
            Go to Today
          </Link>
        </div>
      </div>
    </div>
  );
}
