# Page Routes 详细文档

> 页面路由 - 位于 `src/app/`

## 路由总览

### 根路由

| 路由 | 文件 | 说明 |
|------|------|------|
| `/login` | `src/app/login/page.tsx` | 登录页 |
| `/offline` | `src/app/offline/page.tsx` | PWA 离线页 |

### (app) 路由组 (需要认证)

#### 📦 Today 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/` | `(app)/page.tsx` | → redirect `/today` |
| `/today` | `(app)/today/page.tsx` | 今日仪表板 |

#### 📥 Inbox 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/inbox` | `(app)/inbox/page.tsx` | 收集箱 |

#### ✓ Tasks 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/tasks` | `(app)/tasks/page.tsx` | 任务列表 |
| `/tasks/[id]` | `(app)/tasks/[id]/page.tsx` | 任务详情 |

#### 🔄 Habits 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/habits` | `(app)/habits/page.tsx` | 习惯列表 |
| `/habits/[id]` | `(app)/habits/[id]/page.tsx` | 习惯详情 |

#### 📓 Journal 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/journal` | `(app)/journal/page.tsx` | 日记列表 |
| `/journal/[id]` | `(app)/journal/[id]/page.tsx` | 日记详情 |

#### 📝 Notes 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/notes` | `(app)/notes/page.tsx` | 笔记列表 |
| `/notes/[id]` | `(app)/notes/[id]/page.tsx` | 笔记详情 |

#### 💡 Ideas 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/ideas` | `(app)/ideas/page.tsx` | 想法列表 |
| `/ideas/[id]` | `(app)/ideas/[id]/page.tsx` | 想法详情 |

#### 📊 Projects 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/projects` | `(app)/projects/page.tsx` | 项目列表 |
| `/projects/new` | `(app)/projects/new/page.tsx` | 新建项目 |
| `/projects/[id]` | `(app)/projects/[id]/page.tsx` | 项目详情 |

#### 🎯 Goals 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/goals` | `(app)/goals/page.tsx` | 目标列表 |
| `/goals/new` | `(app)/goals/new/page.tsx` | 新建目标 |
| `/goals/[id]` | `(app)/goals/[id]/page.tsx` | 目标详情 |

#### ❤️ Health 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/health` | `(app)/health/page.tsx` | 健康仪表板 |

#### 💰 Finance 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/finance` | `(app)/finance/page.tsx` | 财务追踪 |

#### 📚 Learning 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/learning` | `(app)/learning/page.tsx` | 学习资源 |
| `/learning/[id]` | `(app)/learning/[id]/page.tsx` | 学习资源详情 |

#### 👥 People 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/people` | `(app)/people/page.tsx` | 人际关系 |
| `/people/[id]` | `(app)/people/[id]/page.tsx` | 人物详情 |

#### 📈 Metrics 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/metrics` | `(app)/metrics/page.tsx` | 指标列表 |
| `/metrics/[id]` | `(app)/metrics/[id]/page.tsx` | 指标详情 |
| `/metrics/log` | `(app)/metrics/log/page.tsx` | 记录指标 |

#### 📊 Reviews 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/reviews` | `(app)/reviews/page.tsx` | 回顾列表 |
| `/reviews/[id]` | `(app)/reviews/[id]/page.tsx` | 回顾详情 |

#### 🔍 Search 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/search` | `(app)/search/page.tsx` | 全文搜索 |

#### 🕸 Graph 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/graph` | `(app)/graph/page.tsx` | 知识图谱 |

#### ⏱ Timeline 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/timeline` | `(app)/timeline/page.tsx` | 时间线 |

#### � events/[id] 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/events/[id]` | `(app)/events/[id]/page.tsx` | 事件详情 |

#### 📈 Insights 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/insights` | `(app)/insights/page.tsx` | 数据分析 |

#### 📥 Imports 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/imports` | `(app)/imports/page.tsx` | 数据导入 |

#### ⚙️ Settings 模块

| 路由 | 文件 | 说明 |
|------|------|------|
| `/settings` | `(app)/settings/page.tsx` | 设置页 |

## 路由结构

```
src/app/
├── login/page.tsx           # /login
├── offline/page.tsx         # /offline
├── (app)/               # 路由组 (需要认证)
│   ├── page.tsx          # / → redirect /today
│   ├── today/page.tsx   # /today
│   ├── inbox/...
│   ├── tasks/...
│   ├── habits/...
│   ├── journal/...
│   ├── notes/...
│   ├── ideas/...
│   ├── projects/...
│   ├── goals/...
│   ├── health/...
│   ├── finance/...
│   ├── learning/...
│   ├── people/...
│   ├── metrics/...
│   ├── reviews/...
│   ├── search/...
│   ├── graph/...
│   ├── timeline/...
│   ├── events/...
│   ├── insights/...
│   ├── imports/...
│   └── settings/...
```

## 页面模式

### 列表页
```typescript
// /xxx/page.tsx
export default function XxxPage() {
  // Server Component
  // 直接调用 service 获取数据
  const items = listXxx()
  return <XxxList items={items} />
}
```

### 详情页
```typescript
// /xxx/[id]/page.tsx
export default function XxxDetailPage({ params }) {
  const item = getXxx(params.id)
  return <DetailPageShell item={item} ... />
}
```

### 详情页 Client
```typescript
// /xxx/[id]/client.tsx
// 客户端交互组件
// 使用 useFormState 处理表单提交
```

## 布局层级

```
Root Layout (app/layout.tsx)
  ↓
  └─→ Auth Check
       ↓
       └─→ (app) Layout
            ↓
            ↓  → Sidebar
            ↓  → Today (默认)
            ↓  → Tasks
            ↓  → ...
```

## 推荐下一步
- [ ] 查看 Server Actions 路由
- [ ] 了解 API 路由结构