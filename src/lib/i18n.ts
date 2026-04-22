export const LOCALE_COOKIE_NAME = 'lifeos-locale';
export const SUPPORTED_LOCALES = ['en', 'zh-CN'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

const ZH_TRANSLATIONS: Record<string, string> = {
  'Your personal Life Operating System': '你的个人生活操作系统',
  Today: '今天',
  Yesterday: '昨天',
  Tomorrow: '明天',
  Track: '记录',
  Plan: '规划',
  Life: '生活',
  Analyze: '分析',
  Inbox: '收件箱',
  Tasks: '任务',
  Habits: '习惯',
  Journal: '日志',
  Notes: '笔记',
  Ideas: '想法',
  Projects: '项目',
  Goals: '目标',
  Health: '健康',
  Finance: '财务',
  Learning: '学习',
  People: '人物',
  Insights: '洞察',
  Metrics: '指标',
  Graph: '关系图谱',
  Reviews: '复盘',
  Timeline: '时间线',
  Search: '搜索',
  Imports: '导入',
  Settings: '设置',
  'Quick Mode': '速览模式',
  'Deep Mode': '深度模式',
  'Log out': '退出登录',
  Login: '登录',
  Offline: '离线',
  'Graph Explorer': '关系图浏览器',
  'Journal Entry': '日志条目',
  'Learning Item': '学习条目',
  'Log Metric': '记录指标',
  'Not Found': '未找到',
  Habit: '习惯',
  Goal: '目标',
  Task: '任务',
  Note: '笔记',
  Idea: '想法',
  Review: '复盘',
  Event: '事件',
  Metric: '指标',
  Person: '人物',
  Project: '项目',
  Security: '安全',
  Authentication: '认证',
  Configured: '已配置',
  'Using default': '使用默认值',
  Session: '会话',
  'Data & Export': '数据与导出',
  'Runtime Diagnostics': '运行诊断',
  System: '系统',
  'Current readiness': '当前状态',
  Ready: '就绪',
  Degraded: '降级',
  Blocked: '阻塞',
  OK: '正常',
  Warning: '警告',
  Error: '错误',
  'Backup guidance': '备份说明',
  'App version': '应用版本',
  Environment: '环境',
  Platform: '平台',
  Uptime: '运行时长',
  Database: '数据库',
  Attachments: '附件',
  'Data directory': '数据目录',
  Language: '语言',
  English: 'English',
  'Simplified Chinese': '简体中文',
  'Passphrase protection for your instance': '用口令保护你的实例',
  'Sessions expire after 7 days': '会话在 7 天后过期',
  'Your data is stored locally in a SQLite database. You own it completely. Export or back up at any time.':
    '你的数据保存在本地 SQLite 数据库中，完全由你掌控，可随时导出或备份。',
  'All core checks look healthy': '所有核心检查均正常',
  'Please enter a passphrase': '请输入口令',
  'Invalid passphrase': '口令无效',
  Passphrase: '口令',
  'Enter passphrase': '输入口令',
  Unlock: '解锁',
  'Enter your passphrase to continue': '输入口令以继续',
  'AUTH_SECRET is not configured': '未配置 AUTH_SECRET',
  'Set a strong passphrase in your .env file or environment variables. The default value is not secure.':
    '请在 `.env` 或环境变量中设置强口令，默认值并不安全。',
  'Set a strong AUTH_SECRET in your environment variables for production use.':
    '生产环境请在环境变量中设置强 `AUTH_SECRET`。',
  'Capture anything... task, note, idea, journal, metric, or person':
    '快速记录任何内容... 任务、笔记、想法、日志、指标或人物',
  'Offline capture mode': '离线记录模式',
  'Syncing queue': '正在同步队列',
  'Sync now': '立即同步',
  'Parsing capture…': '正在解析记录…',
  'Queue offline': '离线排队',
  'Direct create': '直接创建',
  'Queue for Inbox': '排队到收件箱',
  'Create Task': '创建任务',
  'Create Note': '创建笔记',
  'Create Idea': '创建想法',
  'Create Journal': '创建日志',
  'Create Entity': '创建人物',
  'Send to Inbox': '发送到收件箱',
  'Inbox instead': '改存到收件箱',
  'This capture will be queued locally and synced once the app reconnects.':
    '这条记录会先保存在本地，应用重新联网后会自动同步。',
  'Saving…': '保存中…',
  'No tasks': '暂无任务',
  'Task title...': '任务标题...',
  'Add task': '添加任务',
  'No notes yet.': '还没有笔记。',
  'Create your first note to get started.': '创建第一条笔记开始使用。',
  'No ideas yet': '还没有想法',
  'Capture your first idea — seeds grow into projects.': '记录你的第一个想法，种子会长成项目。',
  'No journal entries yet.': '还没有日志条目。',
  'Write your first entry above.': '在上方写下你的第一条记录。',
  'Inbox zero! 🎉': '收件箱清空了！🎉',
  'Capture something with the bar above.': '使用上方输入框记录一些内容。',
  'New Note': '新建笔记',
  'Note title': '笔记标题',
  'Start writing... (markdown supported)': '开始写作...（支持 Markdown）',
  'Creating...': '创建中...',
  'New Idea': '新建想法',
  'Idea title': '想法标题',
  'Quick summary (one-liner)': '一句话总结',
  'Theme (optional)': '主题（可选）',
  'Capture Idea': '记录想法',
  'Capturing...': '记录中...',
  'What\'s on your mind? Write a journal entry...': '在想什么？写一条日志吧...',
  'Write freely... Use markdown if you like.': '自由书写吧，支持 Markdown。',
  'Save Entry': '保存条目',
  'Saving...': '保存中...',
  'Life Signals': '生活信号',
  'View all →': '查看全部 →',
  'Full log →': '完整记录 →',
  Sleep: '睡眠',
  hours: '小时',
  'Select...': '请选择...',
  'Saved!': '已保存！',
  'Log Signals': '记录信号',
  'No active habits': '暂无活跃习惯',
  Entity: '人物',
  'Set up habits →': '设置习惯 →',
  'Write in journal →': '写日志 →',
  Mood: '心情',
  Energy: '精力',
  words: '字',
  'Select all': '全选',
  'Clear all': '清空选择',
  'Apply suggested': '应用建议',
  'As task': '转为任务',
  'As note': '转为笔记',
  Dismiss: '忽略',
  'Select items to triage in bulk': '选择条目以批量处理',
  suggested: '建议类型',
  'Apply suggested type': '应用建议类型',
  'Convert to task': '转换为任务',
  'Convert to note': '转换为笔记',
  'No attachments yet': '还没有附件',
  Searchable: '可搜索',
  'Optional note or caption': '可选备注或说明',
  Archive: '归档',
  Save: '保存',
  Cancel: '取消',
  'Not set': '未设置',
  Tag: '标签',
  'Tag name...': '标签名...',
  Planning: '规划中',
  Active: '进行中',
  Paused: '暂停',
  Completed: '已完成',
  Cancelled: '已取消',
  Achieved: '已达成',
  Abandoned: '已放弃',
  'To Do': '待办',
  'In Progress': '进行中',
  Done: '已完成',
  'On Track': '进展正常',
  'At Risk': '存在风险',
  'Off Track': '偏离目标',
  Quarterly: '季度',
  Yearly: '年度',
  'Multi-Year': '多年',
  Daily: '日常',
  Reflection: '反思',
  Gratitude: '感恩',
  Freeform: '自由记录',
  'Evening Review': '晚间复盘',
  Reference: '参考',
  Meeting: '会议',
  Snippet: '摘录',
  Evergreen: '常青',
  '🌱 Seed': '🌱 种子',
  '🌿 Developing': '🌿 孵化中',
  '🌳 Mature': '🌳 成熟',
  '✅ Implemented': '✅ 已实现',
  '📦 Archived': '📦 已归档',
  'To Read': '待读',
  Reading: '阅读中',
  Read: '已读',
  Planned: '已计划',
  'Good morning': '早上好',
  'Good afternoon': '下午好',
  'Good evening': '晚上好',
  'Tasks today': '今日任务',
  'Habits done': '习惯完成',
  'In inbox': '收件箱中',
  'Welcome to lifeOS': '欢迎使用 lifeOS',
  'Start by creating your first task, habit, or journal entry. The more you use lifeOS, the richer your insights become.':
    '先创建你的第一个任务、习惯或日志条目。使用越多，洞察越丰富。',
  'Add a task →': '添加任务 →',
  'Add a habit →': '添加习惯 →',
  'Write a journal →': '写日志 →',
  'All clear! Add a task to get started.': '现在很清爽，添加一个任务开始吧。',
  'No search results': '没有搜索结果',
  Searching: '搜索中',
  'Search across tasks, notes, journal entries, projects, goals, reviews, events, metrics, entities, and linked attachments.':
    '跨任务、笔记、日志、项目、目标、复盘、事件、指标、人物和关联附件进行搜索。',
  'Search tasks, notes, reviews, events, projects, goals, and attached files...':
    '搜索任务、笔记、复盘、事件、项目、目标和附件文件...',
  'You\'re offline': '当前离线',
  'Open Today': '打开今天',
  'Open Inbox': '打开收件箱',
  'Go to Today': '前往今天',
};

export function normalizeLocale(value?: string | null): AppLocale {
  if (!value) return DEFAULT_LOCALE;
  if (value.toLowerCase().startsWith('zh')) return 'zh-CN';
  return 'en';
}

export function toIntlLocale(locale: AppLocale): string {
  return locale === 'zh-CN' ? 'zh-CN' : 'en-US';
}

export function translateText(text: string, locale: AppLocale): string {
  if (locale === 'en') return text;
  return ZH_TRANSLATIONS[text] ?? text;
}

export function formatNumber(value: number, locale: AppLocale): string {
  return new Intl.NumberFormat(toIntlLocale(locale)).format(value);
}

export function formatDateTime(
  value: string | number | Date,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Date(value).toLocaleString(toIntlLocale(locale), options);
}

export function formatReadableDate(timestamp: number, locale: AppLocale): string {
  return new Date(timestamp).toLocaleDateString(toIntlLocale(locale), {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatReadableISODate(isoDate: string, locale: AppLocale): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(toIntlLocale(locale), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeDayLabel(isoDate: string, locale: AppLocale): string {
  const today = new Date().toISOString().split('T')[0];
  if (isoDate === today) return translateText('Today', locale);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (isoDate === yesterday.toISOString().split('T')[0]) {
    return translateText('Yesterday', locale);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (isoDate === tomorrow.toISOString().split('T')[0]) {
    return translateText('Tomorrow', locale);
  }

  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(toIntlLocale(locale), {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatActiveCount(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN' ? `${value} 个进行中` : `${value} active`;
}

export function formatPendingCount(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN' ? `${value} 待处理` : `${value} pending`;
}

export function formatEntryCount(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN' ? `${value} 条记录` : `${value} entries`;
}

export function formatQueuedCount(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN' ? `${value} 条待同步` : `${value} queued for sync`;
}

export function formatSelectedCount(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN' ? `已选择 ${value} 项` : `${value} selected`;
}

export function formatCreatedItems(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN'
    ? `已创建 ${value} 项。`
    : `Created ${value} item${count === 1 ? '' : 's'}.`;
}

export function formatDismissedItems(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN'
    ? `已忽略 ${value} 项。`
    : `Dismissed ${value} item${count === 1 ? '' : 's'}.`;
}

export function formatTotalRecords(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN' ? `共 ${value} 条记录` : `${value} total records`;
}

export function formatReviewsGenerated(locale: AppLocale, count: number): string {
  const value = formatNumber(count, locale);
  return locale === 'zh-CN'
    ? `已生成 ${value} 条复盘`
    : `${value} review${count === 1 ? '' : 's'} generated`;
}

export function formatQueuedPrimaryLabel(
  locale: AppLocale,
  label: string,
  offline: boolean,
  directCreateSupported: boolean
): string {
  if (locale === 'en') {
    if (offline) {
      return directCreateSupported ? `Queue ${label}` : 'Queue for Inbox';
    }
    return directCreateSupported ? `Create ${label}` : 'Send to Inbox';
  }

  if (offline) {
    return directCreateSupported ? `排队创建${label}` : '排队到收件箱';
  }

  return directCreateSupported ? `创建${label}` : '发送到收件箱';
}
