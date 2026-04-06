/**
 * 角色依赖配置
 * 
 * 定义每个角色需要从哪些前置角色获取什么内容
 * - from: 需要哪些前置角色的输出
 * - extract: 从每个前置角色提取什么内容
 * 
 * 提取类型：
 * - summary: 摘要提炼（关注关键结论，限制 token 数量）
 * - full: 完整传递（仅用于小文件）
 * - reference: 引用路径（文件很大时直接传路径）
 */

export const ROLE_DEPENDENCIES = {
  // ===== BUILD 路由 =====
  
  product: {
    from: [],
    produces: ['prd', 'user-stories', 'functional-requirements'],
    description: '产品经理 - 起点角色，无需前置依赖'
  },

  tech_coach: {
    from: ['product'],
    produces: ['change-request', 'tech-implementation', 'user-stories-dev'],
    description: '开发教练 - 需要 Product 的 PRD 提炼版',
    extract: {
      product: [
        {
          source: 'product/prd.md',
          type: 'summary',
          maxTokens: 600,
          description: 'PRD 摘要：用户画像、用户故事、功能清单'
        },
        {
          source: 'product/user-stories.md',
          type: 'full',
          description: '完整用户故事列表'
        }
      ]
    }
  },

  architect: {
    from: ['tech_coach'],
    produces: ['architecture', 'api-design', 'database-design', 'openspec'],
    description: '架构师 - 需要 Tech Coach 的技术能力需求',
    extract: {
      tech_coach: [
        {
          source: 'output/tech-capabilities.json',
          type: 'full',
          description: '技术能力需求清单'
        },
        {
          source: 'tech-coach/tech-implementation.md',
          type: 'summary',
          maxTokens: 800,
          description: '前后端分离方案摘要'
        }
      ]
    }
  },

  developer: {
    from: ['architect', 'tech_coach'],
    produces: ['code', 'tests', 'dev-docs'],
    description: '开发者 - 需要 Architect 的 OpenSpec + Tech Coach 的用户故事',
    extract: {
      architect: [
        {
          source: '**/tasks.md',
          type: 'full',
          description: '完整任务清单'
        },
        {
          source: '**/design.md',
          type: 'summary',
          maxTokens: 500,
          description: '技术设计摘要'
        },
        {
          source: '**/proposal.md',
          type: 'summary',
          maxTokens: 300,
          description: '变更提案摘要'
        }
      ],
      tech_coach: [
        {
          source: 'output/user-stories.md',
          type: 'full',
          description: '开发用用户故事'
        }
      ]
    }
  },

  tester: {
    from: ['developer'],
    produces: ['test-report', 'security-report'],
    description: '测试工程师 - 需要 Developer 的代码位置和摘要',
    extract: {
      developer: [
        {
          source: 'developer/README.md',
          type: 'full',
          description: '代码位置和运行说明'
        },
        {
          source: 'developer/dev-summary.md',
          type: 'summary',
          maxTokens: 500,
          description: '开发变更摘要'
        }
      ]
    }
  },

  ops: {
    from: ['developer', 'architect'],
    produces: ['dockerfile', 'ci-cd', 'deploy-config'],
    description: '运维工程师 - 需要 Developer 的代码和 Architect 的架构',
    extract: {
      developer: [
        {
          source: 'developer/README.md',
          type: 'full',
          description: '代码结构和运行说明'
        }
      ],
      architect: [
        {
          source: '**/architecture.md',
          type: 'summary',
          maxTokens: 500,
          description: '架构设计摘要'
        }
      ]
    }
  },

  evolver: {
    from: ['product', 'architect', 'developer', 'tester'],
    produces: ['evolver-report'],
    description: '进化顾问 - 需要所有角色的摘要',
    extract: {
      product: [
        {
          source: 'product/prd.md',
          type: 'summary',
          maxTokens: 500,
          description: '产品需求摘要'
        }
      ],
      architect: [
        {
          source: '**/architecture.md',
          type: 'summary',
          maxTokens: 500,
          description: '架构设计摘要'
        }
      ],
      developer: [
        {
          source: 'developer/dev-summary.md',
          type: 'full',
          description: '开发摘要完整'
        }
      ],
      tester: [
        {
          source: 'output/test-report.md',
          type: 'summary',
          maxTokens: 800,
          description: '测试报告摘要'
        }
      ]
    }
  },

  // ===== REVIEW 路由 =====

  creative: {
    from: ['product'],
    produces: ['design-review'],
    description: '创意总监 - 需要 Product 的 PRD 和 UI 设计',
    extract: {
      product: [
        {
          source: 'product/prd.md',
          type: 'full',
          description: '完整 PRD'
        },
        {
          source: 'product/ui-layout.md',
          type: 'full',
          description: '界面布局设计'
        }
      ]
    }
  },

  ghost: {
    from: ['developer'],
    produces: ['security-report'],
    description: '安全幽灵 - 需要 Developer 的代码位置',
    extract: {
      developer: [
        {
          source: 'projects/*/src/**/*',
          type: 'reference',
          description: '代码文件路径列表'
        }
      ]
    }
  },

  // ===== QUERY 路由 =====

  tech_coach_query: {
    from: ['product'],
    produces: ['feasibility-report'],
    description: '技术可行性分析 - 需要 Product 的 PRD',
    extract: {
      product: [
        {
          source: 'product/prd.md',
          type: 'full',
          description: '完整 PRD'
        }
      ]
    }
  }
};

/**
 * 获取角色的直接依赖
 */
export function getRoleDependencies(role) {
  return ROLE_DEPENDENCIES[role]?.from || [];
}

/**
 * 获取角色的提炼规则
 */
export function getExtractionRules(role) {
  return ROLE_DEPENDENCIES[role]?.extract || {};
}

/**
 * 获取角色产生的内容
 */
export function getRoleProduces(role) {
  return ROLE_DEPENDENCIES[role]?.produces || [];
}

/**
 * 获取路由的角色顺序
 */
export const ROUTE_DEPENDENCIES = {
  BUILD: ['product', 'tech_coach', 'architect', 'developer', 'tester', 'ops', 'evolver'],
  CRITICAL: ['product', 'architect', 'creative', 'developer', 'tester', 'evolver'],
  REVIEW: ['creative', 'ghost', 'tester'],
  QUERY: ['tech_coach'],
  SECURITY: ['ghost', 'architect']
};
