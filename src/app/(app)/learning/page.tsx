import Link from 'next/link';
import { getAllLearningItems } from '@/server/services/entities';
import { CreateLearningButton } from '@/components/learning/create-learning-button';
import { formatDate } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';

export const metadata = { title: 'Learning — lifeOS' };
export const dynamic = 'force-dynamic';

const TYPE_EMOJI: Record<string, string> = {
  book: '📚',
  article: '📄',
  course: '🎓',
};

const STATUS_COLORS: Record<string, string> = {
  to_read: 'bg-yellow-50 text-yellow-700',
  reading: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-blue-50 text-blue-700',
  planned: 'bg-surface-2 text-text-muted',
  completed: 'bg-green-50 text-green-700',
  read: 'bg-green-50 text-green-700',
  abandoned: 'bg-red-50 text-red-600',
};

export default function LearningPage() {
  const items = getAllLearningItems();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Learning</h1>
        <CreateLearningButton />
      </div>

      {items.length === 0 ? (
        <div className="card py-12 text-center">
          <GraduationCap size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-secondary">Nothing tracked yet</p>
          <p className="text-2xs text-text-muted mt-1">
            Add a book, article, or course to start tracking your learning.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const meta = item.parsedMetadata as Record<string, string>;
            const status = meta?.status;
            return (
              <Link key={item.id} href={`/learning/${item.id}`}>
                <div className="card hover:border-brand-200 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-base shrink-0">{TYPE_EMOJI[item.entityType] ?? '📖'}</span>
                      <h3 className="text-sm font-medium text-text-primary truncate">{item.title}</h3>
                    </div>
                    {status && (
                      <span className={`badge text-2xs shrink-0 ${STATUS_COLORS[status] ?? 'bg-surface-2 text-text-muted'}`}>
                        {status.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  {meta?.author && (
                    <p className="mt-1 text-2xs text-text-tertiary">by {meta.author}</p>
                  )}
                  {meta?.platform && (
                    <p className="mt-1 text-2xs text-text-tertiary">{meta.platform}</p>
                  )}
                  {item.body && (
                    <p className="mt-1 text-2xs text-text-tertiary line-clamp-2">
                      {item.body.slice(0, 120)}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge bg-surface-2 text-text-muted text-2xs capitalize">
                      {item.entityType}
                    </span>
                    <span className="text-2xs text-text-muted">
                      {formatDate(item.updatedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
