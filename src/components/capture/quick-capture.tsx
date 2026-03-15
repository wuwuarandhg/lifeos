'use client';

import { useState, useRef } from 'react';
import { Plus, Send } from 'lucide-react';
import { captureAction, createTaskAction } from '@/app/actions';
import { cn } from '@/lib/cn';

export function QuickCapture() {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // If it looks like a direct task command, create task directly
      const lower = text.toLowerCase().trim();
      if (lower.startsWith('task:') || lower.startsWith('todo:')) {
        const title = text.replace(/^(task:|todo:)\s*/i, '').trim();
        if (title) {
          const formData = new FormData();
          formData.set('title', title);
          await createTaskAction(formData);
        }
      } else {
        // Otherwise, send to inbox
        await captureAction(text.trim());
      }

      setText('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setText('');
      setIsExpanded(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn(
      'relative transition-all duration-200',
      isExpanded && 'ring-2 ring-brand-100 rounded-lg'
    )}>
      <div className="relative flex items-center">
        <Plus size={16} className="absolute left-3 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          onBlur={() => {
            if (!text) setIsExpanded(false);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Capture anything... (task, idea, journal, note)"
          className="capture-bar pl-9 pr-10"
          disabled={isSubmitting}
        />
        {text && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="absolute right-2 rounded-md p-1.5 text-brand-500 hover:bg-brand-50 transition-colors"
          >
            <Send size={16} />
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="px-3 py-1.5 text-2xs text-text-muted">
          Prefix with <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">task:</kbd>{' '}
          <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">idea:</kbd>{' '}
          <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">note:</kbd>{' '}
          <kbd className="rounded bg-surface-2 px-1 py-0.5 font-mono">journal:</kbd>{' '}
          or just type freely → inbox
        </div>
      )}
    </div>
  );
}
