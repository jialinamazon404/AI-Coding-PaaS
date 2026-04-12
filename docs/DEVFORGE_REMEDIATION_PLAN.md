# DevForge 整改方案（确认后可执行）

**目标**：在不大改产品三层闭环（需求定稿 → 可执行计划 → 按计划开发）的前提下，补齐 **执行可靠**、**可验证（项目自选命令，不锁技术栈）**、**与单 task 重跑一致** 的工程能力；并保留后续 **契约/追溯（验收↔task）** 的扩展位。

**范围**：以 [`sprint-agent-executor.js`](../sprint-agent-executor.js) 为主；[`generateTesterPrompt`](../sprint-agent-executor.js) 或等价处若需增强 tester（R3.3）；[`README.md`](../README.md) 补环境变量说明。

**不在本次**：Superpowers 完整技能链状态机（另立子项）；Gradle/Go 启发式探测的细粒度（可后续加）。

---

## 最终确认摘要（实现口径）

以下为定稿，**按执行顺序**实现即可。

| 顺序 | 项 | 锁定结论 |
|------|----|----------|
| 1 | **R1** | `DEVFORGE_DEVELOPER_SINGLE_TASK=true` 时 developer **不递归**下一步；`DEVFORGE_DEVELOPER_SINGLE_TASK_CHAIN=1` 恢复旧行为 |
| 2 | **R2** | `DEVFORGE_DEVELOPER_TASK_SKILL` 默认 `test-driven-development`；空/none/0 不注入 |
| 3 | **R4** | 读 `project.json` → `codegen`：`allowBackend` / `allowFrontend` / `allowedRoots`；**manifest 优先于**「目录是否存在」规则 |
| 4 | **R3.1–R3.2** | 仅当 `codegen.verify` 非空时跑 shell；启发式 **`DEVFORGE_VERIFY_HEURISTICS` 默认 false**；相关 `DEVFORGE_VERIFY_*` 仅在有 shell 时生效 |
| 5 | **R3.3** | **默认实现 A**：增强 **tester** 第一步（或合并进现有 tester prompt）— 明确要求对照 **PRD + tasks.md + 已落盘路径** 做「需求一致性」检查，写入报告。**可选实现 B**（另 env 开关）：developer 每 task 后短 opencode 对齐调用，避免默认加倍延迟 |
| 6 | **R5** | `onePrompt` 追加短清单（通用 + 按写入前缀可选 frontend/backend 提示） |
| 7 | **R6** | `README` 增加环境变量与 `codegen` 示例（**不**把 npm/mvn 写成全局强制） |

**环境变量一览（实现时补齐默认值）**

| 变量 | 用途 |
|------|------|
| `DEVFORGE_DEVELOPER_SINGLE_TASK_CHAIN` | 单 task 仍链式下一步（默认关） |
| `DEVFORGE_DEVELOPER_TASK_SKILL` | per-task TDD skill，可关 |
| `DEVFORGE_VERIFY_ENABLED` | 是否执行任何 shell 验证（有 verify 或启发式时） |
| `DEVFORGE_VERIFY_HEURISTICS` | 无 `codegen.verify` 时是否用 npm/mvn 等猜测（**默认 false**） |
| `DEVFORGE_VERIFY_STRICT` / `TIMEOUT_MS` / `SKIP_NO_NODE_MODULES` | shell 验证行为 |
| `DEVFORGE_TASK_ALIGN_OPENCODE`（可选） | **true** 时启用 R3.3-B（developer 内二次对齐）；默认 **false**，仅用 tester |

**你确认后**：回复 **「确认按整改方案执行」**，实现按上表顺序进行。

---

## 整改项一览

| 编号 | 内容 | 优先级 |
|------|------|--------|
| R1 | 单 task 模式：developer **不链式**进入下一步骤 | P0 |
| R2 | Per-task 注入 `test-driven-development`（可关闭） | P0 |
| R3 | 验证分两档：**不默认锁技术栈**；① 项目声明的 `codegen.verify`；② 可选启发式（关默认）；③ **需求/任务一致性**（基于产出与 PRD/tasks 的对照，偏模型/评审，非 npm/mvn 假设） | P1 |
| R4 | `writeFileBlocks`：`project.json` 支持 `allowBackend` / `allowFrontend` / `allowedRoots`（与现有「无 backend 目录则拒绝创建」并存，**manifest 优先**） | P1 |
| R5 | `onePrompt` 增加短约束行（通用 + 触及 frontend/backend 时各一行量级） | P1 |
| R6 | 文档：环境变量表 + `codegen` 示例；依赖安装仅作**项目示例**非强制 | P1 |

