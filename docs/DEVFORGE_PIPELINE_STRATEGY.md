# DevForge 交付方案：从「三层闭环」到工程落地

本文整合当前讨论：**产品初衷**、**为何仍会漏**、**两条落地路径**（契约优先 vs 执行器硬化）、**可选 Superpowers 技能链**、**推荐分期**。  
细节实现仍可与 [EXECUTION_PLAN_PIPELINE_HARDENING.md](./EXECUTION_PLAN_PIPELINE_HARDENING.md) 对照。

---

## 1. 产品初衷（你的设想）

| 阶段 | 产出 | 职责 |
|------|------|------|
| 需求分析 | 范围与验收**定稿** | 不再在开发中「现想需求」 |
| 技术设计 | **可执行计划**（OpenSpec design + tasks 等） | 把需求翻译成可逐条实现的条目 |
| 开发 | **只按计划**写代码 | 填空与集成，不重新发明需求 |

在此模型下，**「漏功能」**应主要被解释为：

- **上游未闭合**：PRD 与 tasks 不一致、任务条目不原子、验收无法映射到 task。
- **执行与计划脱节**：某条 task 未真正完成，或无法证明「对应验收已满足」。

---

## 2. 现状与根因（为何仍会出现「漏」）

- **计划层**：`tasks.md` 可能粗粒度、与 PRD 验收**无显式追溯**；checkbox 格式不规范会导致**解析遗漏**。
- **执行层**：Developer 按条调模型 + file 块门禁，**不等于**「行为正确」；多 task 改同一文件时易**覆盖不全**。
- **单任务 / 重跑**：单 task 模式与「链式跑完 developer 多步」曾**行为不一致**，造成重复或缺口。
- **全栈**：仅以前端 npm 为默认心智时，**后端 Maven/Gradle** 等未纳入同一套「证明」机制。

这些都不否定你的三层模型，而是说明：**要有一层「契约 + 证明」把三层钉在一起**。

---

## 3. 总体方案：双轨合一

### 轨道 A — 契约与可追溯（对齐你的初衷，优先）

**目标**：让「不会漏」在流程上可论证——**每条验收**能在设计里找到**对应 task**，在实现里找到**对应测试或检查点**。

建议落地（可分期）：

1. **需求 → 设计**：在 architect/tech_coach 输出中要求 **验收 ID**（或用户故事 ID）与 **tasks 条目** 可对照（表格或 Markdown 约定）。
2. **tasks.md 规范**：每条 `- [ ]` **一事一验**；CI 或本地脚本校验 checkbox 数量、格式；`openspec validate` 保持。
3. **开发完成定义（DoD）**：每条 task 合并前必须满足其一：**自动化测试**引用该验收 / task 编号，或 **明确 NO_TEST** 理由（仅文档/配置类）。
4. **执行器侧轻量门禁**（与轨道 B 重叠）：task 失败时**可追溯**到 `developer-task-runs` 与日志。

**优点**：最贴合「分析定需求、设计出计划、开发只执行」。  
**缺点**：需要改 **prompt 模板 + 可选校验脚本**，组织上要有「验收 ID」习惯。

### 轨道 B — 执行器硬化（工程兜底）

**目标**：即使模型偶发输出坏代码，**尽快失败或重试**，避免静默落盘。

内容摘要（以 [DEVFORGE_REMEDIATION_PLAN.md](./DEVFORGE_REMEDIATION_PLAN.md) 为准）：

- Per-task 可选注入 **`test-driven-development`** Skill。
- 落盘后 **shell 验证**：以 **`project.json` → `codegen.verify`** 显式命令为首选，**不默认**按 npm/Maven 等锁技术栈；启发式验证仅 **可选**。
- **需求/任务一致性**：以 **语义对照**（task + 产出摘要 vs 需求）或 **增强 tester**，而非假设固定栈。
- **`DEVFORGE_DEVELOPER_SINGLE_TASK`** 时**不链式**进入下一 developer 步骤。
- 可选 **`codegen.allowBackend` / `allowFrontend` / `allowedRoots`** 防止写错栈。

**优点**：与现有 `sprint-agent-executor.js` 增量兼容，可快速见效。  
**缺点**：每 task 跑测试可能**变慢**；不能单独替代轨道 A（验收若未写进测试，仍可能「全绿但错」）。

### 两轨关系

- **轨道 A** 回答「**该不该做、做全没有**」（与你的产品初衷一致）。
- **轨道 B** 回答「**做出来的对不对、坏代码有没有拦住**」。

推荐：**先做轨道 A 的最小集（验收↔task 对照 + tasks 格式校验）**，再上有选择的轨道 B（先单 task 行为修正 + TDD 注入，验证按栈与频率可配置）。

---

## 4. 可选：Superpowers 技能链（增强「工程纪律」）

在 OpenSpec 已产出 design + tasks 的前提下，可用技能链强化 **计划 → 实现 → 评审 → 收尾**：

`brainstorming` → `using-git-worktrees` → `writing-plans` → `subagent-driven-development` → `test-driven-development` → `requesting-code-review` → `finishing-a-development-branch`

- **价值**：worktree 隔离、成文计划、并行子任务、TDD、**代码评审**、分支收尾——减少**实现与集成**层面的漏。
- **不替代**：PRD/tasks 本身缺项；仍需轨道 A 的追溯。
- **成本**：需 **新编排模式**（状态机、worktree 路径、多轮 agent），大于「改 executor 几处」。

适合作为 **Phase 3** 单独立项，与现有 Dashboard 角色流水线并行一种 `DEVFORGE_DEVELOPER_MODE`。

---

## 5. 推荐分期路线图

| 阶段 | 内容 | 与初衷关系 |
|------|------|------------|
| **P0** | 单 task 不链式下一步；tasks 解析/格式自检（脚本或文档强制） | 执行可靠、计划不被跳过 |
| **P1** | 验收↔task 对照模板（architect/tech_coach）；DoD：测试或显式免测 | **契约优先** |
| **P2** | TDD skill 注入；`codegen.verify` + 可选启发式；语义/测试员对齐需求 | **兜底** |
| **P3（可选）** | Superpowers 开发者流水线（worktree + review + finishing branch） | **纪律与评审** |

---

## 6. 你该如何拍板

- **若坚持「开发只按计划、理论上不漏」**：以 **P0 + P1** 为主，P2 做「证明」而非唯一真理来源。
- **若当前痛点是「坏代码静默落盘、全栈要测」**：**P0 + P2** 可先上，同时补最小 **P1**（否则仍可能全绿业务错）。
- **若资源够且要做长期最佳实践**：在 P1/P2 稳定后上 **P3**。

更细的代码级任务列表仍以 [EXECUTION_PLAN_PIPELINE_HARDENING.md](./EXECUTION_PLAN_PIPELINE_HARDENING.md) 为准；本文负责**总览与优先级**。

---

## 7. 文档索引

| 文档 | 内容 |
|------|------|
| [EXECUTION_PLAN_PIPELINE_HARDENING.md](./EXECUTION_PLAN_PIPELINE_HARDENING.md) | 执行器硬化分阶段、全栈验证、备选技能链附录 |
| 本文 | 总体方案与分期决策 |
