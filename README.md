# Moby Dick - AI 开发舰队

> 多角色 AI 软件开发团队系统 (基于 OMC + Superpowers)

## 快速开始

```bash
cd /Users/jialin.chen/WorkSpace/DevForge
./restart.sh
```

访问 http://localhost:5173

---

## 核心架构

```
用户请求 → Gatekeeper (路由决策)
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
  BA      Product    Architect
    ↓         ↓         ↓
  Scout   Developer   Tester    Ops
              ↓         ↓
           Creative   Evolver
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 编排层 | OpenCode CLI |
| Model | `opencode/big-pickle`, `opencode/gpt-5-nano` |
| Skills | Superpowers Skills + gstack Skills |
| 前端 | Vue 3 + Vite + Tailwind CSS |
| 后端 | Express.js + Socket.io |

---

## 角色定义

| 角色 | 图标 | 目标 | 输出 |
|------|------|------|------|
| **Gatekeeper** | 🚪 | 路由决策 | 路由决策 + Pipeline 配置 |
| **BA** | 📝 | 业务分析 | 业务分析报告 |
| **Product** | 📋 | 需求分析 | PRD (JSON) |
| **Architect** | 🏗️ | 架构设计 | OpenSpec (YAML) |
| **Scout** | 🔍 | 技术可行性 | 风险评估报告 |
| **Developer** | 💻 | 代码实现 | 前端/后端代码 |
| **Tester** | 🧪 | 功能+安全测试 | 测试报告 |
| **Ops** | ⚙️ | 部署配置 | Dockerfile/部署配置 |
| **Evolver** | 🔄 | 重构优化 | 重构建议报告 |
| **Ghost** | 👻 | 安全审计 | 安全报告 |
| **Creative** | 🎨 | 设计评审 | 评审意见 |

### 决策路由

| 路由 | 执行顺序 |
|------|----------|
| CRITICAL | product → architect → creative → developer → tester → evolver |
| BUILD | product → architect → scout → developer → tester → ops → evolver |
| REVIEW | creative → ghost → tester |
| QUERY | scout |
| SECURITY | ghost → architect |

---

## 场景化工作流

### Architect 场景

| 场景 | Skills 工作流 |
|------|---------------|
| 新系统架构设计 | OpenSpec → system-design → database-design |
| 现有系统优化 | tech-debt → architecture-review |
| 高并发改造 | event-driven → api-design |

### Developer 场景

| 场景 | Skills 工作流 |
|------|---------------|
| 日常功能开发 | api-design → TDD → document |
| 复杂 Bug 排查 | systematic-debugging → log-analyzer |
| 专项技术开发 | 脚手架 → unit-test-generator |

### Ops 场景

| 场景 | Skills 工作流 |
|------|---------------|
| 容器部署 | docker-helper → kubernetes |
| 多云部署 | azure-deploy → AWS/阿里云/火山云 |
| 日常运维 | ship → docker-compose |

---

## Skills 映射

### Superpowers Skills

| 角色 | Skill | 用途 |
|------|-------|------|
| BA | brainstorming | 业务分析 |
| Product | user-story, product-spec-kit, ui-ux-designer | 需求+设计 |
| Architect | system-design, database-design, plan-eng-review | 架构设计 |
| Developer | api-design, event-driven, test-driven-development | 开发+测试 |
| Tester | gstack/qa, browse, canary | 测试+监控 |
| Ops | ship, docker-helper, azure-deploy | 部署 |
| Evolver | retro, tech-debt | 重构 |
| Ghost | cso | 安全审计 |
| Creative | design-review | 设计评审 |

### gstack Skills

| Skill | 用途 |
|-------|------|
| /browse | 页面交互测试 |
| /qa | QA 测试→修复→验证 |
| /canary | 部署后健康检查 |
| /benchmark | 性能回归测试 |

---

## 输出文件规范

所有角色输出使用 **Markdown (.md)** 格式：

| 角色 | 输出文件 |
|------|---------|
| Product | `output/prd.md` |
| Architect | `output/openspec.md` |
| Scout | `output/scout-report.md` |
| Developer | `developer/README.md`, `developer/API.md` |
| Tester | `output/test-report.md`, `output/security-report.md` |
| Ops | `output/ops-config.md`, `output/Dockerfile` |
| Ghost | `output/security-report.md` |
| Creative | `output/design-review.md` |
| Evolver | `output/evolver-report.md` |

---

## API 端点

### 项目/冲刺

| 端点 | 方法 |
|------|------|
| /api/projects | POST/GET |
| /api/projects/:id | GET/PUT/DELETE |
| /api/projects/:p/sprints | POST/GET |
| /api/sprints/:id | GET/PUT |
| /api/sprints/:id/start | POST |

### 迭代

| 端点 | 方法 |
|------|------|
| /api/sprints/:id/iterations/:i/input | PUT |
| /api/sprints/:id/iterations/:i/output | PUT |
| /api/sprints/:id/iterations/:i/execute | POST |
| /api/sprints/:id/iterations/:i/confirm | PUT |
| /api/sprints/:id/iterations/:i/rerun | POST |

### WebSocket

| 事件 | 说明 |
|------|------|
| agent:progress | 执行进度 |
| agent:output | 输出推送 |
| iteration:confirmed | 确认完成 |

---

## 目录结构

```
DevForge/
├── sprint-agent-executor.js   # Agent 执行器
├── model-config.json          # 模型配置
├── restart.sh / stop.sh       # 启停脚本
│
├── dashboard/
│   ├── server/server.js       # API Server
│   └── src/
│       ├── App.vue
│       └── views/
│           ├── Login.vue
│           ├── ProjectList.vue
│           ├── ProjectDetail.vue
│           └── SprintDetail.vue
│
├── workspace/{sprintId}/
│   ├── output/                # 交付物
│   └── developer/             # 代码输出
│       ├── frontend/
│       └── backend/
│
└── agents/                    # Agent 定义
    ├── definitions.json
    ├── architect.md
    ├── developer.md
    └── ops.md
```

---

## 注意事项

1. **本地测试**: Tester 直接读取 `workspace/{sprintId}/developer/` 下的代码
2. **OpenSpec**: Architect → Developer 传递架构设计
3. **模型切换**: Dashboard 界面点击角色卡片切换

---

## License

MIT
