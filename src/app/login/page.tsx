import { LoginForm } from './login-form';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import { translateText } from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Login');
}
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const isConfigured = !!process.env.AUTH_SECRET &&
    process.env.AUTH_SECRET !== 'changeme' &&
    process.env.AUTH_SECRET !== 'changeme-to-a-strong-passphrase';
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white font-bold text-xl">
            L
          </div>
          <h1 className="text-xl font-semibold text-text-primary">lifeOS</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            {tx('Enter your passphrase to continue')}
          </p>
        </div>

        {/* Warning if not configured */}
        {!isConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium text-amber-800">
              {tx('AUTH_SECRET is not configured')}
            </p>
            <p className="mt-0.5 text-2xs text-amber-700">
              {tx('Set a strong passphrase in your .env file or environment variables. The default value is not secure.')}
            </p>
          </div>
        )}

        {/* Login Form */}
        <LoginForm />
      </div>
    </div>
  );
}
