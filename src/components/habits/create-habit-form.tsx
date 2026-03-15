'use client';

import { useState } from 'react';
import { createHabitAction } from '@/app/actions';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

const DOMAINS = [
  { value: 'health', label: 'Health' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'learning', label: 'Learning' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'finance', label: 'Finance' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'reflection', label: 'Reflection' },
];

export function CreateHabitForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await createHabitAction(formData);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-surface-4 px-4 py-3 text-sm text-text-muted hover:border-brand-300 hover:text-brand-500 transition-colors"
      >
        <Plus size={16} />
        Add new habit
      </button>
    );
  }

  return (
    <form action={handleSubmit} className="card space-y-3">
      <h3 className="text-sm font-semibold text-text-primary">New Habit</h3>

      <input
        autoFocus
        name="name"
        type="text"
        required
        placeholder="Habit name (e.g., Meditate)"
        className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      <div className="flex gap-3">
        <select
          name="domain"
          className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">Domain (optional)</option>
          {DOMAINS.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>

        <select
          name="difficulty"
          className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="easy">Easy</option>
          <option value="medium" selected>Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white',
            'hover:bg-brand-700 disabled:opacity-50 transition-colors'
          )}
        >
          {isSubmitting ? 'Creating...' : 'Create Habit'}
        </button>
      </div>
    </form>
  );
}
