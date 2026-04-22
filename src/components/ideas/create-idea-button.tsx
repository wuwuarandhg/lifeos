'use client';

import { useState } from 'react';
import { createIdeaAction } from '@/app/actions';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocale } from '@/stores/locale-store';

export function CreateIdeaButton() {
  const { tx } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    await createIdeaAction(formData);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5',
          'text-sm font-medium text-white hover:bg-brand-700 transition-colors'
        )}
      >
        <Plus size={16} />
        {tx('New Idea')}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/30" onClick={() => setIsOpen(false)}>
      <form
        action={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-surface-3 bg-surface-0 p-4 shadow-lg space-y-3"
      >
        <h3 className="text-sm font-semibold text-text-primary">{tx('New Idea')}</h3>
        <input
          autoFocus
          name="title"
          type="text"
          required
          placeholder={tx('Idea title')}
          className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <input
          name="summary"
          type="text"
          placeholder={tx('Quick summary (one-liner)')}
          className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <div className="flex gap-2">
          <select
            name="stage"
            defaultValue="seed"
            className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            <option value="seed">{tx('🌱 Seed')}</option>
            <option value="developing">{tx('🌿 Developing')}</option>
            <option value="mature">{tx('🌳 Mature')}</option>
          </select>
          <input
            name="theme"
            type="text"
            placeholder={tx('Theme (optional)')}
            className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2"
          >
            {tx('Cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white',
              'hover:bg-brand-700 disabled:opacity-50 transition-colors'
            )}
          >
            {isSubmitting ? tx('Capturing...') : tx('Capture Idea')}
          </button>
        </div>
      </form>
    </div>
  );
}
