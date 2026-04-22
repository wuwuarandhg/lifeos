'use client';

import { cn } from '@/lib/cn';
import { useLocale } from '@/stores/locale-store';
import { translateText } from '@/lib/i18n';

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
  labelMap?: Record<string, string>;
  size?: 'sm' | 'md';
}

const DEFAULT_COLORS: Record<string, string> = {
  // Project statuses
  planning: 'bg-blue-50 text-blue-700',
  active: 'bg-green-50 text-green-700',
  paused: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
  // Goal statuses
  achieved: 'bg-emerald-50 text-emerald-700',
  abandoned: 'bg-gray-100 text-gray-500',
  // Task statuses
  inbox: 'bg-purple-50 text-purple-700',
  todo: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  done: 'bg-green-50 text-green-700',
  // Health indicators
  on_track: 'bg-green-50 text-green-700',
  at_risk: 'bg-yellow-50 text-yellow-700',
  off_track: 'bg-red-50 text-red-700',
  // Idea stages
  seed: 'bg-yellow-50 text-yellow-700',
  developing: 'bg-green-50 text-green-700',
  mature: 'bg-emerald-50 text-emerald-700',
  implemented: 'bg-blue-50 text-blue-700',
  archived: 'bg-gray-100 text-gray-500',
  // Learning statuses
  to_read: 'bg-yellow-50 text-yellow-700',
  reading: 'bg-blue-50 text-blue-700',
  read: 'bg-green-50 text-green-700',
  planned: 'bg-surface-2 text-text-muted',
};

const DEFAULT_LABELS: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
  achieved: 'Achieved',
  abandoned: 'Abandoned',
  inbox: 'Inbox',
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  on_track: 'On Track',
  at_risk: 'At Risk',
  off_track: 'Off Track',
  // Time horizons
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  multi_year: 'Multi-Year',
  life: 'Life',
  // Journal entry types
  daily: 'Daily',
  reflection: 'Reflection',
  gratitude: 'Gratitude',
  freeform: 'Freeform',
  evening_review: 'Evening Review',
  // Note types
  note: 'Note',
  reference: 'Reference',
  meeting: 'Meeting',
  snippet: 'Snippet',
  evergreen: 'Evergreen',
  // Idea stages
  seed: '🌱 Seed',
  developing: '🌿 Developing',
  mature: '🌳 Mature',
  implemented: '✅ Implemented',
  archived: '📦 Archived',
  // Learning statuses
  to_read: 'To Read',
  reading: 'Reading',
  read: 'Read',
  planned: 'Planned',
};

export function StatusBadge({
  status,
  colorMap = DEFAULT_COLORS,
  labelMap = DEFAULT_LABELS,
  size = 'sm',
}: StatusBadgeProps) {
  const { locale } = useLocale();
  const color = colorMap[status] ?? 'bg-surface-2 text-text-tertiary';
  const label = translateText(labelMap[status] ?? status, locale);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        color,
        size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-2.5 py-1 text-xs'
      )}
    >
      {label}
    </span>
  );
}
