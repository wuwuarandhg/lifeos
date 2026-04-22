'use client';

import { useState } from 'react';
import { createJournalAction } from '@/app/actions';
import { cn } from '@/lib/cn';
import { useLocale } from '@/stores/locale-store';

export function QuickJournalForm() {
  const { tx } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<number | undefined>();
  const [energy, setEnergy] = useState<number | undefined>();

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set('body', body);
    if (mood) formData.set('mood', String(mood));
    if (energy) formData.set('energy', String(energy));

    await createJournalAction(formData);
    setBody('');
    setMood(undefined);
    setEnergy(undefined);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg border border-surface-3 bg-surface-0 px-4 py-3 text-left text-sm text-text-muted hover:border-brand-300 transition-colors"
      >
        {tx('What\'s on your mind? Write a journal entry...')}
      </button>
    );
  }

  return (
    <div className="card space-y-3">
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={tx('Write freely... Use markdown if you like.')}
        rows={5}
        className="w-full resize-none rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />

      {/* Mood / Energy Row */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-tertiary">{tx('Mood')}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
              <button
                key={v}
                onClick={() => setMood(mood === v ? undefined : v)}
                className={cn(
                  'h-6 w-6 rounded text-2xs font-medium transition-colors',
                  mood === v
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface-2 text-text-tertiary hover:bg-surface-3'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-2xs text-text-tertiary">{tx('Energy')}</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
              <button
                key={v}
                onClick={() => setEnergy(energy === v ? undefined : v)}
                className={cn(
                  'h-6 w-6 rounded text-2xs font-medium transition-colors',
                  energy === v
                    ? 'bg-green-500 text-white'
                    : 'bg-surface-2 text-text-tertiary hover:bg-surface-3'
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => { setIsOpen(false); setBody(''); }}
          className="rounded-md px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2"
        >
          {tx('Cancel')}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !body.trim()}
          className={cn(
            'rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white',
            'hover:bg-brand-700 disabled:opacity-50 transition-colors'
          )}
        >
          {isSubmitting ? tx('Saving...') : tx('Save Entry')}
        </button>
      </div>
    </div>
  );
}
