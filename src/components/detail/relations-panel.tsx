'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckSquare, Repeat, BookOpen, StickyNote, Lightbulb,
  FolderKanban, Target, Link2, Trash2, Plus,
} from 'lucide-react';
import { removeRelationAction } from '@/app/actions';
import { cn } from '@/lib/cn';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  task: <CheckSquare size={14} />,
  habit: <Repeat size={14} />,
  journal: <BookOpen size={14} />,
  note: <StickyNote size={14} />,
  idea: <Lightbulb size={14} />,
  project: <FolderKanban size={14} />,
  goal: <Target size={14} />,
};

const TYPE_HREFS: Record<string, string> = {
  task: '/tasks',
  habit: '/habits',
  journal: '/journal',
  note: '/notes',
  idea: '/ideas',
  project: '/projects',
  goal: '/goals',
};

const RELATION_LABELS: Record<string, string> = {
  belongs_to: 'Belongs to',
  mentions: 'Mentions',
  supports: 'Supports',
  related_to: 'Related to',
  blocks: 'Blocks',
  derived_from: 'Derived from',
  summarizes: 'Summarizes',
  affects: 'Affects',
};

interface Relation {
  id: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationType: string;
}

interface RelatedItem {
  relation: Relation;
  type: string;
  id: string;
  title: string;
  direction: 'outgoing' | 'incoming';
}

interface RelationsPanelProps {
  items: RelatedItem[];
  onAddClick?: () => void;
}

export function RelationsPanel({ items, onAddClick }: RelationsPanelProps) {
  if (items.length === 0 && !onAddClick) return null;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-text-muted" />
          <h3 className="text-sm font-semibold text-text-primary">
            Linked Items
          </h3>
          {items.length > 0 && (
            <span className="text-2xs text-text-muted">({items.length})</span>
          )}
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-2xs text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
          >
            <Plus size={12} />
            Link
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-2xs text-text-muted py-2">No linked items yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => (
            <RelationRow key={item.relation.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function RelationRow({ item }: { item: RelatedItem }) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    await removeRelationAction(item.relation.id);
  };

  const icon = TYPE_ICONS[item.type] ?? <Link2 size={14} />;
  const href = `${TYPE_HREFS[item.type] ?? '/'}/${item.id}`;
  const relationLabel = RELATION_LABELS[item.relation.relationType] ?? item.relation.relationType;

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-1 transition-colors',
        isRemoving && 'opacity-40'
      )}
    >
      <span className="text-text-muted">{icon}</span>
      <Link
        href={href}
        className="flex-1 text-sm text-text-primary hover:text-brand-600 transition-colors truncate"
      >
        {item.title}
      </Link>
      <span className="text-2xs text-text-muted">{relationLabel}</span>
      <button
        onClick={handleRemove}
        disabled={isRemoving}
        className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-status-danger transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
