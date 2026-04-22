import {
  Shield, Database, Download, Server,
  HardDrive, FileJson, CheckCircle, AlertTriangle, Activity, XCircle,
} from 'lucide-react';
import { getDataStats } from '@/server/services/export';
import { getSystemInfo } from '@/server/services/system';
import { getRuntimeDiagnostics } from '@/server/services/runtime';
import { getProfile } from '@/server/services/gamification';
import { calculateLevel } from '@/lib/constants';
import { LogoutButton } from './logout-button';
import { ExportActions } from './export-actions';
import { LanguageSwitcher } from '@/components/settings/language-switcher';
import { buildPageMetadata, getCurrentLocale } from '@/lib/locale-server';
import {
  formatNumber,
  formatReviewsGenerated,
  formatTotalRecords,
  translateText,
} from '@/lib/i18n';

export async function generateMetadata() {
  return buildPageMetadata('Settings');
}
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const stats = getDataStats();
  const system = getSystemInfo();
  const diagnostics = getRuntimeDiagnostics();
  const profile = getProfile();
  const level = calculateLevel(profile.totalXp ?? 0);
  const locale = await getCurrentLocale();
  const tx = (text: string) => translateText(text, locale);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{tx('Settings')}</h1>
        <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          v{system.appVersion}
        </span>
      </div>

      <section className="card">
        <LanguageSwitcher />
      </section>

      {/* Security Section */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-primary" />
          <h2 className="text-sm font-semibold text-text-primary">{tx('Security')}</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary">{tx('Authentication')}</p>
              <p className="text-2xs text-text-tertiary">
                {tx('Passphrase protection for your instance')}
              </p>
            </div>
            {system.authConfigured ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
                <CheckCircle className="h-3.5 w-3.5" />
                {tx('Configured')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5" />
                {tx('Using default')}
              </span>
            )}
          </div>

          {!system.authConfigured && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-800">
                {tx('Set a strong AUTH_SECRET in your environment variables for production use.')}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-sm text-text-primary">{tx('Session')}</p>
              <p className="text-2xs text-text-tertiary">
                {tx('Sessions expire after 7 days')}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </section>

      {/* Data & Export Section */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-brand-primary" />
          <h2 className="text-sm font-semibold text-text-primary">{tx('Data & Export')}</h2>
        </div>

        <p className="text-xs text-text-tertiary">
          {tx('Your data is stored locally in a SQLite database. You own it completely. Export or back up at any time.')}
        </p>

        {/* Data summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label={tx('Tasks')} value={stats.tasks} />
          <StatCard label={tx('Habits')} value={stats.habits} />
          <StatCard label={tx('Journal')} value={stats.journalEntries} />
          <StatCard label={tx('Notes')} value={stats.notes} />
          <StatCard label={tx('Ideas')} value={stats.ideas} />
          <StatCard label={tx('Projects')} value={stats.projects} />
          <StatCard label={tx('Goals')} value={stats.goals} />
          <StatCard label={tx('Metrics')} value={stats.metricLogs} />
          <StatCard label={locale === 'zh-CN' ? '人物与学习' : 'People & Learning'} value={stats.entities} />
          <StatCard label={tx('Attachments')} value={stats.attachments} />
          <StatCard label={locale === 'zh-CN' ? '导入记录' : 'Import Runs'} value={stats.importRuns} />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-1 px-3 py-2">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-text-muted" />
            <span className="text-xs text-text-secondary">
              {formatTotalRecords(locale, stats.totalRecords)}
            </span>
          </div>
          <span className="text-xs text-text-muted">
            {locale === 'zh-CN' ? `数据库大小：${stats.dbSizeFormatted}` : `DB size: ${stats.dbSizeFormatted}`}
          </span>
        </div>

        {/* Export actions */}
        <ExportActions />
      </section>

      {/* Runtime Diagnostics */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-primary" />
          <h2 className="text-sm font-semibold text-text-primary">{tx('Runtime Diagnostics')}</h2>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-surface-1 px-3 py-2">
          <div>
            <p className="text-sm text-text-primary">{tx('Current readiness')}</p>
            <p className="text-2xs text-text-tertiary">
              {diagnostics.errorCount > 0
                ? locale === 'zh-CN'
                  ? `${formatNumber(diagnostics.errorCount, locale)} 个阻塞问题`
                  : `${diagnostics.errorCount} blocking issue${diagnostics.errorCount !== 1 ? 's' : ''}`
                : diagnostics.warningCount > 0
                ? locale === 'zh-CN'
                  ? `${formatNumber(diagnostics.warningCount, locale)} 个警告`
                  : `${diagnostics.warningCount} warning${diagnostics.warningCount !== 1 ? 's' : ''}`
                : tx('All core checks look healthy')}
            </p>
          </div>
          <RuntimeStatusBadge status={diagnostics.status} locale={locale} />
        </div>

        <div className="space-y-2">
          {diagnostics.checks.map((check) => (
            <div
              key={check.key}
              className="rounded-lg border border-surface-3 bg-surface-1 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-text-primary">{check.label}</p>
                  <p className="text-2xs text-text-tertiary">{check.message}</p>
                </div>
                <CheckStatusBadge status={check.status} locale={locale} />
              </div>
              {check.details.length > 0 && (
                <div className="mt-2 space-y-0.5">
                  {check.details.map((detail) => (
                    <p key={detail} className="text-2xs text-text-muted">
                      {detail}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* System Info Section */}
      <section className="card space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-brand-primary" />
          <h2 className="text-sm font-semibold text-text-primary">{tx('System')}</h2>
        </div>

        <div className="space-y-2">
          <InfoRow label={tx('App version')} value={`v${system.appVersion}`} />
          <InfoRow label={tx('Environment')} value={system.environment} />
          <InfoRow label="Node.js" value={system.nodeVersion} />
          <InfoRow label={tx('Platform')} value={system.platform} />
          <InfoRow label={tx('Uptime')} value={system.uptime} />
          <InfoRow label={tx('Database')} value={system.dbPath} mono />
          <InfoRow label={tx('Data directory')} value={system.dataDir} mono />
          <InfoRow label={tx('Attachments')} value={system.attachmentsPath} mono />
        </div>

        {/* Profile summary */}
        <div className="rounded-lg bg-surface-1 px-3 py-2">
          <p className="text-xs text-text-secondary">
            {locale === 'zh-CN'
              ? `等级 ${level} · ${formatNumber(profile.totalXp ?? 0, locale)} XP · ${formatReviewsGenerated(locale, stats.reviews)}`
              : `Level ${level} · ${formatNumber(profile.totalXp ?? 0, locale)} XP · ${formatReviewsGenerated(locale, stats.reviews)}`}
          </p>
        </div>

        {/* Backup guidance */}
        <div className="rounded-lg border border-surface-3 px-3 py-2">
          <p className="text-2xs font-medium text-text-secondary mb-1">
            {tx('Backup guidance')}
          </p>
          <ul className="space-y-0.5 text-2xs text-text-tertiary">
            <li>• {locale === 'zh-CN' ? '你的数据库是上方路径所示的单个 SQLite 文件' : 'Your database is a single SQLite file at the path shown above'}</li>
            <li>• {locale === 'zh-CN' ? '使用上方的“下载数据库”可以获得一致性的备份' : 'Use “Download Database” above for a consistent backup'}</li>
            <li>• {locale === 'zh-CN' ? <>在 Docker 中，数据位于 <code className="rounded bg-surface-2 px-1 font-mono">lifeos-data</code> 卷</> : <>In Docker, data is in the <code className="rounded bg-surface-2 px-1 font-mono">lifeos-data</code> volume</>}</li>
            <li>• {locale === 'zh-CN' ? '恢复时：先停止应用，替换数据库文件，再重新启动' : 'To restore: stop the app, replace the DB file, restart'}</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-surface-1 px-3 py-2">
      <p className="text-lg font-semibold text-text-primary">{value}</p>
      <p className="text-2xs text-text-muted">{label}</p>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-text-tertiary">{label}</span>
      <span className={`text-text-secondary ${mono ? 'font-mono text-2xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function RuntimeStatusBadge({ status, locale }: { status: 'ok' | 'degraded' | 'error'; locale: 'en' | 'zh-CN' }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
        <CheckCircle className="h-3.5 w-3.5" />
        {translateText('Ready', locale)}
      </span>
    );
  }

  if (status === 'degraded') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600">
        <AlertTriangle className="h-3.5 w-3.5" />
        {translateText('Degraded', locale)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
      <XCircle className="h-3.5 w-3.5" />
      {translateText('Blocked', locale)}
    </span>
  );
}

function CheckStatusBadge({ status, locale }: { status: 'ok' | 'warn' | 'error'; locale: 'en' | 'zh-CN' }) {
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-2xs font-medium text-green-600">
        <CheckCircle className="h-3 w-3" />
        {translateText('OK', locale)}
      </span>
    );
  }

  if (status === 'warn') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-2xs font-medium text-amber-600">
        <AlertTriangle className="h-3 w-3" />
        {translateText('Warning', locale)}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-2xs font-medium text-red-600">
      <XCircle className="h-3 w-3" />
      {translateText('Error', locale)}
    </span>
  );
}
