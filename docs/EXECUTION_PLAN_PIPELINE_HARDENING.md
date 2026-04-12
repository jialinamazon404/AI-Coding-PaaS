# 执行计划：管道硬化（验证 + 单任务行为 + TDD Skill + 可选约束）

## 设计初衷（与「不会漏」的对齐）

产品设想是三层闭环，**理论上**下游不应再「补需求」：

1. **需求分析**：把需求**定死**（范围、验收、非目标）。
2. **技术设计**：把已定需求变成**一份可执行计划**（OpenSpec design + tasks.md 等）。
3. **开发**：**只按计划**实现代码。

在此设想下，**「漏」只应来自两类问题**（而不是「开发没聪明」这一种叙事）：

- **上游未真正定死**：PRD/任务有歧义、checkbox 未覆盖某条验收、或 tasks 与 PRD **可追溯链路**断裂。
- **执行与计划脱节**：开发阶段未严格按 tasks 执行、无门禁证明「这条 task 对应的验收已满足」。

因此工程化重点应是：**强化层间契约**（需求→设计→任务→测试/验收 可追踪），而不是仅堆更多「落盘后跑命令」。上文中的硬化（verify、TDD skill、单 task 行为）是在**当前执行器**上的补丁；若三层产物质量与门禁到位，开发阶段应自然收敛为「按计划填空」。

---

**目标**：重跑 `sprint-agent-executor` / Dashboard 触发流程时，尽量少依赖手工改仓库；对齐 Superpowers **TDD** 能力；修复单 task 重跑时的链式步骤问题。

**范围**：主要改 [`sprint-agent-executor.js`](../sprint-agent-executor.js)；可选扩展 [`projects/<id>/project.json`](../projects/da50c380-bcb7-49ca-ab39-db632ad1e36a/project.json) 的 `codegen` 字段；补一段运维说明（本文件或 `README` 小节）。

**原则**：`codePath` 下同时可能存在 **`frontend/`**、**`backend/`** 或二者；硬化逻辑必须 **按栈探测、对称处理**，不能只假设「只有 npm 前端包」。

---

## 阶段 1：Per-task 注入 TDD Skill（Superpowers）

**现状**：[`runDeveloperPerTaskBatch`](../sprint-agent-executor.js) 内 `runOpenCode(..., { skillName: null })`，TDD 未参与每条 task。

**改动**：

- 环境变量 `DEVFORGE_DEVELOPER_TASK_SKILL` — 默认 `test-driven-development`；空 / `none` / `0` 则不注入（与现网一致）。
- `runOpenCode` 传入解析后的 `skillName`，遵守 `MAX_SKILL_INJECT_SIZE`。

**验收**：执行 developer task 时可见 Skill 注入日志（未超大时）。

---

## 阶段 2：落盘后验证（全栈：Node / JVM / Go 等）

**现状**：写入后无自动测试或构建校验。

**改动**：

### 2.1 探测「可验证根目录」

在 `projectDir`（一般为 `projects/<id>/src`）下，对 **存在的** 子树按优先级探测（仅当目录存在且匹配特征文件才参与）：

| 路径特征 | 建议命令（第一版） |
|-----------|-------------------|
| `frontend/package.json`（或 `backend/package.json`） | 有 `scripts.test` → `npm test`（或按 lockfile 选 `pnpm`/`yarn`）；否则有 `build` → `npm run build` |
| `backend/pom.xml` | `mvn -q test`（或 `mvn -q -DskipTests=false test`） |
| `backend/build.gradle` / `build.gradle.kts` | `./gradlew test`（若存在 wrapper）或文档说明需预先安装 Gradle |
| `backend/go.mod` | `go test ./...` |

实现上可拆为：`collectVerifyTargets(projectDir) -> [{ cwd, label, cmd }]`，再顺序执行。

### 2.2 与「本次写入」的关系（避免全栈每次都跑十分钟）

- **默认（推荐）**：根据 **本 task 实际写入的 `relPath` 前缀**（`frontend/` / `backend/`）只跑 **触及侧** 的验证；若两边都有写入则两边都跑。
- **可选**：`DEVFORGE_VERIFY_SCOPE=all_existing` — 对本 sprint 存在的 `frontend`+`backend` 包**全跑**（更重，适合 nightly / 发布前）。

