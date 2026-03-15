import { getAllHabits, getTodayCompletions } from '@/server/services/habits';
import { HabitChecklist } from '@/components/habits/habit-checklist';
import { CreateHabitForm } from '@/components/habits/create-habit-form';
import { Repeat } from 'lucide-react';

export const metadata = { title: 'Habits — lifeOS' };
export const dynamic = 'force-dynamic';

export default function HabitsPage() {
  const habits = getAllHabits();
  const completions = getTodayCompletions();
  const activeHabits = habits.filter(h => !h.isPaused);
  const pausedHabits = habits.filter(h => h.isPaused);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Habits</h1>
        <span className="text-sm text-text-tertiary">
          {activeHabits.length} active
        </span>
      </div>

      {habits.length === 0 ? (
        <div className="card py-12 text-center">
          <Repeat size={32} className="mx-auto text-text-muted mb-2" />
          <p className="text-sm text-text-secondary">No habits yet</p>
          <p className="text-2xs text-text-muted mt-1">
            Create your first habit below to start building consistency.
          </p>
        </div>
      ) : (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Today</h2>
          <HabitChecklist habits={activeHabits} completions={completions} />
        </div>
      )}

      <CreateHabitForm />

      {pausedHabits.length > 0 && (
        <div className="card opacity-60">
          <h2 className="mb-3 text-sm font-semibold text-text-tertiary">Paused</h2>
          <div className="space-y-1">
            {pausedHabits.map(h => (
              <div key={h.id} className="px-2 py-1.5 text-sm text-text-muted">
                {h.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
