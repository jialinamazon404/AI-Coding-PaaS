/**
 * Harness - DevForge Execution Harness
 * 
 * 进程池优化方案的核心模块
 * 
 * 使用示例：
 * 
 * ```javascript
 * import { createHarness } from './harness/index.js';
 * 
 * // 初始化
 * const harness = await createHarness();
 * 
 * // 执行角色任务
 * const result = await harness.executeRole('architect', {
 *   sprintId: 'sprint-123',
 *   workspace: '/path/to/workspace',
 *   rawInput: '用户需求描述',
 *   prompt: '# 角色：架构师\n\n任务：...',
 *   model: 'opencode/qwen3.6-plus-free'
 * });
 * 
 * // 获取统计
 * const stats = harness.getStats();
 * console.log(`Cache hit rate: ${stats.cache.hitRate}`);
 * 
 * // 关闭
 * await harness.shutdown();
 * ```
 */

// 导出所有模块
export { HarnessManager } from './manager.js';
export { PoolManager } from './pool-manager.js';
export { ProcessPool } from './process-pool.js';
export { Worker } from './worker.js';
export { TaskScheduler } from './task-scheduler.js';
export { CacheStrategy, SKILL_PATHS, CACHE_LIMITS } from './cache-strategy.js';
export { ContentExtractor } from './content-extractor.js';
export { ROLE_DEPENDENCIES, getRoleDependencies, getExtractionRules, getRoleProduces, ROUTE_DEPENDENCIES } from './role-dependencies.js';

// 便捷创建函数
export { createHarness } from './manager.js';
