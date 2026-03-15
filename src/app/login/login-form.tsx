'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { loginAction } from '@/app/actions';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passphrase, setPassphrase] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const redirect = searchParams.get('redirect') || '/today';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) return;

    setError('');
    startTransition(async () => {
      const result = await loginAction(passphrase);
      if (result.success) {
        router.push(redirect);
        router.refresh();
      } else {
        setError(result.error || 'Invalid passphrase');
        setPassphrase('');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="passphrase" className="sr-only">
          Passphrase
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-4 w-4 text-text-muted" />
          </div>
          <input
            id="passphrase"
            type={showPass ? 'text' : 'password'}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter passphrase"
            autoFocus
            autoComplete="current-password"
            disabled={isPending}
            className="w-full rounded-lg border border-surface-3 bg-surface-1 py-2.5 pl-10 pr-10 text-sm text-text-primary placeholder-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-secondary"
            tabIndex={-1}
          >
            {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-status-danger text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending || !passphrase.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Unlocking…
          </>
        ) : (
          'Unlock'
        )}
      </button>
    </form>
  );
}
