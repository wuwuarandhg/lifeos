# Components 层详细文档

> React 组件库 - 位于 `src/components/`

## 组件索引

### 布局组件 (Layout)

| 组件 | 路径 | 说明 |
|------|------|------|
| **sidebar.tsx** | `layout/sidebar.tsx` | 侧边导航栏 (39 个路由) |

### 详情组件 (Detail)

| 组件 | 路径 | 说明 |
|------|------|------|
| **detail-page-shell.tsx** | `detail/detail-page-shell.tsx` | 详情页容器 |
| **editable-field.tsx** | `detail/editable-field.tsx` | 可编辑字段 |
| **status-badge.tsx** | `detail/status-badge.tsx` | 状态徽章 |
| **tags-pills.tsx** | `detail/tags-pills.tsx` | 标签药丸 |
| **progress-bar.tsx** | `detail/progress-bar.tsx` | 进度条 |
| **relations-panel.tsx** | `detail/relations-panel.tsx` | 关联面板 |
| **attachments-panel.tsx** | `detail/attachments-panel.tsx` | 附件面板 |

### 任务组件 (Tasks)

| 组件 | 路径 | 说明 |
|------|------|------|
| **task-list.tsx** | `tasks/task-list.tsx` | 任务列表 |

### 习惯组件 (Habits)

| 组件 | 路径 | 说明 |
|------|------|------|
| **habit-checklist.tsx** | `habits/habit-checklist.tsx` | 习惯打卡 |
| **create-habit-form.tsx** | `habits/create-habit-form.tsx` | 创建习惯表单 |

### 日记组件 (Journal)

| 组件 | 路径 | 说明 |
|------|------|------|
| **journal-entry-card.tsx** | `journal/journal-entry-card.tsx` | 日记卡片 |
| **quick-journal-form.tsx** | `journal/quick-journal-form.tsx` | 快速日记 |

### 捕获组件 (Capture)

| 组件 | 路径 | 说明 |
|------|------|------|
| **quick-capture.tsx** | `capture/quick-capture.tsx` | 全局快速捕获 |

### 收集箱组件 (Inbox)

| 组件 | 路径 | 说明 |
|------|------|------|
| **inbox-item-list.tsx** | `inbox/inbox-item-list.tsx` | 收集箱列表 |

### 指标组件 (Metrics)

| 组件 | 路径 | 说明 |
|------|------|------|
| **metric-quick-log.tsx** | `metrics/metric-quick-log.tsx` | 快速记录指标 |

### 创建设组件 (Create Buttons)

| 组件 | 路径 | 说明 |
|------|------|------|
| **create-note-button.tsx** | `notes/create-note-button.tsx` | 创建笔记 |
| **create-idea-button.tsx** | `ideas/create-idea-button.tsx` | 创建想法 |
| **create-person-button.tsx** | `people/create-person-button.tsx` | 创建人物 |
| **create-learning-button.tsx** | `learning/create-learning-button.tsx` | 创建学习资源 |

### 设置组件 (Settings)

| 组件 | 路径 | 说明 |
|------|------|------|
| **language-switcher.tsx** | `settings/language-switcher.tsx` | 语言切换 |

### PWA 组件

| 组件 | 路径 | 说明 |
|------|------|------|
| **pwa-provider.tsx** | `pwa/pwa-provider.tsx` | PWA 离线支持 |

## 组件模式

### 列表组件
```typescript
// 标准列表结构
export function XxxList({ items, onUpdate, onDelete }: XxxListProps) {
  return (
    <div>
      {items.map(item => (
        <XxxItem key={item.id} item={item} ... />
      ))}
    </div>
  )
}
```

### 创建组件
```typescript
// Modal 或内联表单
export function CreateXxxButton() {
  const [open, setOpen] = useState(false)
  // 使用 Server Action 提交
}
```

### 详情页壳
```typescript
// 详情页通用容器
export function DetailPageShell({
  title,
  children,
  actions,
  tags,
  relations,
}: DetailPageShellProps) {
  // 统一布局：标题区、操作区、内容区、侧边栏
}
```

## 状态管理

- `useMode()` - Quick/Deep 模式切换 (`stores/mode-store.tsx`)
- `useLocale()` - i18n 语言切换 (`stores/locale-store.tsx`)

## 推荐下一步
- [ ] 查看 sidebar 的完整导航结构
- [ ] 了解 detail-page-shell 的 Props 定义
- [ ] 查看快速捕获的工作机制