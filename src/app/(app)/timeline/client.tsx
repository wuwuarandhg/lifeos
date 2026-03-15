'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Clock, Filter, ChevronDown,
  CheckSquare, Repeat, BookOpen, StickyNote, Lightbulb,
  FolderKanban, Target, BarChart3, Users, CalendarDays,
  ClipboardList, FileText, Inbox,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { TimelineItem, ItemType } from '@/lib/types';
import { loadMoreTimelineAction } from '@/app/actions';

// ----------------------------------------------------------
// Icons per type (Lucide)
// ----------------------------------------------------------
const TYPE_ICONS: Record<string, React.ReactNode> = {
  task: <CheckSquare size={16} />,
  habit: <Repeat size={16} />,
  journal: <BookOpen size={16} />,
  note: <StickyNote size={16} />,
  idea: <Lightbulb size={16} />,
  project: <FolderKanban size={16} />,
  goal: <Target size={16} />,
  metric: <BarChart3 size={16} />,
  entity: <Users size={16} />,
  event: <CalendarDays size={16} />,
  review: <ClipboardList size={16} />,
  inbox: <Inbox size={16} />,
};

const TYPE_COLORS: Record<string, string> = {
  task: 'text-blue-500 bg-blue-50',
  habit: 'text-violet-500 bg-violet-50',
  journal: 'text-amber-500 bg-amber-50',
  note: 'text-emerald-500 bg-emerald-50',
  idea: 'text-yellow-600 bg-yellow-50',
  project: 'text-indigo-500 bg-indigo-50',
  goal: 'text-red-500 bg-red-50',
  metric: 'text-cyan-500 bg-cyan-50',
  entity: 'text-pink-500 bg-pink-50',
  event: 'text-orange-500 bg-orange-50',
  review: 'text-teal-500 bg-teal-50',
};

const TYPE_LABELS: Record<string, string> = {
  task: 'Tasks', habit: 'Habits', journal: 'Journal', note: 'Notes',
  idea: 'Ideas', project: 'Projects', goal: 'Goals', metric: 'Metrics',
  entity: 'Entities', event: 'Events', review: 'Reviews',
};

const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This year', days: 365 },
  { label: 'All time', days: 0 },
];

// ----------------------------------------------------------
// Props
// ----------------------------------------------------------
interface Props {
  initialDayGroups: { date: string; items: TimelineItem[] }[];
  initialHasMore: boolean;
  stats: {
    journals: number;
    completedTasks: number;
    events: number;
    reviews: number;
    notes: number;
    ideas: number;
    earliestDate: string | null;
  };
}

