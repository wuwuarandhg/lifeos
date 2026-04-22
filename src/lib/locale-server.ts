import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import {
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  translateText,
  type AppLocale,
} from '@/lib/i18n';

export async function getCurrentLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function buildPageMetadata(pageName: string): Promise<Metadata> {
  const locale = await getCurrentLocale();
  return {
    title: `${translateText(pageName, locale)} — lifeOS`,
  };
}
