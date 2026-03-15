'use client';

import { useState } from 'react';
import { createEntityAction } from '@/app/actions';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

type LearningType = 'book' | 'article' | 'course';

export function CreateLearningButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningType, setLearningType] = useState<LearningType>('book');

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    formData.set('entityType', learningType);
    await createEntityAction(formData);
    setIsSubmitting(false);
    setIsOpen(false);
    setLearningType('book');
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
        Add Item
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
        <h3 className="text-sm font-semibold text-text-primary">Add Learning Item</h3>

        {/* Type selector */}
        <div className="flex gap-1 rounded-md bg-surface-1 p-1">
          {(['book', 'article', 'course'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setLearningType(t)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm capitalize transition-colors',
                learningType === t
                  ? 'bg-surface-0 font-medium text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'
              )}
            >
              {t === 'book' ? '📚' : t === 'article' ? '📄' : '🎓'} {t}
            </button>
          ))}
        </div>

        <input
          autoFocus
          name="title"
          type="text"
          required
          placeholder={learningType === 'book' ? 'Book title' : learningType === 'article' ? 'Article title' : 'Course name'}
          className="w-full rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />

        <div className="flex gap-2">
          {learningType === 'book' && (
            <input
              name="author"
              type="text"
              placeholder="Author"
              className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          )}
          {learningType === 'article' && (
            <input
              name="url"
              type="url"
              placeholder="URL"
              className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          )}
          {learningType === 'course' && (
            <input
              name="platform"
              type="text"
              placeholder="Platform (Coursera, Udemy...)"
              className="flex-1 rounded-md border border-surface-3 bg-surface-0 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          )}
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
            {isSubmitting ? 'Adding...' : `Add ${learningType}`}
          </button>
        </div>
      </form>
    </div>
  );
}
