'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toggleHabitAction } from '@/app/actions';
import { cn } from '@/lib/cn';
import { Flame } from 'lucide-react';
import { useLocale } from '@/stores/locale-store';

interface Habit {
  id: string;
  name: string;
  currentStreak: number | null;
  domain: string | null;
  difficulty: string | null;
}

interface HabitCompletion {
  habitId: string;
  completedDate: string;
}

interface HabitChecklistProps {
  habits: Habit[];
  completions: HabitCompletion[];
  date?: string;
}

export function HabitChecklist({ habits, completions, date }: HabitChecklistProps) {
  const { tx } = useLocale();
  const completedIds = new Set(completions.map(c => c.habitId));

  if (habits.length === 0) {
    return <p className="py-4 text-center text-sm text-text-muted">{tx('No active habits')}</p>;
  }

  return (
    <div className="space-y-0.5">
      {habits.map((habit) => (
        <HabitCheckItem
          key={habit.id}
          habit={habit}
          isCompleted={completedIds.has(habit.id)}
          date={date}
        />
      ))}
    </div>
  );
}

function HabitCheckItem({
  habit,
  isCompleted,
  date,
}: {
  habit: Habit;
  isCompleted: boolean;
  date?: string;
}) {
  const [optimisticCompleted, setOptimisticCompleted] = useState(isCompleted);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsToggling(true);
    setOptimisticCompleted(!optimisticCompleted);
    await toggleHabitAction(habit.id, date);
    setIsToggling(false);
  };

  return (
    <Link href={`/habits/${habit.id}`}>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-md px-2 py-2 transition-colors',
          'hover:bg-surface-1',
          isToggling && 'opacity-70'
        )}
      >
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all flex-shrink-0',
          optimisticCompleted
            ? 'border-status-success bg-status-success text-white'
            : 'border-surface-4 hover:border-brand-400'
        )}
      >
        {optimisticCompleted && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span
        className={cn(
          'flex-1 text-sm',
          optimisticCompleted && 'text-text-tertiary'
        )}
      >
        {habit.name}
      </span>

      {(habit.currentStreak ?? 0) > 0 && (
        <span className="flex items-center gap-0.5 text-2xs text-text-tertiary">
          <Flame size={12} className="text-orange-400" />
          {habit.currentStreak}
        </span>
      )}
      </div>
    </Link>
  );
}
