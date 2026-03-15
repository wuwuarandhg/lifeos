import { getMonthlyInsights, getWeeklyInsights, getHabitHeatmap } from '@/server/services/insights';
import {
  Repeat, Zap, Activity, FolderKanban, Target, BookOpen,
  StickyNote, Lightbulb, ClipboardList, Star, TrendingUp,
  TrendingDown, Minus, Dumbbell,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Insights — lifeOS' };
export const dynamic = 'force-dynamic';

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp size={14} className="text-green-500" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-text-muted" />;
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-semibold text-text-primary">{value}</p>
        <p className="text-2xs text-text-tertiary truncate">{label}</p>
        {sub && <p className="text-2xs text-text-muted truncate">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = 'bg-brand-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-3">
      <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function InsightsPage() {
  const weekly = getWeeklyInsights();
  const monthly = getMonthlyInsights();
  const heatmap = getHabitHeatmap(14);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Insights</h1>
        <p className="text-sm text-text-tertiary">
          Rolling summaries of your habits, tasks, signals, and goals
        </p>
      </div>

      {/* ── 7-Day Summary ──────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Last 7 Days
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Repeat size={18} className="text-green-500" />}
            iconBg="bg-green-50"
            label="Habit completion"
            value={`${weekly.habitRate}%`}
            sub={weekly.bestStreak ? `Best: ${weekly.bestStreak.name} (${weekly.bestStreak.streak}d)` : undefined}
          />
          <div className="card flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Zap size={18} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-lg font-semibold text-text-primary">{weekly.tasksCompleted}</p>
                <TrendIcon trend={weekly.taskCompletionTrend} />
              </div>
              <p className="text-2xs text-text-tertiary">Tasks completed</p>
              <p className="text-2xs text-text-muted">{weekly.tasksCreated} created</p>
            </div>
          </div>
          <StatCard
            icon={<Activity size={18} className="text-rose-500" />}
            iconBg="bg-rose-50"
            label="Avg mood · energy"
            value={weekly.avgMood !== null ? `${weekly.avgMood}` : '—'}
            sub={[
              weekly.avgEnergy !== null ? `Energy ${weekly.avgEnergy}` : null,
              weekly.avgSleep !== null ? `Sleep ${weekly.avgSleep}h` : null,
            ].filter(Boolean).join(' · ') || undefined}
          />
          <StatCard
            icon={<Dumbbell size={18} className="text-orange-500" />}
            iconBg="bg-orange-50"
            label="Workouts"
            value={weekly.workoutCount}
          />
        </div>
      </section>

      {/* ── Habit Heatmap ──────────────────────────────── */}
      {heatmap.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Habit Heatmap</h2>
          <p className="mb-3 text-2xs text-text-tertiary">Last 14 days — darker = completed</p>
          <div className="space-y-2 overflow-x-auto">
            {heatmap.map((row) => (
              <div key={row.habitId} className="flex items-center gap-2">
                <Link
                  href={`/habits/${row.habitId}`}
                  className="w-24 shrink-0 truncate text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  {row.name}
                </Link>
                <div className="flex gap-1">
                  {row.days.map((d) => (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.completed ? '✓' : '✗'}`}
                      className={`h-4 w-4 rounded-sm ${
                        d.completed ? 'bg-green-500' : 'bg-surface-3'
                      }`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 30-Day Trends ──────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Last 30 Days
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Repeat size={18} className="text-green-500" />}
            iconBg="bg-green-50"
            label="Habit rate"
            value={`${monthly.habitRate30d}%`}
          />
          <StatCard
            icon={<Zap size={18} className="text-blue-500" />}
            iconBg="bg-blue-50"
            label="Tasks completed"
            value={monthly.tasksCompleted30d}
          />
          <StatCard
            icon={<BookOpen size={18} className="text-amber-500" />}
            iconBg="bg-amber-50"
            label="Journal entries"
            value={monthly.journalEntries30d}
            sub={monthly.journalAvgWords > 0 ? `~${monthly.journalAvgWords} words avg` : undefined}
          />
          <StatCard
            icon={<Star size={18} className="text-yellow-500" />}
            iconBg="bg-yellow-50"
            label="XP earned"
            value={monthly.totalXp30d.toLocaleString()}
          />
        </div>
      </section>

      {/* ── Cadence & Engagement ────────────────────────── */}
      <section className="card space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Cadence & Engagement</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{monthly.reviewCount}</p>
            <p className="text-2xs text-text-tertiary">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{monthly.notesCreated}</p>
            <p className="text-2xs text-text-tertiary">Notes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{monthly.ideasCaptured}</p>
            <p className="text-2xs text-text-tertiary">Ideas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{monthly.workoutCount30d}</p>
            <p className="text-2xs text-text-tertiary">Workouts</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-text-primary">{monthly.journalEntries30d}</p>
            <p className="text-2xs text-text-tertiary">Journal</p>
          </div>
        </div>

        {/* XP by Domain */}
        {monthly.xpByDomain.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-text-secondary">XP by Domain</h3>
            <div className="space-y-2">
              {monthly.xpByDomain.slice(0, 6).map((d) => (
                <div key={d.domain} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 truncate text-xs text-text-secondary capitalize">{d.domain}</span>
                  <div className="flex-1">
                    <ProgressBar value={d.xp} max={monthly.xpByDomain[0].xp} color="bg-brand-500" />
                  </div>
                  <span className="w-12 text-right text-2xs text-text-muted">{d.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Projects & Goals ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Health */}
        {monthly.projectSummary.length > 0 && (
          <section className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">Project Health</h2>
              <Link href="/projects" className="text-2xs text-text-muted hover:text-text-secondary transition-colors">
                View all →
              </Link>
            </div>
            <div className="space-y-2">
              {monthly.projectSummary.slice(0, 6).map((p) => (
                <div key={p.title} className="flex items-center gap-3">
                  <FolderKanban size={14} className="shrink-0 text-text-muted" />
                  <span className="flex-1 truncate text-xs text-text-secondary">{p.title}</span>
                  <div className="w-16">
                    <ProgressBar value={p.progress} max={100} color={
                      p.health === 'at_risk' || p.health === 'off_track'
                        ? 'bg-amber-500'
                        : p.health === 'on_track'
                        ? 'bg-green-500'
                        : 'bg-brand-500'
                    } />
                  </div>
                  <span className="w-8 text-right text-2xs text-text-muted">{p.progress}%</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Goals & Streaks */}
        <section className="card space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Goals & Streaks</h2>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-lg font-semibold text-text-primary">{monthly.activeGoals}</p>
              <p className="text-2xs text-text-tertiary">Active goals</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-primary">{monthly.avgGoalProgress}%</p>
              <p className="text-2xs text-text-tertiary">Avg progress</p>
            </div>
          </div>

          {monthly.topStreaks.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-text-secondary">Top Streaks</h3>
              <div className="space-y-1">
                {monthly.topStreaks.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">{s.name}</span>
                    <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                      🔥 {s.streak}d
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/goals"
            className="block text-2xs text-text-muted hover:text-text-secondary transition-colors"
          >
            View all goals →
          </Link>
        </section>
      </div>

      {/* ── Life Signals (30d) ─────────────────────────── */}
      <section className="card space-y-3">
        <h2 className="text-sm font-semibold text-text-primary">Life Signals (30d avg)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {monthly.avgSleep30d !== null ? `${monthly.avgSleep30d}h` : '—'}
            </p>
            <p className="text-2xs text-text-tertiary">Sleep</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {monthly.avgMood30d !== null ? monthly.avgMood30d : '—'}
            </p>
            <p className="text-2xs text-text-tertiary">Mood</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {monthly.avgEnergy30d !== null ? monthly.avgEnergy30d : '—'}
            </p>
            <p className="text-2xs text-text-tertiary">Energy</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{monthly.workoutCount30d}</p>
            <p className="text-2xs text-text-tertiary">Workouts</p>
          </div>
        </div>
      </section>
    </div>
  );
}
