'use client';

import Link from 'next/link';
import { ArrowLeft, Archive, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useState } from 'react';

interface DetailPageShellProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  onTitleChange?: (title: string) => void;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  onArchive?: () => void;
  children: React.ReactNode;
}

export function DetailPageShell({
  backHref,
  backLabel,
  title,
  subtitle,
  onTitleChange,
  badge,
  actions,
  onArchive,
  children,
}: DetailPageShellProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [showMenu, setShowMenu] = useState(false);

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== title && onTitleChange) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={16} />
          <span>{backLabel}</span>
        </Link>

        <div className="flex items-center gap-2">
          {actions}
          {onArchive && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text-secondary transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-surface-3 bg-surface-0 py-1 shadow-lg">
                    <button
                      onClick={() => {
                        onArchive();
                        setShowMenu(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-status-danger hover:bg-surface-1 transition-colors"
                    >
                      <Archive size={14} />
                      Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center gap-3">
          {isEditingTitle && onTitleChange ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="flex-1 bg-transparent text-2xl font-semibold text-text-primary outline-none border-b-2 border-brand-400 pb-0.5"
            />
          ) : (
            <h1
              onClick={() => onTitleChange && setIsEditingTitle(true)}
              className={cn(
                'text-2xl font-semibold text-text-primary',
                onTitleChange && 'cursor-pointer hover:text-brand-600 transition-colors'
              )}
            >
              {title}
            </h1>
          )}
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-sm text-text-tertiary">{subtitle}</p>
        )}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
