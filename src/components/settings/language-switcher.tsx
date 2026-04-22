'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Languages } from 'lucide-react';
import { cn } from '@/lib/cn';
import { type AppLocale } from '@/lib/i18n';
import { useLocale } from '@/stores/locale-store';

const OPTIONS: { value: AppLocale; label: string; description: string }[] = [
  { value: 'zh-CN', label: '简体中文', description: '界面使用中文显示' },
  { value: 'en', label: 'English', description: 'Use English for the interface' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale, setLocale, tx } = useLocale();

  const handleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale || isPending) return;
    setLocale(nextLocale);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Languages className="h-5 w-5 text-brand-primary" />
        <h2 className="text-sm font-semibold text-text-primary">{tx('Language')}</h2>
      </div>
      <p className="text-xs text-text-tertiary">
        {locale === 'zh-CN'
          ? '语言偏好会保存在当前浏览器中。'
          : 'Your language preference is stored in this browser.'}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = option.value === locale;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleChange(option.value)}
              disabled={isPending}
              className={cn(
                'rounded-lg border px-3 py-3 text-left transition-colors',
                selected
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-surface-3 bg-surface-1 hover:bg-surface-2',
                isPending && 'opacity-60'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">{option.label}</span>
                {selected ? <Check className="h-4 w-4 text-brand-primary" /> : null}
              </div>
              <p className="mt-1 text-2xs text-text-tertiary">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
