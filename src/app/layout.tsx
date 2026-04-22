import type { Metadata } from 'next';
import './globals.css';
import { PwaProvider } from '@/components/pwa/pwa-provider';
import { ModeProvider } from '@/stores/mode-store';
import { LocaleProvider } from '@/stores/locale-store';
import { getCurrentLocale } from '@/lib/locale-server';
import { translateText } from '@/lib/i18n';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale();
  return {
    title: 'lifeOS',
    description: translateText('Your personal Life Operating System', locale),
    manifest: '/manifest.webmanifest',
    icons: { icon: '/icon.svg', apple: '/icon.svg' },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans">
        <LocaleProvider initialLocale={locale}>
          <ModeProvider>
            <PwaProvider />
            {children}
          </ModeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
