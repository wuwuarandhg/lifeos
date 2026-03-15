'use client';

import { useRouter } from 'next/navigation';
import { DetailPageShell } from '@/components/detail/detail-page-shell';
import { EditableField } from '@/components/detail/editable-field';
import { StatusBadge } from '@/components/detail/status-badge';
import { ProgressBar } from '@/components/detail/progress-bar';
import { TagsPills } from '@/components/detail/tags-pills';
import { RelationsPanel } from '@/components/detail/relations-panel';
import { updateGoalAction, archiveGoalAction } from '@/app/actions';
import { formatDate, formatISODate } from '@/lib/utils';
import { Repeat } from 'lucide-react';
import Link from 'next/link';

interface Habit {
  id: string;
  name: string;
  cadence: string | null;
  currentStreak: number | null;
  domain: string | null;
}

interface Tag {
  id: string;
  name: string;
  color: string | null;
  itemTagId: string;
}

interface RelatedItem {
  relation: {
    id: string;
    sourceType: string;
    sourceId: string;
    targetType: string;
    targetId: string;
    relationType: string;
  };
  type: string;
  id: string;
  title: string;
  direction: 'outgoing' | 'incoming';
}

interface Goal {
  id: string;
  title: string;
  description: string | null;
  body: string | null;
  timeHorizon: string | null;
  startDate: string | null;
  targetDate: string | null;
  outcomeMetric: string | null;
  status: string;
  progress: number | null;
  createdAt: number;
  updatedAt: number;
  archivedAt: number | null;
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'achieved', label: 'Achieved' },
  { value: 'paused', label: 'Paused' },
  { value: 'abandoned', label: 'Abandoned' },
];

const HORIZON_OPTIONS = [
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'multi_year', label: 'Multi-Year' },
  { value: 'life', label: 'Life' },
];

interface GoalDetailClientProps {
  goal: Goal;
  habits: Habit[];
  relatedItems: RelatedItem[];
  tags: Tag[];
}

export function GoalDetailClient({
  goal,
  habits,
  relatedItems,
  tags,
}: GoalDetailClientProps) {
  const router = useRouter();

  const handleUpdate = async (field: string, value: unknown) => {
    await updateGoalAction(goal.id, { [field]: value });
  };

  const handleArchive = async () => {
    await archiveGoalAction(goal.id);
    router.push('/goals');
  };

  return (
    <DetailPageShell
      backHref="/goals"
      backLabel="Goals"
      title={goal.title}
      onTitleChange={(title) => handleUpdate('title', title)}
      badge={<StatusBadge status={goal.status} size="md" />}
      onArchive={handleArchive}
    >
      {/* Metadata Grid */}
      <div className="card">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <EditableField
            label="Status"
            value={goal.status}
            onSave={(v) => handleUpdate('status', v)}
            type="select"
            options={STATUS_OPTIONS}
          />
          <EditableField
            label="Time Horizon"
            value={goal.timeHorizon}
            onSave={(v) => handleUpdate('timeHorizon', v)}
            type="select"
            options={HORIZON_OPTIONS}
          />
          <EditableField
            label="Start Date"
            value={goal.startDate}
            onSave={(v) => handleUpdate('startDate', v)}
            type="date"
          />
          <EditableField
            label="Target Date"
            value={goal.targetDate}
            onSave={(v) => handleUpdate('targetDate', v)}
            type="date"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <EditableField
            label="Outcome Metric"
            value={goal.outcomeMetric}
            onSave={(v) => handleUpdate('outcomeMetric', v)}
            placeholder="How will you measure success?"
          />
          <div className="space-y-0.5">
            <span className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Progress
            </span>
            <ProgressBar value={goal.progress ?? 0} size="md" />
          </div>
          <div className="space-y-0.5">
            <span className="text-2xs font-medium uppercase tracking-wider text-text-muted">
              Created
            </span>
            <p className="text-sm text-text-primary">{formatDate(goal.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="card">
        <EditableField
          label="Description"
          value={goal.description}
          onSave={(v) => handleUpdate('description', v)}
          type="textarea"
          placeholder="Why does this goal matter?"
          emptyLabel="Add a description..."
        />
      </div>

      {/* Body / Notes */}
      <div className="card">
        <EditableField
          label="Notes"
          value={goal.body}
          onSave={(v) => handleUpdate('body', v)}
          type="textarea"
          placeholder="Plans, milestones, thoughts..."
          emptyLabel="Add notes..."
        />
      </div>

      {/* Tags */}
      <div className="card">
        <h3 className="text-2xs font-medium uppercase tracking-wider text-text-muted mb-2">
          Tags
        </h3>
        <TagsPills itemType="goal" itemId={goal.id} tags={tags} />
      </div>

      {/* Linked Habits */}
      <div className="card">
        <div className="mb-3 flex items-center gap-2">
          <Repeat size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">Linked Habits</h3>
          {habits.length > 0 && (
            <span className="text-2xs text-text-muted">({habits.length})</span>
          )}
        </div>

        {habits.length === 0 ? (
          <p className="text-2xs text-text-muted py-2">
            No habits linked to this goal. Link habits via the habit detail page.
          </p>
        ) : (
          <div className="space-y-1">
            {habits.map((habit) => (
              <Link
                key={habit.id}
                href={`/habits/${habit.id}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-1 transition-colors"
              >
                <Repeat size={14} className="text-text-muted" />
                <span className="flex-1 text-sm text-text-primary">{habit.name}</span>
                {habit.currentStreak && habit.currentStreak > 0 && (
                  <span className="text-2xs text-status-warning">
                    🔥 {habit.currentStreak}
                  </span>
                )}
                {habit.domain && (
                  <span className="badge bg-surface-2 text-text-tertiary text-2xs">
                    {habit.domain}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Relations */}
      <RelationsPanel items={relatedItems} />
    </DetailPageShell>
  );
}
