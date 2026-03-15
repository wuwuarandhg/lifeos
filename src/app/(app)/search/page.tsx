import { SearchClient } from './client';
import { initializeSearch } from '@/server/services/search';

export const metadata = { title: 'Search — lifeOS' };
export const dynamic = 'force-dynamic';

export default function SearchPage() {
  // Ensure search index is built on first access
  try { initializeSearch(); } catch { /* index may already exist */ }

  return <SearchClient />;
}