### 2.3 依赖未就绪

- Node：无 `node_modules` → **warn** 并跳过或失败，由 `DEVFORGE_VERIFY_SKIP_NO_NODE_MODULES` 控制（默认 warn+skip，避免 CI 未 install 时误杀）。
- JVM：未下载依赖导致失败 → 与 Node 类似可 **strict/skip**；文档说明推荐先 `mvn -q -DskipTests dependency:go-offline` 或等价。

### 2.4 失败策略

- `DEVFORGE_VERIFY_ENABLED`（默认 `true`）
- `DEVFORGE_VERIFY_STRICT`（默认 `true`）：任一目标失败则 task 失败。
- `DEVFORGE_VERIFY_TIMEOUT_MS`（可按目标类型分别设上限，或先统一一个较大值给 `mvn test`）。
- 可选：stderr 摘要进入 **下一次** model retry（受 `DEVELOPER_TASK_MAX_RETRIES` 约束）。

### 2.5 `project.json` 覆盖（全栈显式配置）

当自动探测不够时（多模块 Maven、自定义脚本），支持在 `project.json` 增加可选字段，例如：

```json
"codegen": {
  "verify": [
    { "cwd": "frontend", "cmd": "npm test" },
    { "cwd": "backend", "cmd": "mvn test" }
  ]
}
```

若存在 `codegen.verify`：**优先按列表执行**（路径相对 `projectDir`），不再依赖自动探测；便于纯后端或单体仓库。

**验收**：

- 仅前端项目：写入 `frontend/` 后 `npm test` 行为与现计算器一致。
- 仅后端项目：写入 `backend/` 且为 Maven 时，`mvn test` 失败可使 task 失败。
- 全栈：同一 task 若同时写 `frontend/` 与 `backend/`，两侧验证均执行（或由 `verify` 显式列出）。

---

## 阶段 3：单任务模式不链式下一步 Developer 步骤

（与前一版相同，栈无关。）

- `role === 'developer'` 且 `DEVFORGE_DEVELOPER_SINGLE_TASK === 'true'` → **不递归** `runIteration` 下一步。
- 逃生阀：`DEVFORGE_DEVELOPER_SINGLE_TASK_CHAIN=1` 保留旧行为。

---

## 阶段 4（可选）：路径约束（前端 / 后端对称）

**目标**：避免模型写到不该写的栈，且 **不限于「禁 backend」**。

**方案 A（布尔，兼容旧讨论）**：

- `codegen.allowBackend: false` → 始终拒绝 `backend/...`
- `codegen.allowFrontend: false` → 始终拒绝 `frontend/...`（**后端-only 项目**）

**方案 B（更统一）**：

- `codegen.allowedRoots: ["frontend"]` 或 `["backend"]` 或 `["frontend","backend"]`  
  - 未列出的前缀一律拒绝。

与现有「未存在 `backend` 目录则拒绝创建」逻辑并存时：**manifest 优先**（例如明确要求 backend-only 时仍允许创建 `backend/`）。

**验收**：纯后端项目配置 `allowFrontend: false` 或 `allowedRoots: ["backend"]` 后，不会落盘 `frontend/`。

---

## 阶段 5：Prompt 短清单（栈感知、非替代验证）

- **默认**：2～4 行通用约束（file 块协议、单 task 范围、禁止越栈若 manifest 指定）。
- **可选**：根据本次写入前缀或 `project.json` 追加极短提示：
  - 触及 `frontend/`：Vue 接线、emit、错误状态（保持简短）
  - 触及 `backend/`：API/分层/测试类与包路径（保持简短）

避免写死成「只有 Vue」。

---

## 阶段 6：文档

- 环境变量表（含 `DEVFORGE_VERIFY_*`、`DEVFORGE_DEVELOPER_TASK_SKILL`、单 task 相关）。
- **全栈准备**：前端 `npm ci`；后端 Maven `mvn` 可用、必要时先拉依赖；`project.json` 中 `codegen.verify` 示例。

---

## 执行顺序建议

