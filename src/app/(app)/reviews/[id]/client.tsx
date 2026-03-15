'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DetailPageShell } from '@/components/detail/detail-page-shell';
import { StatusBadge } from '@/components/detail/status-badge';
import {
  updateReviewBodyAction,
  publishReviewAction,
  deleteReviewAction,
  regenerateReviewAction,
} from '@/app/actions';
import { formatISODate } from '@/lib/utils';
import {
  Check,
  RefreshCw,
  Loader2,
  BarChart3,
  Trophy,
  AlertTriangle,
  Target,
  BookOpen,
  ListChecks,
  Sparkles,
  Dumbbell,
} from 'lucide-react';

interface Review {
  id: string;
  reviewType: string;
  periodStart: string;
  periodEnd: string | null;
  body: string | null;
  generatedAt: number | null;
  statsSnapshot: string | null;
  isPublished: number | null;
  createdAt: number;
  updatedAt: number;
}

interface ReviewDetailClientProps {
  review: Review;
}

export function ReviewDetailClient({ review }: ReviewDetailClientProps) {
  const router = useRouter();
  const [body, setBody] = useState(review.body || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionLabel, setActionLabel] = useState('');

  const snapshot = parseSnapshot(review.statsSnapshot);

  const handleSave = useCallback(() => {
    if (body === review.body) {
      setIsEditing(false);
      return;
    }
    startTransition(async () => {
      setActionLabel('Saving…');
      await updateReviewBodyAction(review.id, body);
      setIsEditing(false);
      setActionLabel('');
    });
  }, [body, review.body, review.id]);

  const handlePublish = () => {
    startTransition(async () => {
      setActionLabel('Publishing…');
      await publishReviewAction(review.id);
      setActionLabel('');
    });
  };

  const handleRegenerate = () => {
    if (!confirm('Regenerate will overwrite the current body with fresh data. Continue?')) return;
    startTransition(async () => {
      setActionLabel('Regenerating…');
      const result = await regenerateReviewAction(review.id);
      if (result.review) {
        setBody(result.review.body || '');
      }
      setActionLabel('');
    });
  };

  const handleDelete = async () => {
    await deleteReviewAction(review.id);
    router.push('/reviews');
  };

  const periodLabel = `${formatISODate(review.periodStart)} → ${review.periodEnd ? formatISODate(review.periodEnd) : ''}`;

  return (
    <DetailPageShell
      backHref="/reviews"
      backLabel="Reviews"
      title="Weekly Review"
      subtitle={periodLabel}
      badge={
        review.isPublished ? (
          <StatusBadge status="published" />
        ) : (
          <StatusBadge status="draft" />
        )
      }
      onArchive={handleDelete}
      actions={
        <div className="flex items-center gap-2">
          {isPending && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Loader2 className="h-3 w-3 animate-spin" />
              {actionLabel}
            </span>
          )}
          <button
            onClick={handleRegenerate}
            disabled={isPending}
            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-2 transition-colors disabled:opacity-50"
            title="Regenerate from current data"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </button>
          {!review.isPublished && (
            <button
              onClick={handlePublish}
              disabled={isPending}
              className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              Publish
            </button>
          )}
        </div>
      }
    >
      {/* Stats summary grid */}
      {snapshot && <StatsGrid snapshot={snapshot} />}

      {/* Insights cards */}
      {snapshot && <InsightsCards snapshot={snapshot} />}

      {/* Body editor */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xs font-medium uppercase tracking-wider text-text-muted">
            Review Body
          </h3>
          <button
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
            className="text-xs text-brand-primary hover:underline"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onBlur={handleSave}
            rows={25}
            className="w-full rounded-lg border border-surface-3 bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-brand-primary focus:outline-none font-mono leading-relaxed"
            placeholder="Review body…"
          />
        ) : (
          <div className="prose-sm">
            {body ? (
              <pre className="whitespace-pre-wrap font-sans text-sm text-text-secondary leading-relaxed">
                {body}
              </pre>
            ) : (
              <p className="text-sm text-text-muted italic">No content yet.</p>
            )}
          </div>
        )}
      </div>
    </DetailPageShell>
  );
}

// ============================================================
// Stats Grid
// ============================================================