---

## R1：单 task 不链式下一步（P0）

**文件**：[`sprint-agent-executor.js`](../sprint-agent-executor.js) — `runIteration` 递归前。

**逻辑**：

- 若 `role === 'developer'` 且 `process.env.DEVFORGE_DEVELOPER_SINGLE_TASK === 'true'`（Dashboard 已注入），则 **不再** `runIteration(..., currentStep, ...)`；将当前 iteration 置为 `completed` 并正常返回。
- 逃生：`DEVFORGE_DEVELOPER_SINGLE_TASK_CHAIN=1` 时保持现有链式行为。

**验收**：Dashboard 按单 task 重跑时，只跑该 task，不自动进入 developer 步骤 2～7。

---

## R2：Per-task TDD Skill（P0）

**文件**：[`sprint-agent-executor.js`](../sprint-agent-executor.js) — `runDeveloperPerTaskBatch` 内 `runOpenCode`。

**逻辑**：

- 新 env：`DEVFORGE_DEVELOPER_TASK_SKILL`，默认 `test-driven-development`。
- 若值为空、`none`、`0`（大小写不敏感）→ `skillName: null`。
- 否则传入 `runOpenCode`，遵守现有 `MAX_SKILL_INJECT_SIZE`（过大则跳过并打日志）。

**验收**：默认跑 task 时日志可见 Skill 注入；关闭 env 后与当前行为一致。

---

## R3：验证与「是否做对」（P1）— 不锁技术栈

**原则**：技术栈在真实项目里只是**优先级/倾向**，最终可能用别的栈或目录布局。**不能**把「验证」默认等同于「检测到 `package.json` 就跑 npm、检测到 `pom.xml` 就跑 mvn」，否则会把执行器锁死在少数栈上，与「按实际产出代码理解」相悖。

因此 R3 拆成三层，**默认不启用栈启发式**。

### R3.1 项目显式命令（首选，不假设栈）

**文件**：[`sprint-agent-executor.js`](../sprint-agent-executor.js)。

- 读取 `projects/<id>/project.json` 中 **`codegen.verify`**：`[{ "cwd": "相对 projectDir", "cmd": "任意 shell 命令" }, ...]`。
- 若存在且非空：在本 task 写盘成功后 **顺序执行**（`spawnSync`，超时可配）；失败行为由 `DEVFORGE_VERIFY_STRICT` 控制。
- **无此字段或为空**：**不**自动跑 npm/mvn（见 R3.2）。

### R3.2 启发式命令（可选，默认关闭）

- 环境变量 **`DEVFORGE_VERIFY_HEURISTICS=true`** 时，且 **`codegen.verify` 未配置**：才可按目录特征尝试常见命令（如存在 `frontend/package.json` → `npm test` 等）。
- 默认 **`DEVFORGE_VERIFY_HEURISTICS=false`**，避免锁栈。
- 其它 env：`DEVFORGE_VERIFY_ENABLED`、`DEVFORGE_VERIFY_STRICT`、`DEVFORGE_VERIFY_TIMEOUT_MS`、`DEVFORGE_VERIFY_SKIP_NO_NODE_MODULES` 仍适用于**实际执行了 shell 验证**时。

### R3.3 需求 / 任务一致性（语义层，对齐「实现是否满足需求」）

**目标**：回答「写出来的东西是否和 **本条 task / 需求** 一致」，**不依赖**特定语言或构建工具。

**建议实现（定稿：先 A 后可选 B）**：

