/**
 * 冲刺流程节点：按 scenario 展示（与 config/pipelineConfig.js ROUTES 对齐）
 */
import { ROUTES } from '../../../config/pipelineConfig.js'

export { ROUTES }

/** BUILD：完整交付链 */
export const BUILD_STAGES = [
  {
    id: 'requirement',
    name: '需求分析',
    description: '理解用户需求，生成 PRD 和用户故事',
    icon: '📋',
    agents: [{ role: 'product', name: '产品经理', icon: '📋' }],
    skills: ['brainstorming', 'user-story', 'product-spec-kit'],
    outputFiles: [
      {
        name: '用户画像',
        path: 'product/user-personas.md',
        exists: false,
        description: '目标用户、场景与痛点摘要，为后续故事与 PRD 定调。'
      },
      {
        name: '用户故事',
        path: 'product/user-stories.md',
        exists: false,
        description: '按角色拆分的用户故事与验收线索，可映射到迭代与测试。'
      },
      {
        name: '功能清单',
        path: 'product/functional-requirements.md',
        exists: false,
        description: '功能列表与优先级（含验收要点），连接需求与实现范围。'
      },
      {
        name: '界面布局',
        path: 'product/ui-layout.md',
        exists: false,
        description: '主要页面/模块的布局与信息结构说明。'
      },
      {
        name: '交互流程',
        path: 'product/user-journey.md',
        exists: false,
        description: '关键用户路径与步骤说明，便于架构与测试对齐体验。'
      },
      {
        name: 'PRD文档',
        path: 'product/prd.md',
        exists: false,
        description: '整合上述产出的正式需求说明，作为全链路角色的单一事实来源。'
      }
    ]
  },
  {
    id: 'tech-design',
    name: '技术设计',
    description:
      '双角色接力：技术教练先把 PRD 译为「能力需求与可行性」（不定技术栈）；架构师再基于该产出做选型、系统/API/库表设计与 OpenSpec。请按顺序执行，架构师依赖教练产出文件。',
    icon: '🏗️',
    agents: [
      { role: 'tech_coach', name: '技术教练', icon: '🔍' },
      { role: 'architect', name: '架构师', icon: '🏗️' }
    ],
    /** BUILD 技术设计阶段内固定顺序与交接说明（供界面展示） */
    collaborationSteps: [
      {
        step: 1,
        role: 'tech_coach',
        title: '技术教练：能力需求与可行性',
        detail:
          '读取 product/ 下 PRD 与用户故事，输出《技术能力需求》（P0/P1/P2，不写死具体框架）+ 风险/难点；落地 tech-coach/tech-implementation.md，并补充 output/tech-feasibility.md（及必要时的用户故事同步）。'
      },
      {
        step: 2,
        role: 'architect',
        title: '架构师：选型与规格',
        detail:
          '必读 tech-coach/tech-implementation.md，结合 tech-priority 与 PRD，完成架构 → API → 库表 → 数据流 → OpenSpec；技术选型由本角色决策，与教练的「能力需求」对齐。'
      }
    ],
    handoff:
      '交接物：tech-coach/tech-implementation.md（主）、output/tech-feasibility.md。架构师步骤 1–4 均须显式引用上述文件，步骤 5 生成 OpenSpec 时与 PRD、设计稿一致。',
    skills: ['system-design', 'api-design', 'database-design'],
    outputFiles: [
      {
        name: '技术能力需求',
        path: 'tech-coach/tech-implementation.md',
        exists: false,
        description: '将 PRD 译为可交付的技术能力（P0/P1/P2）与约束，不含最终技术栈拍板。'
      },
      {
        name: '技术可行性',
        path: 'output/tech-feasibility.md',
        exists: false,
        description: '风险、依赖与可行性结论，供架构师选型时引用。'
      },
      {
        name: '系统架构',
        path: 'architect/architecture.md',
        exists: false,
        description: '服务边界、组件关系与关键技术选型说明。'
      },
      {
        name: 'API设计',
        path: 'architect/api-design.md',
        exists: false,
        description: '对外/对内接口契约、资源与错误约定。'
      },
      {
        name: '数据库设计',
        path: 'architect/database.md',
        exists: false,
        description: '表结构、索引与数据关系，支撑实现与迁移。'
      },
      {
        name: '业务流转图',
        path: 'architect/data-flow.md',
        exists: false,
        description: '核心业务流程与数据流（常为 Mermaid），对齐实现与测试路径。'
      },
      {
        name: 'OpenSpec',
        path: 'openspec/',
        isDir: true,
        exists: false,
        description: 'OpenSpec change（proposal/design/tasks 等），驱动开发与任务拆解。'
      }
    ]
  },
  {
    id: 'development',
    name: '代码开发',
    description: '按设计文档实现功能，编写测试',
    icon: '💻',
    agents: [{ role: 'developer', name: '开发者', icon: '💻' }],
    skills: ['test-driven-development', 'unit-test-generator'],
    outputFiles: [
      {
        name: 'README',
        path: 'developer/README.md',
        exists: false,
        description: '本地运行、构建与目录说明，方便接手与部署。'
      },
      {
        name: 'API文档',
        path: 'developer/API.md',
        exists: false,
        description: '实现侧 API 说明，与 architect/api-design 呼应。'
      },
      {
        name: '开发摘要',
        path: 'developer/dev-summary.md',
        exists: false,
        description: '本迭代实现范围、决策与已知限制。'
      },
      {
        name: '前端代码',
        path: 'developer/frontend/',
        isDir: true,
        exists: false,
        description: '前端实现目录（占位路径，实际以项目结构为准）。'
      },
      {
        name: '后端代码',
        path: 'developer/backend/',
        isDir: true,
        exists: false,
        description: '后端实现目录（占位路径，实际以项目结构为准）。'
      }
    ]
  },
  {
    id: 'testing',
    name: '测试验证',
    description: '功能测试、性能测试、安全扫描',
    icon: '🧪',
    agents: [{ role: 'tester', name: '测试工程师', icon: '🧪' }],
    skills: ['qa', 'benchmark', 'gstack'],
    outputFiles: [
      {
        name: '测试用例',
        path: 'tester/test-cases.md',
        exists: false,
        description: '功能与场景用例，可追溯到需求与 OpenSpec。'
      },
      {
        name: '测试报告',
        path: 'tester/test-report.md',
        exists: false,
        description: '执行结果、缺陷与结论汇总。'
      },
      {
        name: '安全报告',
        path: 'tester/security-report.md',
        exists: false,
        description: '安全扫描或手工检查的发现问题与建议。'
      }
    ]
  },
  {
    id: 'deploy',
    name: '部署上线',
    description: 'Docker 容器化、CI/CD 配置、部署',
    icon: '⚙️',
    agents: [{ role: 'ops', name: '运维工程师', icon: '⚙️' }],
    skills: ['docker-helper', 'azure-deploy', 'ship'],
    outputFiles: [
      {
        name: 'Dockerfile',
        path: 'ops/Dockerfile',
        exists: false,
        description: '容器镜像构建定义，用于一致运行环境。'
      },
      {
        name: 'docker-compose',
        path: 'ops/docker-compose.yml',
        exists: false,
        description: '本地或多服务编排，便于联调与演示。'
      },
      {
        name: 'CI/CD配置',
        path: 'ops/.github/workflows/',
        isDir: true,
        exists: false,
        description: '自动化构建、测试与部署流水线配置。'
      },
      {
        name: '部署配置',
        path: 'ops/ops-config.md',
        exists: false,
        description: '环境变量、密钥与发布步骤的运维说明。'
      }
    ]
  },
  {
    id: 'optimize',
    name: '迭代优化',
    description: '技术改进建议、重构优化',
    icon: '🔄',
    agents: [{ role: 'evolver', name: '进化顾问', icon: '🔄' }],
    skills: ['tech-debt', 'architecture-review'],
    outputFiles: [
      {
        name: '进化建议',
        path: 'output/evolver-report.md',
        exists: false,
        description: '重构、性能与演进路线的结构化建议。'
      },
      {
        name: '技术债务',
        path: 'output/tech-debt.md',
        exists: false,
        description: '已知债务清单与优先级，便于排期偿还。'
      }
    ]
  }
]