1. 阶段 3（行为修正）  
2. 阶段 1（TDD 注入）  
3. 阶段 2（验证：先实现「按写入前缀选目标 + Node + Maven」两种最常用路径，`project.json` 覆盖次之）  
4. 阶段 5（prompt）  
5. 阶段 4（可选 manifest）  
6. 阶段 6  

---

## 不在本次范围（可后续做）

- Gradle/Go 自动探测的细粒度与 monorepo 多模块  
- `node --check` / ESLint / Spotless  
- 末步全表 `tasks.md` gap LLM  
- Dashboard UI 暴露 env  

---

## 备选架构：Superpowers 技能链（与上文「执行器硬化」二选一或组合）

若认为「每条 task 落盘后跑 `mvn/npm test`」**笨重且总体变慢**，可在 OpenSpec 已产出 **design + tasks.md** 的前提下，改为更接近 **本地开发纪律** 的一条龙（均为 Superpowers skills）：

`brainstorming` → `using-git-worktrees` → `writing-plans` → `subagent-driven-development` → `test-driven-development` → `requesting-code-review` → `finishing-a-development-branch`

### 各自解决什么问题

| 环节 | 作用 | 与「漏功能」的关系 |
|------|------|-------------------|
| brainstorming | 澄清意图/风险（若前置已有 Product/OpenSpec，可能部分重复） | 减少**需求理解**漏项，不解决 tasks.md 本身漏写 |
| using-git-worktrees | 隔离分支/并行实验 | 减少**互相覆盖**与「半成品混进 main」 |
| writing-plans | 把 tasks 落成**可执行计划**（顺序、依赖、验收） | 补一层「计划是否覆盖 tasks」的检查点 |
| subagent-driven-development | 多子任务并行 | **提速**与关注点分离；需编排避免同一文件冲突 |
| test-driven-development | RED-GREEN-REFACTOR | 行为有测试锚点；**若测试不写全仍会漏** |
| requesting-code-review | 独立视角看 diff | 抓跨文件/边界问题，补「模型自嗨」 |
| finishing-a-development-branch | 合并/收尾决策 | 流程闭环，不直接等于功能完整 |

### 会不会就不漏了？

- **不会魔法式保证**。若 **OpenSpec tasks.md 或验收映射本身缺条**，任何链条都补不出来。
- **能显著降低的是**：实现与集成层面的漏（计划→TDD→评审→分支收尾），尤其是 **review** 和 **结构化计划** 对「只做了一半」更敏感。
- **仍依赖**：测试/验收与 tasks **对齐**；否则 TDD 只保证「测到的对」。

### 与「慢」的关系

- 硬化方案慢在 **每 task 跑测试**；技能链慢在 **多轮 LLM + 可能的并行子代理**，总体 wall-clock **未必更短**，但并行（worktrees + subagents）有机会在**多任务可切分**时换时间。
- 实践中常 **混合**：关键路径用技能链；或对每条 task 仅 **轻量 verify**（如只跑受影响模块）。

### 接入 DevForge 的成本（为何尚未默认）

- 当前 [`sprint-agent-executor.js`](../sprint-agent-executor.js) 以 **角色 × 步骤 × opencode 单次调用** 为主；技能链需要：**worktree 路径、计划产物落盘、子 agent 生命周期、review 轮次**，属于 **新编排模式**（或独立 CLI），工作量大于「注入 TDD + verify」。
- 可行演进：**新增 `DEVFORGE_DEVELOPER_MODE=superpowers_pipeline`**，在 developer 步骤内按顺序加载 skills 并写 `workspace/.../pipeline-state.json`，与现有 `runDeveloperPerTaskBatch` 并存。

### 建议决策

- 要 **快改现有管道、少架构变动**：继续上文阶段 1～6（可裁剪阶段 2 范围）。
- 要 **对齐 Superpowers 最佳实践、接受更大编排改造**：单独立项「Superpowers 开发者流水线」，按上表分里程碑实现。

---

## 确认后开工

回复 **「确认，按文档执行」** 或调整（例如先做阶段 2 仅 Node+Maven，Gradle 下一轮），再改代码。

若优先 **Superpowers 技能链**，请明确 **「先做备选架构」**，则实现范围从 `sprint-agent-executor` 扩展为 **新模式 + 状态机**，与上表「建议决策」一致。
