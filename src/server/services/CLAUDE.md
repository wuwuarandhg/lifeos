# Services 层详细文档

> 业务逻辑层 - 位于 `src/server/services/`

## 服务索引

### 领域服务 (Domain Services)

| 服务 | 路径 | 说明 |
|------|------|------|
| **tasks.ts** | `tasks.ts` | 任务 CRUD、状态流转、重复任务 |
| **habits.ts** | `habits.ts` | 习惯创建、streak 计算、完成记录 |
| **journal.ts** | `journal.ts` | 日记条目、mood/energy 追踪 |
| **notes.ts** | `notes.ts` | 笔记 CRUD、collection 分类 |
| **ideas.ts** | `ideas.ts` | 想法 pipeline (seed→developing→mature) |
| **projects.ts** | `projects.ts` | 项目管理、状态、进度 |
| **goals.ts** | `goals.ts` | 目标管理、里程碑 |
| **milestones.ts** | `milestones.ts` | 目标/项目里程碑 |
| **events.ts** | `events.ts` | 时间线事件、重要时刻 |
| **metrics.ts** | `metrics.ts` | 健康指标 (sleep, mood, energy, workout) |
| **reviews.ts** | `reviews.ts` | 周/月/年度回顾生成 |
| **inbox.ts** | `inbox.ts` | 收集箱、待分类条目 |

### 数据服务 (Data Services)

| 服务 | 路径 | 说明 |
|------|------|------|
| **attachments.ts** | `attachments.ts` | 文件上传、存储、提取 |
| **attachment-queries.ts** | `attachment-queries.ts` | 附件关联查询 |
| **attachment-content.ts** | `attachment-content.ts` | 内容提取 (PDF, 文本) |
| **imports.ts** | `imports.ts` | 数据导入 (Todoist, Notion, Obsidian, Day One) |
| **export.ts** | `export.ts` | JSON 导出、数据库备份 |
| **aggregation.ts** | `aggregation.ts` | 跨域数据聚合 |

### 核心服务 (Core Services)

| 服务 | 路径 | 说明 |
|------|------|------|
| **auth.ts** | `auth.ts` | 密码认证、会话管理 |
| **capture.ts** | `capture.ts` | 快速捕获、路径解析 |
| **capture-paths.ts** | `capture-paths.ts` | 捕获路径映射 |
| **runtime.ts** | `runtime.ts` | 运行时初始化、数据库检查 |
| **scheduler.ts** | `scheduler.ts` | 定时任务调度 (node-cron) |
| **templates.ts** | `templates.ts` | 模板管理 |

### 跨域服务 (Cross-Cutting Services)

| 服务 | 路径 | 说明 |
|------|------|------|
| **tags.ts** | `tags.ts` | 标签管理、全局标签 |
| **relations.ts** | `relations.ts` | 跨域关联 (belongs_to, mentions, supports...) |
| **graph.ts** | `graph.ts` | 知识图谱、连接可视化 |
| **graph-helpers.ts** | `graph-helpers.ts` | 图谱辅助函数 |
| **connections.ts** | `connections.ts` | 实体关联 |
| **entities.ts** | `entities.ts` | 人物、书籍、课程等实体 |
| **gamification.ts** | `gamification.ts` | XP、等级、成就系统 |
| **search.ts** | `search.ts` | SQLite FTS5 全文搜索 |
| **timeline.ts** | `timeline.ts` | 时间线聚合 |
| **insights.ts** | `insights.ts` | 数据分析、模式识别 |
| **progress.ts** | `progress.ts` | 目标/项目进度重算 |

### 系统服务 (System Services)

| 服务 | 路径 | 说明 |
|------|------|------|
| **system.ts** | `system.ts` | 系统设置、键值存储 |

## 服务模式

### CRUD 模式
```typescript
// 大多数服务遵循此模式
export function createXxx(input: CreateXxxInput) { ... }
export function getXxx(id: string) { ... }
export function updateXxx(input: UpdateXxxInput) { ... }
export function deleteXxx(id: string) { ... }
export function listXxx(filters?: ListXxxFilters) { ... }
```

### 接口约定
- `CreateXxxInput` - 创建输入
- `UpdateXxxInput` - 更新输入 (继承 Partial<CreateXxxInput>)
- `ListXxxFilters` - 查询过滤器

## 关键依赖

### 数据库
- `db` from `./db` - Drizzle 实例
- `tables` from `./db/schema` - 表定义

### 工具库
- `newId()` - ULID 生成
- `now()` - 当前时间戳 (ms)
- `todayISO()` - 今日 ISO 日期

### 跨服务调用
- `syncSearchDocument()` - 搜索同步
- `recalculateGoalProgress()` - 进度重算

## 推荐下一步
- [ ] 查看具体服务的函数签名
- [ ] 了解 relations 图谱关系类型
- [ ] 查看 imports 支持的导入格式