/** CRITICAL：product → architect → creative → developer → tester → evolver */
export const CRITICAL_STAGES = [
  {
    id: 'requirement',
    name: '需求分析',
    description: '核心需求与风险范围',
    icon: '📋',
    agents: [{ role: 'product', name: '产品经理', icon: '📋' }],
    skills: ['brainstorming', 'user-story', 'product-spec-kit'],
    outputFiles: BUILD_STAGES[0].outputFiles
  },
  {
    id: 'tech-design',
    name: '架构设计',
    description: '系统设计与 OpenSpec',
    icon: '🏗️',
    agents: [{ role: 'architect', name: '架构师', icon: '🏗️' }],
    skills: ['system-design', 'api-design', 'database-design'],
    outputFiles: BUILD_STAGES[1].outputFiles.filter(f => !f.path.includes('tech-coach'))
  },
  {
    id: 'creative',
    name: '创意评审',
    description: '体验与方案评审',
    icon: '🎨',
    agents: [{ role: 'creative', name: '创意总监', icon: '🎨' }],
    skills: ['design-review'],
    outputFiles: [
      {
        name: '设计评审',
        path: 'output/design-review.md',
        exists: false,
        description: '体验与视觉层面的评审结论与改进项。'
      }
    ]
  },
  {
    id: 'development',
    name: '代码开发',
    description: '高风险功能实现',
    icon: '💻',
    agents: [{ role: 'developer', name: '开发者', icon: '💻' }],
    skills: ['test-driven-development', 'unit-test-generator'],
    outputFiles: BUILD_STAGES[2].outputFiles
  },
  {
    id: 'testing',
    name: '测试验证',
    description: '强化测试与回归',
    icon: '🧪',
    agents: [{ role: 'tester', name: '测试工程师', icon: '🧪' }],
    skills: ['qa', 'gstack'],
    outputFiles: BUILD_STAGES[3].outputFiles
  },
  {
    id: 'optimize',
    name: '迭代优化',
    description: '复盘与加固',
    icon: '🔄',
    agents: [{ role: 'evolver', name: '进化顾问', icon: '🔄' }],
    skills: ['tech-debt', 'architecture-review'],
    outputFiles: BUILD_STAGES[5].outputFiles
  }
]

