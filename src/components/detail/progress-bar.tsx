import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number; // 0–100
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = 'sm',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const barColor =
    clamped >= 80
      ? 'bg-green-500'
      : clamped >= 50
        ? 'bg-blue-500'
        : clamped >= 20
          ? 'bg-amber-500'
          : 'bg-surface-4';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex-1 overflow-hidden rounded-full bg-surface-2',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300', barColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-2xs font-medium text-text-tertiary tabular-nums">
          {clamped}%
        </span>
      )}
    </div>
  );
}