export function TimelineClient({ initialDayGroups, initialHasMore, stats }: Props) {
  const [dayGroups, setDayGroups] = useState(initialDayGroups);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(() => {
    const types = new Set<string>();
    for (const g of initialDayGroups) {
      for (const item of g.items) types.add(item.type);
    }
    return types;
  });
  const [selectedRange, setSelectedRange] = useState(90);

  // All items count
  const totalItems = useMemo(
    () => dayGroups.reduce((sum, g) => sum + g.items.length, 0),
    [dayGroups]
  );

  // Filtered day groups
  const filteredGroups = useMemo(() => {
    if (enabledTypes.size === 0) return [];
    return dayGroups
      .map(g => ({
        date: g.date,
        items: g.items.filter(item => enabledTypes.has(item.type)),
      }))
      .filter(g => g.items.length > 0);
  }, [dayGroups, enabledTypes]);

  // Available types from current data
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    for (const g of dayGroups) {
      for (const item of g.items) types.add(item.type);
    }
    return [...types].sort();
  }, [dayGroups]);

  // Toggle type
  const toggleType = useCallback((type: string) => {
    setEnabledTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Load more
  const handleLoadMore = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadMoreTimelineAction(totalItems, selectedRange);
      if (result.dayGroups.length > 0) {
        setDayGroups(prev => {
          const merged = [...prev];
          for (const newGroup of result.dayGroups) {
            const existingIdx = merged.findIndex(g => g.date === newGroup.date);
            if (existingIdx >= 0) {
              // Merge items into existing day
              const existingIds = new Set(merged[existingIdx].items.map(i => i.id));
              const newItems = newGroup.items.filter((i: TimelineItem) => !existingIds.has(i.id));
              merged[existingIdx] = {
                ...merged[existingIdx],
                items: [...merged[existingIdx].items, ...newItems],
              };
            } else {
              merged.push(newGroup);
            }
          }
          return merged.sort((a, b) => b.date.localeCompare(a.date));
        });
        setHasMore(result.hasMore);
      } else {
        setHasMore(false);
      }
    } catch {
      // fail silently
    }
    setIsLoading(false);
  }, [totalItems, selectedRange]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Clock size={22} className="text-brand-500" />
            <h1 className="text-2xl font-semibold text-text-primary">Timeline</h1>
          </div>
          <p className="text-sm text-text-muted">
            Your personal chronology — {totalItems} events
            {stats.earliestDate && ` since ${stats.earliestDate}`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
            showFilters ? 'bg-brand-100 text-brand-700' : 'text-text-muted hover:bg-surface-2'
          )}
        >
          <Filter size={14} />
          Filters
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        {stats.journals > 0 && (
          <StatBadge icon={<BookOpen size={12} />} label="Journal" count={stats.journals} />
        )}
        {stats.completedTasks > 0 && (
          <StatBadge icon={<CheckSquare size={12} />} label="Completed" count={stats.completedTasks} />
        )}
        {stats.reviews > 0 && (
          <StatBadge icon={<ClipboardList size={12} />} label="Reviews" count={stats.reviews} />
        )}
        {stats.notes > 0 && (
          <StatBadge icon={<StickyNote size={12} />} label="Notes" count={stats.notes} />
        )}
        {stats.ideas > 0 && (
          <StatBadge icon={<Lightbulb size={12} />} label="Ideas" count={stats.ideas} />
        )}
        {stats.events > 0 && (
          <StatBadge icon={<CalendarDays size={12} />} label="Events" count={stats.events} />
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 mb-6 space-y-4">
          {/* Type filters */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Show Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-medium transition-colors',
                    enabledTypes.has(type)
                      ? TYPE_COLORS[type] ?? 'text-text-secondary bg-surface-2'
                      : 'text-text-muted bg-surface-1 opacity-50'
                  )}
                >
                  {TYPE_ICONS[type]}
                  {TYPE_LABELS[type] ?? type}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
              Date Range
            </h3>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.days}
                  onClick={() => setSelectedRange(opt.days)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-2xs font-medium transition-colors',
                    selectedRange === opt.days
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-text-muted hover:bg-surface-2'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick toggles */}
          <div className="flex gap-2 text-2xs">
            <button
              onClick={() => setEnabledTypes(new Set(availableTypes))}
              className="text-brand-500 hover:text-brand-600 transition-colors"
            >
              Show all
            </button>
            <span className="text-text-muted">·</span>
            <button
              onClick={() => setEnabledTypes(new Set(['journal', 'review', 'event']))}
              className="text-brand-500 hover:text-brand-600 transition-colors"
            >
              Reflections only
            </button>
            <span className="text-text-muted">·</span>
            <button
              onClick={() => setEnabledTypes(new Set(['task', 'project', 'goal']))}
              className="text-brand-500 hover:text-brand-600 transition-colors"
            >
              Accomplishments
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {filteredGroups.length === 0 ? (
        <div className="card py-12 text-center">
          <Clock size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-muted">No timeline events to display.</p>
          <p className="text-2xs text-text-muted mt-1">
            Journal entries, completed tasks, and other milestones will appear here.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-surface-3" />

          <div className="space-y-6">
            {filteredGroups.map(group => (
              <DayGroup key={group.date} date={group.date} items={group.items} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors disabled:opacity-50"
              >
                <ChevronDown size={16} />
                {isLoading ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------
// Day Group
// ----------------------------------------------------------
function DayGroup({ date, items }: { date: string; items: TimelineItem[] }) {
  const label = getRelativeDayLabel(date);

  return (
    <div>
      {/* Day header */}
      <div className="relative flex items-center gap-3 mb-2">
        <div className="w-[47px] flex-shrink-0 flex justify-center">
          <div className="w-3 h-3 rounded-full bg-surface-3 border-2 border-surface-bg z-10" />
        </div>
        <h2 className="text-sm font-semibold text-text-primary">{label}</h2>
        <span className="text-2xs text-text-muted">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5">
        {items.map(item => (
          <TimelineItemCard key={`${item.type}:${item.id}`} item={item} />
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------
// Timeline Item Card
// ----------------------------------------------------------
function TimelineItemCard({ item }: { item: TimelineItem }) {
  const colorClasses = TYPE_COLORS[item.type] ?? 'text-text-muted bg-surface-2';
  const icon = TYPE_ICONS[item.type] ?? <FileText size={16} />;

  return (
    <Link
      href={item.detailUrl}
      className="relative flex items-start gap-3 group pl-[47px]"
    >
      {/* Dot on the timeline line */}
      <div className="absolute left-[20px] top-2.5 w-[7px] h-[7px] rounded-full bg-surface-3 group-hover:bg-brand-400 transition-colors z-10" />

      {/* Card */}
      <div className="flex-1 flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-1 transition-colors -ml-1">
        {/* Type icon */}
        <span className={cn('flex-shrink-0 p-1.5 rounded-md', colorClasses)}>
          {icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary group-hover:text-brand-600 transition-colors truncate">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {item.subtitle && (
              <span className="text-2xs text-text-muted">{item.subtitle}</span>
            )}
            {item.time && (
              <span className="text-2xs text-text-muted">{item.time}</span>
            )}
          </div>
        </div>

        {/* Type label */}
        <span className="text-2xs text-text-muted flex-shrink-0 mt-0.5">
          {TYPE_LABELS[item.type] ?? item.type}
        </span>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------
// Stat Badge
// ----------------------------------------------------------
function StatBadge({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 text-text-muted text-2xs">
      {icon}
      <span>{count} {label}</span>
    </div>
  );
}

// ----------------------------------------------------------
// Relative day label
// ----------------------------------------------------------
function getRelativeDayLabel(isoDate: string): string {
  const today = new Date().toISOString().split('T')[0];
  if (isoDate === today) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isoDate === yesterday.toISOString().split('T')[0]) return 'Yesterday';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isoDate === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
