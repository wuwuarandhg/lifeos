'use client';

import { useState } from 'react';
import { FileJson, Download, Loader2 } from 'lucide-react';
import { useLocale } from '@/stores/locale-store';

export function ExportActions() {
  const [jsonLoading, setJsonLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const { locale } = useLocale();

  const handleJsonExport = async () => {
    setJsonLoading(true);
    try {
      // Trigger download via direct link to API route
      const link = document.createElement('a');
      link.href = '/api/export/json';
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      // Small delay so the loading state is visible
      setTimeout(() => setJsonLoading(false), 1500);
    }
  };

  const handleDbExport = async () => {
    setDbLoading(true);
    try {
      const link = document.createElement('a');
      link.href = '/api/export/db';
      link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setTimeout(() => setDbLoading(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={handleJsonExport}
        disabled={jsonLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-primary/90 disabled:opacity-50"
      >
        {jsonLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileJson className="h-4 w-4" />
        )}
        {jsonLoading ? (locale === 'zh-CN' ? '导出中…' : 'Exporting…') : (locale === 'zh-CN' ? '导出 JSON' : 'Export JSON')}
      </button>

      <button
        onClick={handleDbExport}
        disabled={dbLoading}
        className="inline-flex items-center gap-2 rounded-lg border border-surface-3 px-4 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-2 disabled:opacity-50"
      >
        {dbLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {dbLoading ? (locale === 'zh-CN' ? '准备中…' : 'Preparing…') : (locale === 'zh-CN' ? '下载数据库' : 'Download Database')}
      </button>
    </div>
  );
}
