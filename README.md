# AI Coding PaaS

多角色 AI 软件交付编排系统：把自然语言需求走成可追踪的流水线（需求 → 设计 → 开发 → 测试 → 运维 → 优化），由 **Dashboard + API** 驱动，核心执行在 **`sprint-agent-executor.js`**（OpenCode CLI）。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Version](https://img.shields.io/badge/Version-1.0.0-red.svg)](package.json)

---

## 目录

- [一分钟上手](#一分钟上手)
- [系统做什么](#系统做什么)
- [架构一览](#架构一览)
- [Sprint 与数据落在哪里](#sprint-与数据落在哪里)
- [Dashboard 怎么用](#dashboard-怎么用)
- [代码开发：tasks 与落盘](#代码开发tasks-与落盘)
- [OpenSpec 与 Developer](#openspec-与-developer)
- [预览与调试](#预览与调试)
- [Figma OAuth 无 PAT 对接](#figma-oauth-无-pat-对接)
- [Vibe Coding（简单覆盖）](#vibe-coding简单覆盖)
- [API 摘要](#api-摘要)
- [环境变量（常用）](#环境变量常用)
- [CLI 与执行器](#cli-与执行器)
- [扩展与贡献](#扩展与贡献)
- [故障排除](#故障排除)
- [License](#license)

---

## 一分钟上手

```bash
cd DevForge
./start.sh
```

- **Dashboard**：`http://<本机或局域网 IP>:5173`
- **API / WebSocket**：`http://<本机或局域网 IP>:3000`（Socket 同源）

分步启动：`npm run api`（API） + `npm run web`（前端）。停止：`./stop.sh`，重启：`./restart.sh`。

默认登录：`admin` / `admin`（可用 `ADMIN_USER`、`ADMIN_PASSWORD` 覆盖）。

**依赖**：Node.js **≥ 20**、全局 `opencode`；OpenSpec CLI、gstack、Superpowers 等为增强能力，按团队需要安装（详见下文）。

---

## 系统做什么

| 能力 | 说明 |
|------|------|
| 多角色流水线 | 产品、技术教练、架构师、开发、测试、运维等按场景顺序执行 |
| 可观测 | 迭代输出、workspace 产物、部分阶段思考过程可查看 |
| Sprint 为主 | Dashboard 主路径是 **Sprint**；旧版 **Pipeline** 仍兼容 |
| OpenSpec | 架构产出 `proposal/design/tasks` 等，驱动开发任务拆解 |

场景路由定义在 [`config/pipelineConfig.js`](config/pipelineConfig.js) 的 `ROUTES`（如 `BUILD`、`CRITICAL`、`REVIEW` 等）。

---

## 架构一览

```text
用户 / Dashboard
      │
      ▼
Express API (dashboard/server/server.js) + Socket.IO
      │
      ├─ 项目 / Sprint / 迭代状态（JSON 持久化）
      │
      └─ spawn → sprint-agent-executor.js（单角色或单步）
                    │
                    └─ OpenCode CLI → 模型输出 → 解析落盘 / 回写 API
```

**Harness**（`harness/`）：API 侧的缓存、进程池与统计；与 `sprint-agent-executor` 并存，实际对话与 workspace 写入仍以 executor 子进程为准。观测：`GET /api/harness/stats`、`GET /api/harness/health`。

更细的团队角色说明见 [`AGENTS.md`](AGENTS.md) / [`CLAUDE.md`](CLAUDE.md)（与本文档互补，不必重复粘贴大段表格）。

---

## Sprint 与数据落在哪里

| 位置 | 内容 |
|------|------|
| `workspace/<sprintId>/` | 本次冲刺的过程与产出：`product/`、`architect/`、`output/`、`thinking/` 等 |
| `projects/<projectId>/` | 长期项目：`openspec/changes/...`、`src/`（默认代码树）等 |

**代码写到哪里**：若 Sprint 配置了 `localProjectPath`，Developer 优先写入该路径；否则写入 `projects/<projectId>/src/`（常见为 `src/frontend`、`src/backend` 或 `frontend` / `backend`，以任务与项目结构为准）。

---

## Dashboard 怎么用

1. 登录 → 创建 **项目** → 创建 **Sprint**（填写 `rawInput`，选择 **scenario**）。
2. 在流程节点中选中阶段 → **执行当前阶段**：每次只跑当前阶段内、流水线顺序上的**下一个未完成角色**（同一节点内多角色时，通常需**多次点击**，例如技术教练完成后再点一次跑架构师）。
3. 需要补充说明时，在「用户输入」中填写后确认执行；或对已产出不满意，用 **「提意见并重新生成」**（统一入口，内部会写入输入并按需 rerun）。
4. **代码开发**阶段可使用 **前端/后端预览** 与 **后端 API 控制台**（见下节）。

---

## 代码开发：tasks 与落盘

- **任务来源**：以 OpenSpec 的 **`tasks.md`** 为主清单，按自上而下顺序分批执行（每批最多 10 条等，由 executor 步骤划分）。
- **落盘方式**：模型需输出 ` ```file:相对路径` 代码块，由执行器解析并写入 **允许的工程目录**（默认 `backend/`、`frontend/` 等，受 `project.json` 的 `codegen` 约束时可收紧）。
- **门禁**：可对「无文件块 / 未写入 / 高风险缺测试」等做强校验（环境变量可调，详见 [`sprint-agent-executor.js`](sprint-agent-executor.js) 内注释与仓库内环境说明）。
- **界面布局**：产品阶段会生成 `workspace/<sprintId>/product/ui-layout.md`；开发提示词会要求对齐该文件；执行后有一次 **轻量 UI 布局对齐检查**（结果写入 `workspace/<sprintId>/output/ui-layout-check.md`，并在 Dashboard 开发区显示「布局对齐」状态）。

---

## Figma OAuth 无 PAT 对接

在 **需求分析** 阶段，Dashboard 提供「**Figma 设计稿同步**」：调用 `POST /api/sprints/:sprintId/figma/sync`，将文件或选中节点同步到 `workspace/<sprintId>/product/figma-spec.md`，并在 `product/ui-layout.md` 顶部写入可重复的引用块（`<!-- devforge:figma-sync -->`）。

### 背景

- 目标：在本地或服务端实现 **无需 PAT** 的 Figma 同步，写入 `figma-spec.md` 并回写 `ui-layout.md` 引用块。
- 方案：优先使用 **OAuth 2**（浏览器授权一次，后续服务端用 refresh 换 access）；兼容 PAT 作为回退。
- 说明：PAT 创建入口在浏览器 Figma 账号设置中，与是否安装桌面 App 无关。

### 鉴权方案（二选一，服务端调用 Figma REST）

1. **OAuth 2（推荐，无需 PAT）**  
   - 在 [figma.com/developers/apps](https://www.figma.com/developers/apps) **创建 OAuth App**（可先用 Draft / Private 在团队内测）。  
   - 在 App 的 **Redirect URLs** 中添加与下文 **完全一致** 的回调地址（例如 `http://127.0.0.1:3000/api/figma/oauth/callback`）。  
   - 在 **OAuth scopes** 中勾选 **`file_content:read`**（读文件节点，与当前同步逻辑一致）。  
   - 发布为 **Private**（或按团队要求 Public 并过审）。  
   - API 进程环境变量：`FIGMA_CLIENT_ID`、`FIGMA_CLIENT_SECRET`；可选 `FIGMA_OAUTH_REDIRECT_URI`（未设则用 `API_BASE + /api/figma/oauth/callback`，故 **`API_BASE` 应对浏览器可访问**，勿写 `0.0.0.0` 若 OAuth 回调需本机外网访问请用局域网 IP 或域名）。  
   - Dashboard 需求阶段点 **「连接 Figma（浏览器 OAuth）」**，浏览器授权后 refresh token 会加密写入本机 **`~/.config/devforge/figma-oauth.json`**（可用 `FIGMA_OAUTH_STORE_PATH` 覆盖路径）。  
   - 相关 API：`GET /api/figma/oauth/status`、`GET /api/figma/oauth/start`、`GET /api/figma/oauth/callback`、`DELETE /api/figma/oauth/session`。

2. **Personal Access Token（兼容）**  
   - PAT 在浏览器 **Figma → Settings → Security** 中创建，**与是否安装桌面 App 无关**。  
   - 环境变量：`FIGMA_TOKEN`。若 **已完成 OAuth 且本机存有 refresh**，同步时 **优先走 OAuth**；否则使用 PAT。

### 同步触发（Dashboard / CLI）

- **请求体（JSON）**：`figmaUrl`（推荐）、`fileKey`、`nodeIds`（可选 `FIGMA_FILE_KEY` / `FIGMA_NODE_IDS` 默认）。  
- **CLI**：`node scripts/figma-sync.mjs --sprint <sprintId> ...`（支持 PAT 或本机已 OAuth 写入的 `figma-oauth.json` + `FIGMA_CLIENT_ID`/`SECRET`）。

产品 / 开发 / 测试的提示词会要求 **显式读取** `figma-spec.md`（若存在）并与 `ui-layout.md` 交叉对齐。

### 最小可用配置（本地）

```bash
# OAuth 推荐
export FIGMA_CLIENT_ID="xxx"
export FIGMA_CLIENT_SECRET="xxx"
# 可选：明确回调地址（需和 Figma App Redirect 完全一致）
export FIGMA_OAUTH_REDIRECT_URI="http://127.0.0.1:3000/api/figma/oauth/callback"

# 可选：默认同步目标
export FIGMA_FILE_KEY="abc123"
export FIGMA_NODE_IDS="1:2,3:4"
```

然后在 Dashboard 需求阶段点击「连接 Figma（浏览器 OAuth）」完成授权，再点「同步到 workspace」。

---

## Vibe Coding（简单覆盖）

重新执行 Developer 等代码生成步骤时，**约定生成目录可被覆盖**；系统**不**自动合并你在生成路径上的手写改动。

- **建议**：在重跑前用 **git 分支** 或提交保存你的「vibe」修改；需要时再将提交 cherry-pick 回主线。
- **长期手写资产**（可选约定）：放在独立目录（例如仓库根的 `overrides/` 或 `src/**/human/`），避免与生成物混在同一批默认覆盖路径中。

---

## OpenSpec 与 Developer

| Artifact | 作用 |
|----------|------|
| `proposal.md` | 变更背景与范围 |
| `design.md` | 技术设计与接口约定 |
| `tasks.md` | **开发执行清单**（Developer 核心输入） |

Developer 典型顺序：**先读 `tasks.md` → 参考 `design.md` / `proposal.md` → 按批次实现并落盘**。OpenSpec CLI 可选；不可用时由流程降级为目录与文件约定（仍以 `tasks.md` 为准）。

---

## 预览与调试

在 **代码开发** 阶段，Dashboard 提供：

- **前端预览**：`POST /api/sprints/:id/preview/start`，body 可选 `{ "target": "frontend" }`（默认即前端）；`GET .../preview/meta`、`GET .../preview/status`；`POST .../preview/stop`，body 可选 `{ "target": "frontend" | "backend" | "all" }`。
- **后端预览**：同上，`target: "backend"`。
- **API 控制台**：`POST /api/sprints/:id/preview/api/request`，由服务端转发到本机已启动的后端预览端口（需先启动后端预览）。

探测逻辑见 [`dashboard/server/preview-target.js`](dashboard/server/preview-target.js)。

---

## API 摘要

**Sprint（主路径）**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/PUT/DELETE | `/api/sprints/:id` | 冲刺读写 |
| POST | `/api/sprints/:id/start` | 启动冲刺 |
| PUT | `/api/sprints/:id/iterations/:roleIndex/input` | 用户输入 |
| POST | `/api/sprints/:id/iterations/:roleIndex/execute` | 执行该迭代 |
| POST | `/api/sprints/:id/iterations/:roleIndex/rerun` | 重跑 |
| PUT | `/api/sprints/:id/iterations/:roleIndex/confirm` | 确认输出 |

**预览**（节选，完整实现见 [`dashboard/server/server.js`](dashboard/server/server.js)）

| 方法 | 路径 |
|------|------|
| GET | `/api/sprints/:sprintId/preview/meta` |
| GET | `/api/sprints/:sprintId/preview/status` |
| POST | `/api/sprints/:sprintId/preview/start` |
| POST | `/api/sprints/:sprintId/preview/stop` |
| POST | `/api/sprints/:sprintId/preview/api/request` |

**Figma**

| 方法 | 路径 |
|------|------|
| GET | `/api/figma/oauth/status` |
| GET | `/api/figma/oauth/start` |
| GET | `/api/figma/oauth/callback` |
| DELETE | `/api/figma/oauth/session` |
| POST | `/api/sprints/:sprintId/figma/sync` |

**其它**：`/api/projects/*`、`/api/local-project/*`、`/api/config/models`、`/api/harness/stats` 等。

WebSocket：客户端 `subscribe` 后接收 `iteration:*`、`preview:updated` 等事件。

---

## 环境变量（常用）

| 变量 | 说明 |
|------|------|
| `PORT` / `HOST` | API 监听（默认 `3000` / `0.0.0.0`） |
| `API_BASE` | 执行器回写 API 的基地址 |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Dashboard 登录 |
| `MAX_CONCURRENT_SPRINT_EXECUTORS` | 并发执行上限 |
| `DEVFORGE_*_SKILLS` | 各技能根目录（见 `config/skillPaths.js`） |
| `STRICT_FILE_BLOCK_GATE` 等 | Developer 落盘与验证门禁 |
| `FIGMA_TOKEN` | 可选：Figma PAT；无 OAuth refresh 时使用 |
| `FIGMA_CLIENT_ID` / `FIGMA_CLIENT_SECRET` | OAuth App；与浏览器授权配合使用 |
| `FIGMA_OAUTH_REDIRECT_URI` | 可选：OAuth 回调完整 URL（须与 Figma App 中 Redirect 一致） |
| `FIGMA_OAUTH_STORE_PATH` | 可选：refresh 加密文件路径（默认 `~/.config/devforge/figma-oauth.json`） |
| `FIGMA_OAUTH_SUCCESS_REDIRECT` / `FIGMA_OAUTH_FAILURE_REDIRECT` | 可选：OAuth 结束后的浏览器跳转基地址（默认 `http://127.0.0.1:5173`） |
| `FIGMA_FILE_KEY` / `FIGMA_NODE_IDS` | 可选默认文件 key / 限定同步节点 |

完整列表以代码与部署环境为准。

---

## CLI 与执行器

| 命令 / 文件 | 用途 |
|-------------|------|
| `./start.sh` | 一键启动 API + Dashboard |
| `npm run api` / `npm run web` | 分别启动 |
| `npm run orchestrator` | 交互式 CLI 编排 |
| [`sprint-agent-executor.js`](sprint-agent-executor.js) | **推荐**：Dashboard Sprint 执行 |
| [`scripts/figma-sync.mjs`](scripts/figma-sync.mjs) | 将 Figma 写入 `workspace/.../product/figma-spec.md` |
| [`agent-runner.js`](agent-runner.js) | 轮询 / 批量 Pipeline |
| [`ai-agent-executor.js`](ai-agent-executor.js) | 分步调试 |

可选安装：

```bash
npm install -g opencode
npm install -g @fission-ai/openspec@latest
```

---

## 扩展与贡献

1. 角色与步骤：[`agents/definitions.json`](agents/definitions.json)、[`agents/*.md`](agents/)
2. 路由与场景：[`config/pipelineConfig.js`](config/pipelineConfig.js)
3. Skill 路径：[`config/skillPaths.js`](config/skillPaths.js)
4. 模型：[`model-config.json`](model-config.json) 或 Dashboard 配置 API

提交 PR 前请保持 **API / 行为变更与 README 同步**。

---

## 故障排除

| 现象 | 处理 |
|------|------|
| 端口 3000 / 5173 占用 | `./stop.sh` 或改 `PORT` / 换 Vite 端口 |
| Agent 无输出 | 检查 OpenCode 与 API Key；看 API 与 executor 日志 |
| 界面有输出但磁盘无代码 | 确认输出是否含 `file:` 块；确认 `localProjectPath` 是否指向预期目录 |
| 多角色同一节点只跑了一个 | 设计如此：再次「执行当前阶段」跑下一角色 |
| Skill 未找到 | 检查 `config/skillPaths.js` 与 `DEVFORGE_*_SKILLS` / `skills/vendor/` |

---

## License

MIT