1. **【默认，R3.3-A】tester**：在 **tester** 相关 prompt（至少覆盖步骤 1 / 测试用例设计）中增加硬性要求：须对照 **PRD、OpenSpec tasks、当前 `codePath` 已存在文件** 说明「需求与实现一致性」；缺口写入 `test-cases.md` / 后续报告。不增加 developer 耗时。
2. **【可选，R3.3-B】developer 内对齐**：当 `DEVFORGE_TASK_ALIGN_OPENCODE=true` 时，在 `runDeveloperPerTaskBatch` 每条 task 成功后追加 **短 opencode**：输入 task 原文 + 本 task 写入路径 + 内容摘要 + 可选 PRD 一句；输出 `TASK_ALIGNMENT: pass|fail` 等；由 `DEVFORGE_ALIGN_STRICT` 决定是否 throw。

**验收**：在**未**配置 `codegen.verify`、且**未**开启启发式时，流水线不因「没跑 npm」而失败；若开启对齐检查，则故意不完整实现应可被标记为 fail 或进入 tester 报告。

**与 R3 旧稿差异说明**：原「按 frontend/backend 前缀自动 npm/mvn」**改为非默认**，避免锁死技术栈；**与需求一致**优先通过 **R3.3 + 契约层（PRD↔tasks）**，命令行验证仅作**项目自选**或**可选启发式**。

---

## R4：路径约束（P1）

**文件**：[`sprint-agent-executor.js`](../sprint-agent-executor.js) — `writeFileBlocks`；新增 `loadCodegenConstraints(projectRoot)` 读 `projects/<id>/project.json`（`projectDir` 为 `.../src` 时 parent 为 project root）。

**字段**（可选，向后兼容）：

- `codegen.allowBackend: false` → 拒绝任何 `backend/...`
- `codegen.allowFrontend: false` → 拒绝任何 `frontend/...`
- `codegen.allowedRoots: ["frontend","backend"]` → 未列出则拒绝（若与 allow* 冲突，以 **allowedRoots** 为准若存在）

与现有「无 `backend` 目录则拒绝创建 backend」：**先应用 manifest**，再应用目录存在性规则。

**验收**：纯前端项目配置 `allowBackend: false` 后即使误存在 `backend` 目录也不可写；后端-only 可 `allowFrontend: false`。

---

## R5：Prompt 短清单（P1）

**文件**：[`sprint-agent-executor.js`](../sprint-agent-executor.js) — `onePrompt` 字符串拼接。

**内容**：在现有 Constraints 下追加 3～6 行：

- 通用：单 task、file 块协议、禁止写未允许栈。
- 若本 task 会写 `frontend/`：一句「组件与 store/父组件事件需接好」。
- 若会写 `backend/`：一句「接口/分层与测试类路径需一致」。

**验收**：不改变解析逻辑，仅增加文本。

---

## R6：文档（P1）

**文件**：[`README.md`](../README.md) 新增小节 **「Developer 管道环境变量」**（或 `docs/` 互链），列出上述 `DEVFORGE_*`。

**内容**：说明 **`codegen.verify` 为推荐方式**（不绑栈）；启发式默认关；语义对齐相关 env；若使用 shell 验证，再说明对应项目的依赖安装（示例：某前端 `npm ci`、某后端 `mvn`，**仅作示例非强制**）。

---

## 执行顺序（开发顺序）

1. R1  
2. R2  
3. R4（避免错误写入干扰验证）  
4. R3  
5. R5  
6. R6  

自测：`codegen.verify` 配一条可重复命令的项目；另测 **未配置 verify、启发式关** 时不误杀；若实现 R3.3，测一条「故意不完整」应对齐失败或进入报告。

---

## 确认与执行

- **确认**：你回复 **「确认按整改方案执行」** 或列出删减项（例如暂不做 R3.3-B，仅 R3.3-A tester）。
- **执行**：按上序改代码并本地跑 `node sprint-agent-executor.js` 相关场景（无需你手工操作命令，由执行代理完成）。

---

## 与其它文档关系

- 产品层「契约/追溯」长期见 [DEVFORGE_PIPELINE_STRATEGY.md](./DEVFORGE_PIPELINE_STRATEGY.md)。
- 硬化细节历史见 [EXECUTION_PLAN_PIPELINE_HARDENING.md](./EXECUTION_PLAN_PIPELINE_HARDENING.md)。

本文 **为本次可执行整改的唯一执行清单**。
