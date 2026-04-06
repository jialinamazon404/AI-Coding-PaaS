/**
 * HarnessManager - Harness 总管理器
 * 
 * 整合所有组件，提供统一的对外接口
 */

import { PoolManager } from './pool-manager.js';
import { TaskScheduler } from './task-scheduler.js';
import { CacheStrategy, SKILL_PATHS } from './cache-strategy.js';
import { ContentExtractor } from './content-extractor.js';
import crypto from 'crypto';

export class HarnessManager {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    
    this.poolManager = new PoolManager({
      rootDir: this.rootDir,
      config: options.poolConfig
    });
    
    this.scheduler = new TaskScheduler(this.poolManager, {
      maxConcurrent: options.maxConcurrent || 3
    });
    
    this.cache = new CacheStrategy({
      skillPaths: options.skillPaths || SKILL_PATHS
    });
    
    this.extractor = new ContentExtractor(this.cache);
    
    this.stats = {
      tasks: 0,
      errors: 0,
      totalTime: 0
    };

    this._initialized = false;
  }

  /**
   * 初始化 Harness
   */
  async initialize() {
    if (this._initialized) return this;

    console.log('[HarnessManager] Initializing...');

    // 初始化进程池
    await this.poolManager.initialize();

    // 预加载常用 Skills
    await this.preloadSkills();

    this._initialized = true;
    console.log('[HarnessManager] Initialized');

    return this;
  }

  /**
   * 预加载常用 Skills
   */
  async preloadSkills() {
    const commonSkills = [
      'brainstorming',
      'api-design',
      'system-design',
      'database-design',
      'test-driven-development'
    ];

    console.log('[HarnessManager] Preloading skills...');
    
    for (const skill of commonSkills) {
      await this.cache.getSkill(skill);
    }

    console.log(`[HarnessManager] Preloaded ${commonSkills.length} skills`);
  }

  /**
   * 执行角色任务
   */
  async executeRole(role, context) {
    const startTime = Date.now();

    try {
      // 1. 获取 Skill
      const skill = await this.cache.getSkill(role);

      // 2. 提取依赖内容（按需）
      const extracted = await this.extractor.extract(role, {
        workspace: context.workspace,
        sprintId: context.sprintId
      });

      // 3. 构建任务
      const task = {
        id: this.generateTaskId(),
        role,
        model: context.model,
        sprintId: context.sprintId,
        workspace: context.workspace,
        prompt: this.buildPrompt(role, context, extracted),
        skill,
        context: {
          rawInput: context.rawInput,
          extracted
        }
      };

      // 4. 调度执行
      const result = await this.scheduler.schedule(task);

      // 5. 缓存输出
      await this.cache.setRoleOutput(context.sprintId, role, result);

      // 6. 记录统计
      this.stats.tasks++;
      this.stats.totalTime += Date.now() - startTime;

      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 执行角色任务（直接传入 prompt）
   */
  async executePrompt(role, prompt, options = {}) {
    const startTime = Date.now();

    try {
      const skill = await this.cache.getSkill(role);

      const task = {
        id: this.generateTaskId(),
        role,
        model: options.model,
        prompt,
        skill,
        context: options.context
      };

      const result = await this.poolManager.execute(task);

      this.stats.tasks++;
      this.stats.totalTime += Date.now() - startTime;

      return result;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  /**
   * 构建 Prompt
   */
  buildPrompt(role, context, extracted) {
    let prompt = context.prompt || '';

    // 注入提炼后的依赖内容
    if (extracted) {
      const contextSnippet = this.extractor.formatForPrompt(extracted);
      if (contextSnippet) {
        prompt = prompt + contextSnippet;
      }
    }

    return prompt;
  }

  /**
   * 生成任务 ID
   */
  generateTaskId() {
    return `h-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      avgTime: this.stats.tasks > 0 
        ? Math.round(this.stats.totalTime / this.stats.tasks) 
        : 0,
      pools: this.poolManager.getAllStats(),
      cache: this.cache.getStats(),
      scheduler: this.scheduler.getStats()
    };
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    const poolHealth = await this.poolManager.healthCheck();
    
    return {
      initialized: this._initialized,
      poolHealth,
      cacheHitRate: this.cache.getHitRate()
    };
  }

  /**
   * 清理 sprint 数据
   */
  clearSprint(sprintId) {
    this.scheduler.clearSprint(sprintId);
  }

  /**
   * 关闭 Harness
   */
  async shutdown() {
    console.log('[HarnessManager] Shutting down...');
    await this.poolManager.shutdown();
    this.cache.clear();
    console.log('[HarnessManager] Shutdown complete');
  }
}

/**
 * 创建 Harness 实例（便捷函数）
 */
export async function createHarness(options = {}) {
  const harness = new HarnessManager(options);
  await harness.initialize();
  return harness;
}