interface SnapshotData {
  tasks?: { completed?: number; total?: number; completionRate?: number };
  habits?: { totalCompletions?: number; possibleCompletions?: number; overallRate?: number; bestStreakHabit?: string; bestStreakValue?: number };
  metrics?: { avgMood?: number | null; avgEnergy?: number | null; avgSleep?: number | null; totalWorkoutMinutes?: number };
  journal?: { entryCount?: number; avgWordCount?: number; moodTrend?: string };
  projects?: { active?: number; completedTasks?: number };
  goals?: { active?: number; avgProgress?: number };
  ideas?: { captured?: number };
  wins?: string[];
  blockers?: string[];
  focusAreas?: string[];
}

function parseSnapshot(raw: string | null): SnapshotData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function StatsGrid({ snapshot }: { snapshot: SnapshotData }) {
  const stats: { icon: React.ReactNode; label: string; value: string }[] = [];

  if (snapshot.tasks) {
    stats.push({
      icon: <ListChecks className="h-4 w-4 text-blue-500" />,
      label: 'Tasks Done',
      value: `${snapshot.tasks.completed ?? 0}/${snapshot.tasks.total ?? 0}`,
    });
  }
  if (snapshot.habits) {
    stats.push({
      icon: <Dumbbell className="h-4 w-4 text-green-500" />,
      label: 'Habit Checks',
      value: `${snapshot.habits.totalCompletions ?? 0}/${snapshot.habits.possibleCompletions ?? 0}`,
    });
  }
  if (snapshot.metrics?.avgMood != null) {
    stats.push({
      icon: <Sparkles className="h-4 w-4 text-yellow-500" />,
      label: 'Avg Mood',
      value: snapshot.metrics.avgMood.toFixed(1),
    });
  }
  if (snapshot.metrics?.avgSleep != null) {
    stats.push({
      icon: <BarChart3 className="h-4 w-4 text-indigo-500" />,
      label: 'Avg Sleep',
      value: `${snapshot.metrics.avgSleep.toFixed(1)}h`,
    });
  }
  if (snapshot.journal) {
    stats.push({
      icon: <BookOpen className="h-4 w-4 text-purple-500" />,
      label: 'Journal Entries',
      value: String(snapshot.journal.entryCount ?? 0),
    });
  }
  if (snapshot.ideas) {
    stats.push({
      icon: <Target className="h-4 w-4 text-orange-500" />,
      label: 'Ideas Captured',
      value: String(snapshot.ideas.captured ?? 0),
    });
  }

  if (stats.length === 0) return null;

  return (
    <div className="card">
      <h3 className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-3">
        Week at a Glance
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-2">
              {s.icon}
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary leading-tight">{s.value}</p>
              <p className="text-2xs text-text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Insights Cards (wins, blockers, focus areas)
// ============================================================

function InsightsCards({ snapshot }: { snapshot: SnapshotData }) {
  const hasWins = snapshot.wins && snapshot.wins.length > 0;
  const hasBlockers = snapshot.blockers && snapshot.blockers.length > 0;
  const hasFocus = snapshot.focusAreas && snapshot.focusAreas.length > 0;

  if (!hasWins && !hasBlockers && !hasFocus) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {hasWins && (
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-green-500" />
            <h4 className="text-xs font-semibold text-text-primary">Wins</h4>
          </div>
          <ul className="space-y-1">
            {snapshot.wins!.map((w, i) => (
              <li key={i} className="text-xs text-text-secondary">• {w}</li>
            ))}
          </ul>
        </div>
      )}
      {hasBlockers && (
        <div className="card border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h4 className="text-xs font-semibold text-text-primary">Watch</h4>
          </div>
          <ul className="space-y-1">
            {snapshot.blockers!.map((b, i) => (
              <li key={i} className="text-xs text-text-secondary">• {b}</li>
            ))}
          </ul>
        </div>
      )}
      {hasFocus && (
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-500" />
            <h4 className="text-xs font-semibold text-text-primary">Focus Areas</h4>
          </div>
          <ul className="space-y-1">
            {snapshot.focusAreas!.map((f, i) => (
              <li key={i} className="text-xs text-text-secondary">• {f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
