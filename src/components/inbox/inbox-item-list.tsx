'use client';

import { useState } from 'react';
import { dismissInboxAction, createTaskAction, createNoteAction } from '@/app/actions';
import { formatDate } from '@/lib/utils';
import { X, CheckSquare, StickyNote, Lightbulb, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface InboxItem {
  id: string;
  rawText: string;
  parsedType: string | null;
  status: string;
  createdAt: number;
}

export function InboxItemList({ items }: { items: InboxItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <InboxItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function InboxItemCard({ item }: { item: InboxItem }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTriageToTask = async () => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.set('title', item.rawText);
    await createTaskAction(formData);
    await dismissInboxAction(item.id);
    setIsProcessing(false);
  };

  const handleTriageToNote = async () => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.set('title', item.rawText);
    await createNoteAction(formData);
    await dismissInboxAction(item.id);
    setIsProcessing(false);
  };

  const handleDismiss = async () => {
    setIsProcessing(true);
    await dismissInboxAction(item.id);
    setIsProcessing(false);
  };

  return (
    <div className={cn(
      'card flex items-start gap-3 group',
      isProcessing && 'opacity-50'
    )}>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary">{item.rawText}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-2xs text-text-muted">{formatDate(item.createdAt)}</span>
          {item.parsedType && (
            <span className="badge bg-surface-2 text-text-tertiary text-2xs">
              suggested: {item.parsedType}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleTriageToTask}
          disabled={isProcessing}
          className="rounded-md p-1.5 text-text-muted hover:text-blue-500 hover:bg-blue-50 transition-colors"
          title="Convert to task"
        >
          <CheckSquare size={16} />
        </button>
        <button
          onClick={handleTriageToNote}
          disabled={isProcessing}
          className="rounded-md p-1.5 text-text-muted hover:text-purple-500 hover:bg-purple-50 transition-colors"
          title="Convert to note"
        >
          <StickyNote size={16} />
        </button>
        <button
          onClick={handleDismiss}
          disabled={isProcessing}
          className="rounded-md p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