/** REVIEW：creative → ghost → tester */
export const REVIEW_STAGES = [
  {
    id: 'design_review',
    name: '设计评审',
    description: '设计稿与交互评审',
    icon: '🎨',
    agents: [{ role: 'creative', name: '创意总监', icon: '🎨' }],
    skills: ['design-review'],
    outputFiles: [
      {
        name: '设计评审',
        path: 'output/design-review.md',
        exists: false,
        description: '体验与视觉层面的评审结论与改进项。'
      }
    ]
  },
  {
    id: 'security_pass',
    name: '安全审计',
    description: '幽灵安全扫描',
    icon: '👻',
    agents: [{ role: 'ghost', name: '安全审计', icon: '👻' }],
    skills: ['gstack-cso'],
    outputFiles: [
      {
        name: '安全报告',
        path: 'output/security-report.md',
        exists: false,
        description: '威胁面与漏洞类发现的汇总（幽灵/安全 Agent）。'
      }
    ]
  },
  {
    id: 'testing',
    name: '测试验证',
    description: '审查项验证',
    icon: '🧪',
    agents: [{ role: 'tester', name: '测试工程师', icon: '🧪' }],
    skills: ['qa', 'gstack'],
    outputFiles: [
      {
        name: '测试报告',
        path: 'tester/test-report.md',
        exists: false,
        description: '审查场景下的测试结论与遗留问题。'
      }
    ]
  }
]

/** QUERY：仅 tech_coach */
export const QUERY_STAGES = [
  {
    id: 'feasibility',
    name: '技术调研',
    description: '可行性、方案对比与建议',
    icon: '❓',
    agents: [{ role: 'tech_coach', name: '开发教练', icon: '🔍' }],
    skills: ['system-design', 'api-design'],
    outputFiles: [
      {
        name: '技术实现',
        path: 'tech-coach/tech-implementation.md',
        exists: false,
        description: '调研结论与推荐方案要点，写入技术实现视角的说明。'
      },
      {
        name: '可行性',
        path: 'output/tech-feasibility.md',
        exists: false,
        description: '对比、风险与是否值得继续投入的结论。'
      }
    ]
  }
]

