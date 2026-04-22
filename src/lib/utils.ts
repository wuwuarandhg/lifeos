import { ulid } from 'ulid';
import {
  DEFAULT_LOCALE,
  formatReadableDate,
  formatReadableISODate,
  formatRelativeDayLabel,
  type AppLocale,
} from '@/lib/i18n';

/** Generate a new ULID — time-sortable unique ID */
export function newId(): string {
  return ulid();
}

/** Get current timestamp in Unix milliseconds */
export function now(): number {
  return Date.now();
}

/** Get today's date as ISO string (YYYY-MM-DD) */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Get current time as HH:MM */
export function currentTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

/** Format a unix ms timestamp to ISO date */
export function toISODate(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

/** Format a unix ms timestamp to readable date string */
export function formatDate(timestamp: number, locale: AppLocale = DEFAULT_LOCALE): string {
  return formatReadableDate(timestamp, locale);
}

/** Format ISO date string to readable */
export function formatISODate(isoDate: string, locale: AppLocale = DEFAULT_LOCALE): string {
  return formatReadableISODate(isoDate, locale);
}

/** Get the start of the week (Monday) for a given date */
export function startOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/** Get the end of the week (Sunday) for a given date */
export function endOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7); // Sunday
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

/** Get relative day label */
export function relativeDayLabel(isoDate: string, locale: AppLocale = DEFAULT_LOCALE): string {
  return formatRelativeDayLabel(isoDate, locale);
}

/** Count words in a string */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
