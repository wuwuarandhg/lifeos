import { getAllGoals, getGoalHabits } from '@/server/services/goals';
import { StatusBadge } from '@/components/detail/status-badge';
import { ProgressBar } from '@/components/detail/progress-bar';
import Link from 'next/link';
import { Target, Plus, Calendar, Repeat } from 'lucide-react';
import { formatISODate } from '@/lib/utils';

export const metadata = { title: 'Goals — lifeOS' };
export const dynamic = 'force-dynamic';

const HORIZON_ORDER = ['life', 'multi_year', 'yearly', 'quarterly'] as const;

const HORIZON_COLORS: Record<string, string> = {
  life: 'bg-purple-50 text-purple-700',
  multi_year: 'bg-blue-50 text-blue-700',
  yearly: 'bg-green-50 text-green-700',
  quarterly: 'bg-amber-50 text-amber-700',
};

export default function GoalsPage() {
  const allGoals = getAllGoals();

  const grouped = HORIZON_ORDER.map((horizon) => ({
    horizon,
    goals: allGoals.filter((g) => g.timeHorizon === horizon),
  })).filter((g) => g.goals.length > 0);

  const activeCount = allGoals.filter((g) => g.status === 'active').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Goals</h1>
          <p className="text-sm text-text-tertiary">{activeCount} active</p>
        </div>
        <Link
          href="/goals/new"
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} />
          New Goal
        </Link>
      </div>

      {allGoals.length === 0 ? (
        <div className="card py-12 text-center">
          <Target size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">No goals yet.</p>
          <p className="text-2xs text-text-muted mt-1">
            Define your first goal to start tracking progress.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ horizon, goals }) => (
            <div key={horizon}>
              <div className="mb-3 flex items-center gap-2">
                <StatusBadge
                  status={horizon}
                  colorMap={HORIZON_COLORS}
                />
                <span className="text-2xs text-text-muted">
                  {goals.length} goal{goals.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GoalCard({
  goal,
}: {
  goal: ReturnType<typeof getAllGoals>[number];
}) {
  const habits = getGoalHabits(goal.id);

  return (
    <Link href={`/goals/${goal.id}`}>
      <div className="card hover:border-brand-200 cursor-pointer transition-all group">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-text-primary group-hover:text-brand-600 transition-colors">
            {goal.title}
          </h3>
          <StatusBadge status={goal.status} />
        </div>

        {goal.description && (
          <p className="text-2xs text-text-tertiary line-clamp-2 mb-3">
            {goal.description}
          </p>
        )}

        <ProgressBar value={goal.progress ?? 0} className="mb-3" />

        <div className="flex items-center gap-3 text-2xs text-text-muted">
          {habits.length > 0 && (
            <span className="flex items-center gap-1">
              <Repeat size={11} />
              {habits.length} habit{habits.length !== 1 ? 's' : ''}
            </span>
          )}
          {goal.targetDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatISODate(goal.targetDate)}
            </span>
          )}
          {goal.outcomeMetric && (
            <span className="truncate">{goal.outcomeMetric}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