/** SECURITY：ghost → architect */
export const SECURITY_STAGES = [
  {
    id: 'security_pass',
    name: '安全审计',
    description: '威胁建模与漏洞扫描',
    icon: '👻',
    agents: [{ role: 'ghost', name: '安全审计', icon: '👻' }],
    skills: ['gstack-cso'],
    outputFiles: [
      {
        name: '安全报告',
        path: 'output/security-report.md',
        exists: false,
        description: '威胁面与漏洞类发现的汇总（幽灵/安全 Agent）。'
      }
    ]
  },
  {
    id: 'architecture_review',
    name: '架构评估',
    description: '安全架构与整改建议',
    icon: '🏗️',
    agents: [{ role: 'architect', name: '架构师', icon: '🏗️' }],
    skills: ['system-design', 'architecture-review'],
    outputFiles: [
      {
        name: '架构加固',
        path: 'architect/security-hardening.md',
        exists: false,
        description: '面向安全视角的架构补充与加固建议。'
      },
      {
        name: 'OpenSpec',
        path: 'openspec/',
        isDir: true,
        exists: false,
        description: '与安全整改相关的 OpenSpec 变更说明（若适用）。'
      }
    ]
  }
]

/**
 * 多步骤角色：Dashboard「从指定步骤重跑」选项（stepIndex 与 sprint-agent-executor 一致，0 起）
 */
export const ROLE_STEP_RERUN_LABELS = {
  product: [
    '用户画像与核心需求',
    '用户故事拆解',
    '功能清单与验收',
    '界面布局与交互流程',
    '汇总 PRD'
  ],
  tech_coach: ['信息收集', '能力需求与可行性'],
  architect: ['系统架构', 'API 设计', '数据库', '数据流', 'OpenSpec'],
  developer: [
    '范围确认',
    'tasks 第 1 批（第 1～10 条）',
    'tasks 第 2 批（第 11～20 条）',
    'tasks 第 3 批（第 21～30 条）',
    'tasks 第 4 批（第 31～40 条）',
    'tasks 第 5 批（第 41 条起至全部完成）',
    '开发文档 (README/API/摘要)'
  ],
  tester: ['测试用例', '功能测试执行', '安全扫描', '测试报告汇总'],
  ops: ['环境分析', 'Dockerfile / compose', 'CI/CD', '部署脚本与说明'],
  ghost: ['威胁建模与资产', '漏洞与整改建议'],
  creative: ['体验与视觉评审', '改进清单'],
  evolver: ['技术债务与风险', '优化路线图']
}

/**
 * @param {string} role
 * @param {string} scenario
 * @returns {{ stepIndex: number, label: string }[]}
 */
export function getRerunStepOptions(role, scenario = 'BUILD') {
  const labels = ROLE_STEP_RERUN_LABELS[role]
  if (!labels?.length) return []
  if (scenario === 'QUERY' && role === 'tech_coach') {
    return [{ stepIndex: 0, label: '能力需求与可行性（QUERY 单步）' }]
  }
  return labels.map((text, i) => ({
    stepIndex: i,
    label: `${i + 1}. ${text}`
  }))
}

export const SCENARIO_STAGE_CONFIG = {
  BUILD: BUILD_STAGES,
  CRITICAL: CRITICAL_STAGES,
  REVIEW: REVIEW_STAGES,
  QUERY: QUERY_STAGES,
  SECURITY: SECURITY_STAGES
}

export const SCENARIO_LABELS = {
  BUILD: { title: '从零构建新功能', desc: '产品→设计→开发→测试→部署→优化' },
  CRITICAL: { title: '核心/高风险功能', desc: '强化设计评审与测试，无运维节点' },
  REVIEW: { title: '代码/设计审查', desc: '创意→安全→测试' },
  QUERY: { title: '技术可行性调研', desc: '开发教练单角色快速评估' },
  SECURITY: { title: '安全检查', desc: '安全审计→架构评估' }
}

export function getStagesForScenario(scenario) {
  const key = scenario && SCENARIO_STAGE_CONFIG[scenario] ? scenario : 'BUILD'
  return SCENARIO_STAGE_CONFIG[key] || BUILD_STAGES
}
