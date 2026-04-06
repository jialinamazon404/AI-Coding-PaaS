/**
 * TaskScheduler - 任务调度器
 * 
 * 特性：
 * 1. 支持角色依赖顺序执行
 * 2. 可选并行执行（无依赖的角色）
 * 3. 并发控制
 */

import crypto from 'crypto';
import { getRoleDependencies } from './role-dependencies.js';

export class TaskScheduler {
  constructor(poolManager, options = {}) {
    this.poolManager = poolManager;
    this.maxConcurrent = options.maxConcurrent || 3;
    
    this.pendingTasks = [];
    this.runningTasks = new Map();  // taskId -> { task, startTime }
    this.completedTasks = new Map(); // taskId -> result
    
    this.roleOutputs = new Map();  // sprintId:role -> output
    
    this.stats = {
      total: 0,
      completed: 0,
      failed: 0,
      avgLatency: 0
    };
  }

  /**
   * 生成任务 ID
   */
  generateTaskId() {
    return `task-${crypto.randomBytes(4).toString('hex')}`;
  }

  /**
   * 调度任务
   */
  async schedule(task) {
    const taskId = this.generateTaskId();
    task.id = taskId;
    this.stats.total++;

    // 检查依赖
    const deps = getRoleDependencies(task.role);
    if (deps && deps.length > 0) {
      const depsMet = await this.checkDependencies(task, deps);
      if (!depsMet) {
        // 依赖未满足，加入等待队列
        return this.waitForDependencies(task);
      }
    }

    return this.executeTask(task);
  }

  /**
   * 检查依赖是否满足
   */
  async checkDependencies(task, deps) {
    for (const depRole of deps) {
      const key = `${task.sprintId}:${depRole}`;
      if (!this.roleOutputs.has(key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 等待依赖完成
   */
  async waitForDependencies(task) {
    return new Promise((resolve, reject) => {
      this.pendingTasks.push({
        task,
        resolve,
        reject,
        addedAt: Date.now()
      });
    });
  }

  /**
   * 执行任务
   */
  async executeTask(task) {
    // 检查并发限制
    if (this.runningTasks.size >= this.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.pendingTasks.push({
          task,
          resolve,
          reject,
          addedAt: Date.now()
        });
      });
    }

    const startTime = Date.now();
    this.runningTasks.set(task.id, { task, startTime });

    try {
      // 构建任务（注入依赖内容）
      const enrichedTask = await this.enrichTask(task);
      
      // 从池中执行
      const result = await this.poolManager.execute(enrichedTask);
      
      // 记录输出
      const outputKey = `${task.sprintId}:${task.role}`;
      this.roleOutputs.set(outputKey, result);

      this.runningTasks.delete(task.id);
      this.completedTasks.set(task.id, result);
      this.stats.completed++;

      // 通知依赖此任务的其他任务
      this.notifyDependentTasks(task);

      // 调度下一个待处理任务
      this.scheduleNext();

      return result;
    } catch (error) {
      this.runningTasks.delete(task.id);
      this.completedTasks.set(task.id, { error: error.message });
      this.stats.failed++;

      // 通知等待的任务失败
      const pending = this.pendingTasks.find(p => p.task.role === task.role);
      if (pending) {
        pending.reject(error);
      }

      throw error;
    }
  }

  /**
   * 丰富任务（注入依赖内容）
   */
  async enrichTask(task) {
    // 获取角色依赖
    const deps = getRoleDependencies(task.role);
    if (!deps || deps.length === 0) {
      return task;
    }

    // 提取依赖内容
    const enrichedTask = { ...task };
    const context = [];

    for (const depRole of deps) {
      const key = `${task.sprintId}:${depRole}`;
      const output = this.roleOutputs.get(key);
      
      if (output) {
        context.push({
          role: depRole,
          output: typeof output === 'string' ? output : JSON.stringify(output)
        });
      }
    }

    if (context.length > 0) {
      enrichedTask.dependencies = context;
    }

    return enrichedTask;
  }

  /**
   * 通知依赖此任务的其他任务
   */
  notifyDependentTasks(completedTask) {
    const waiting = this.pendingTasks.filter(p => 
      getRoleDependencies(p.task.role)?.includes(completedTask.role)
    );

    for (const pending of waiting) {
      // 检查是否所有依赖都满足
      const deps = getRoleDependencies(pending.task.role);
      const allMet = deps.every(depRole => {
        const key = `${pending.task.sprintId}:${depRole}`;
        return this.roleOutputs.has(key);
      });

      if (allMet) {
        // 从等待队列移除
        this.pendingTasks = this.pendingTasks.filter(p => p !== pending);
        // 执行任务
        this.executeTask(pending.task).then(pending.resolve).catch(pending.reject);
      }
    }
  }

  /**
   * 调度下一个待处理任务
   */
  scheduleNext() {
    if (this.pendingTasks.length === 0) return;
    if (this.runningTasks.size >= this.maxConcurrent) return;

    // 按加入时间排序
    this.pendingTasks.sort((a, b) => a.addedAt - b.addedAt);
    
    const pending = this.pendingTasks.shift();
    this.executeTask(pending.task).then(pending.resolve).catch(pending.reject);
  }

  /**
   * 并行执行任务（无依赖）
   */
  async scheduleParallel(tasks) {
    return Promise.all(tasks.map(task => this.schedule(task)));
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      ...this.stats,
      running: this.runningTasks.size,
      pending: this.pendingTasks.length,
      avgLatency: this.stats.completed > 0 
        ? this.stats.avgLatency 
        : 0
    };
  }

  /**
   * 获取角色输出
   */
  getRoleOutput(sprintId, role) {
    return this.roleOutputs.get(`${sprintId}:${role}`);
  }

  /**
   * 清理 sprint 相关数据
   */
  clearSprint(sprintId) {
    for (const key of this.roleOutputs.keys()) {
      if (key.startsWith(`${sprintId}:`)) {
        this.roleOutputs.delete(key);
      }
    }
  }
}
