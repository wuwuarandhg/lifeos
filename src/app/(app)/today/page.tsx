import { getTodayTasks } from '@/server/services/tasks';
import { getActiveHabits, getTodayCompletions } from '@/server/services/habits';
import { getInboxCount } from '@/server/services/inbox';
import { getTodayMetrics } from '@/server/services/metrics';
import { getReviewForPeriod } from '@/server/services/reviews';
import { getProfile } from '@/server/services/gamification';
import { getWeeklyInsights, isFirstRun } from '@/server/services/insights';
import { QuickCapture } from '@/components/capture/quick-capture';
import { TaskList } from '@/components/tasks/task-list';
import { HabitChecklist } from '@/components/habits/habit-checklist';
import { MetricQuickLog } from '@/components/metrics/metric-quick-log';
import { startOfWeek, endOfWeek } from '@/lib/utils';
import { calculateLevel, xpForLevel } from '@/lib/constants';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { formatNumber, toIntlLocale, translateText } from '@/lib/i18n';
import {
  Inbox, Flame, Zap, ClipboardList, Star,
  TrendingUp, TrendingDown, Minus, Activity,
  FolderKanban, Repeat, AlertTriangle, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata() {
  return buildPageMetadata('Today');
}

export const dynamic = 'force-dynamic';

function formatTodayHeader(locale: 'en' | 'zh-CN'): { dayName: string; fullDate: string; greeting: string } {
  const now = new Date();
  const hour = now.getHours();

  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const dayName = now.toLocaleDateString(toIntlLocale(locale), { weekday: 'long' });
  const fullDate = now.toLocaleDateString(toIntlLocale(locale), {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return { dayName, fullDate, greeting: translateText(greeting, locale) };
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp size={14} className="text-green-500" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-text-muted" />;
}

export default async function TodayPage() {
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);
  const { dayName, fullDate, greeting } = formatTodayHeader(locale);
  const todayTasks = getTodayTasks();
  const habits = getActiveHabits();
  const completions = getTodayCompletions();
  const inboxCount = getInboxCount();
  const todayMetrics = getTodayMetrics();
  const weekly = getWeeklyInsights();
  const firstRun = isFirstRun();

  // Review and gamification data
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weeklyReview = getReviewForPeriod('weekly', weekStart, weekEnd);
  const profile = getProfile();
  const level = calculateLevel(profile.totalXp ?? 0);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const xpProgress = (profile.totalXp ?? 0) - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  // Calculate habit completion rate
  const habitsDone = completions.length;
  const habitsTotal = habits.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">{greeting}</h1>
        <p className="text-sm text-text-tertiary">
          {dayName}, {fullDate}
        </p>
      </div>

      {/* Quick Capture */}
      <QuickCapture />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Zap size={18} className="text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{todayTasks.length}</p>
            <p className="text-2xs text-text-tertiary">{tx('Tasks today')}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
            <Flame size={18} className="text-green-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {habitsDone}/{habitsTotal}
            </p>
            <p className="text-2xs text-text-tertiary">{tx('Habits done')}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
            <Inbox size={18} className="text-purple-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{inboxCount}</p>
            <p className="text-2xs text-text-tertiary">{tx('In inbox')}</p>
          </div>
        </div>
      </div>

      {/* Life Signals — Quick Metric Logging */}
      <MetricQuickLog todayMetrics={todayMetrics} />

      {/* First-run guidance */}
      {firstRun && (
        <div className="card border-l-4 border-l-brand-primary">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
              <Sparkles size={18} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{tx('Welcome to lifeOS')}</p>
              <p className="mt-0.5 text-xs text-text-tertiary">
                {tx('Start by creating your first task, habit, or journal entry. The more you use lifeOS, the richer your insights become.')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href="/tasks" className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-3 transition-colors">
                  {tx('Add a task →')}
                </Link>
                <Link href="/habits" className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-3 transition-colors">
                  {locale === 'zh-CN' ? '设置习惯 →' : 'Set up habits →'}
                </Link>
                <Link href="/journal" className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-secondary hover:bg-surface-3 transition-colors">
                  {locale === 'zh-CN' ? '写日志 →' : 'Write in journal →'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* This Week — Rolling Insight Cards */}
      {!firstRun && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{locale === 'zh-CN' ? '本周' : 'This Week'}</h2>
            <Link href="/insights" className="text-2xs text-text-muted hover:text-text-secondary transition-colors">
              {locale === 'zh-CN' ? '查看全部 →' : 'View all →'}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {/* Habit Rate */}
            <div className="card flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <Repeat size={18} className="text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-text-primary">{weekly.habitRate}%</p>
                <p className="text-2xs text-text-tertiary truncate">
                  {weekly.bestStreak
                    ? locale === 'zh-CN'
                      ? `${weekly.bestStreak.name} · 连续 ${weekly.bestStreak.streak} 天`
                      : `${weekly.bestStreak.name} · ${weekly.bestStreak.streak}d streak`
                    : locale === 'zh-CN' ? '习惯完成率' : 'Habit completion'}
                </p>
              </div>
            </div>

            {/* Task Momentum */}
            <div className="card flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Zap size={18} className="text-blue-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-semibold text-text-primary">{weekly.tasksCompleted}</p>
                  <TrendIcon trend={weekly.taskCompletionTrend} />
                </div>
                <p className="text-2xs text-text-tertiary">{locale === 'zh-CN' ? '已完成任务' : 'Tasks done'}</p>
              </div>
            </div>

            {/* Life Signals */}
            <div className="card flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50">
                <Activity size={18} className="text-rose-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1">
                  {weekly.avgMood !== null ? (
                    <p className="text-lg font-semibold text-text-primary">{weekly.avgMood}</p>
                  ) : (
                    <p className="text-sm text-text-muted">—</p>
                  )}
                  {weekly.avgEnergy !== null && (
                    <span className="text-2xs text-text-muted">/ {weekly.avgEnergy}e</span>
                  )}
                </div>
                <p className="text-2xs text-text-tertiary">
                  {locale === 'zh-CN'
                    ? `平均心情${weekly.avgEnergy !== null ? ' · 精力' : ''}`
                    : `Avg mood${weekly.avgEnergy !== null ? ' · energy' : ''}`}
                </p>
              </div>
            </div>

            {/* Projects */}
            <div className="card flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                <FolderKanban size={18} className="text-purple-500" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-lg font-semibold text-text-primary">{weekly.activeProjects}</p>
                  {weekly.atRiskProjects > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-2xs text-amber-600">
                      <AlertTriangle size={10} />
                      {weekly.atRiskProjects}
                    </span>
                  )}
                </div>
                <p className="text-2xs text-text-tertiary">{locale === 'zh-CN' ? '活跃项目' : 'Active projects'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reflection row: review prompt + XP progress */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Weekly Review Prompt */}
        {!weeklyReview ? (
          <Link
            href="/reviews"
            className="card flex items-center gap-3 border-l-4 border-l-brand-primary transition-colors hover:bg-surface-hover"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10">
              <ClipboardList size={18} className="text-brand-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{locale === 'zh-CN' ? '该做周复盘了' : 'Weekly review due'}</p>
              <p className="text-2xs text-text-tertiary">{locale === 'zh-CN' ? '回顾这一周 →' : 'Reflect on your week →'}</p>
            </div>
          </Link>
        ) : (
          <Link
            href={`/reviews/${weeklyReview.id}`}
            className="card flex items-center gap-3 transition-colors hover:bg-surface-hover"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <ClipboardList size={18} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{locale === 'zh-CN' ? '周复盘已就绪' : 'Weekly review ready'}</p>
              <p className="text-2xs text-text-tertiary">
                {locale === 'zh-CN'
                  ? `${weeklyReview.isPublished ? '已发布' : '草稿'} · 查看 →`
                  : `${weeklyReview.isPublished ? 'Published' : 'Draft'} — view →`}
              </p>
            </div>
          </Link>
        )}

        {/* XP Progress */}
        <div className="card flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
            <Star size={18} className="text-yellow-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">{locale === 'zh-CN' ? `等级 ${level}` : `Level ${level}`}</p>
              <p className="text-2xs text-text-muted">{formatNumber(profile.totalXp ?? 0, locale)} XP</p>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-surface-3">
              <div
                className="h-1.5 rounded-full bg-yellow-500 transition-all"
                style={{ width: `${xpNeeded > 0 ? Math.min(100, (xpProgress / xpNeeded) * 100) : 100}%` }}
              />
            </div>
            <p className="mt-0.5 text-2xs text-text-muted">
              {locale === 'zh-CN'
                ? `${formatNumber(xpProgress, locale)}/${formatNumber(xpNeeded, locale)} XP 升至 ${level + 1} 级`
                : `${xpProgress}/${xpNeeded} XP to level ${level + 1}`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tasks Section */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">{locale === 'zh-CN' ? '今日任务' : 'Today\'s Tasks'}</h2>
            <span className="text-2xs text-text-muted">
              {locale === 'zh-CN'
                ? `${todayTasks.filter(t => t.status === 'done').length}/${todayTasks.length} 已完成`
                : `${todayTasks.filter(t => t.status === 'done').length}/${todayTasks.length} done`}
            </span>
          </div>
          <TaskList tasks={todayTasks} showAddButton={true} emptyMessage={locale === 'zh-CN' ? '今天还没有任务，添加一个吧！' : 'No tasks for today. Add one!'} />
        </div>

        {/* Habits Section */}
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">{locale === 'zh-CN' ? '今日习惯' : 'Today\'s Habits'}</h2>
            <span className="text-2xs text-text-muted">
              {locale === 'zh-CN' ? `${habitsDone}/${habitsTotal} 已完成` : `${habitsDone}/${habitsTotal} complete`}
            </span>
          </div>
          <HabitChecklist habits={habits} completions={completions} />
        </div>
      </div>
    </div>
  );
}
