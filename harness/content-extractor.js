/**
 * 内容提炼器
 * 
 * 核心功能：
 * 1. 根据角色依赖配置提取内容
 * 2. 对大文件进行摘要提炼
 * 3. 处理文件引用（路径 vs 内容）
 */

import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export class ContentExtractor {
  constructor(cache) {
    this.cache = cache;
  }

  /**
   * 根据角色配置提取依赖内容
   */
  async extract(role, context) {
    const rules = this.getExtractionRules(role);
    if (!rules || Object.keys(rules).length === 0) {
      return null;
    }

    const extracted = {};
    const workspace = context.workspace;

    for (const [sourceRole, sourceRules] of Object.entries(rules)) {
      const roleExtracts = [];

      for (const rule of sourceRules) {
        try {
          const content = await this.extractByRule(rule, workspace);
          if (content) {
            roleExtracts.push({
              source: rule.source,
              type: rule.type,
              description: rule.description,
              content
            });
          }
        } catch (error) {
          console.warn(`[ContentExtractor] Failed to extract ${rule.source}: ${error.message}`);
        }
      }

      if (roleExtracts.length > 0) {
        extracted[sourceRole] = roleExtracts;
      }
    }

    return Object.keys(extracted).length > 0 ? extracted : null;
  }

  /**
   * 获取提炼规则
   */
  getExtractionRules(role) {
    const { getExtractionRules } = require('./role-dependencies.js');
    return getExtractionRules(role);
  }

  /**
   * 根据规则提取内容
   */
  async extractByRule(rule, workspace) {
    switch (rule.type) {
      case 'summary':
        return this.extractSummary(rule, workspace);
      
      case 'full':
        return this.extractFull(rule, workspace);
      
      case 'reference':
        return this.extractReference(rule, workspace);
      
      default:
        return this.extractFull(rule, workspace);
    }
  }

  /**
   * 摘要提炼
   */
  async extractSummary(rule, workspace) {
    const files = await this.resolveGlob(rule.source, workspace);
    if (files.length === 0) {
      return null;
    }

    const summaries = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const summary = this.summarize(content, rule.maxTokens || 500);
        summaries.push({
          file: path.relative(workspace, file),
          summary
        });
      } catch (error) {
        console.warn(`[ContentExtractor] Cannot read ${file}: ${error.message}`);
      }
    }

    return summaries.length > 0 ? summaries : null;
  }

  /**
   * 完整提取
   */
  async extractFull(rule, workspace) {
    const files = await this.resolveGlob(rule.source, workspace);
    if (files.length === 0) {
      return null;
    }

    const contents = [];
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        contents.push({
          file: path.relative(workspace, file),
          content: content.slice(0, 10000) // 限制单文件大小
        });
      } catch (error) {
        console.warn(`[ContentExtractor] Cannot read ${file}: ${error.message}`);
      }
    }

    return contents.length > 0 ? contents : null;
  }

  /**
   * 引用提取（只返回路径）
   */
  async extractReference(rule, workspace) {
    const files = await this.resolveGlob(rule.source, workspace);
    return files.map(f => path.relative(workspace, f));
  }

  /**
   * 解析 glob 模式
   */
  async resolveGlob(pattern, workspace) {
    if (!pattern.includes('*')) {
      const fullPath = path.join(workspace, pattern);
      try {
        await fs.access(fullPath);
        return [fullPath];
      } catch {
        return [];
      }
    }

    try {
      const matches = await glob(pattern, { cwd: workspace, absolute: true });
      return matches.filter(async (f) => {
        try {
          const stat = await fs.stat(f);
          return stat.isFile();
        } catch {
          return false;
        }
      });
    } catch {
      return [];
    }
  }

  /**
   * 摘要内容
   */
  summarize(content, maxTokens = 500) {
    const estimatedTokens = this.estimateTokens(content);
    
    if (estimatedTokens <= maxTokens) {
      return {
        type: 'full',
        tokens: estimatedTokens,
        content
      };
    }

    // 策略1: 提取重要段落
    const importantLines = this.extractImportantLines(content);
    if (this.estimateTokens(importantLines) <= maxTokens) {
      return {
        type: 'summary',
        tokens: this.estimateTokens(importantLines),
        content: importantLines
      };
    }

    // 策略2: 截断
    const maxChars = maxTokens * 4;
    return {
      type: 'truncated',
      tokens: maxTokens,
      content: content.slice(0, maxChars) + '\n\n[... 内容已截断 ...]'
    };
  }

  /**
   * 提取重要段落（标题、列表项等）
   */
  extractImportantLines(content) {
    const lines = content.split('\n');
    const important = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // 保留标题
      if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        important.push(line);
        continue;
      }

      // 保留列表项
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\./.test(trimmed)) {
        important.push(line);
        continue;
      }

      // 保留表格行（但跳过分隔线）
      if (trimmed.startsWith('|') && !trimmed.match(/^\|[\s-]+\|$/)) {
        important.push(line);
        continue;
      }

      // 保留强调内容
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        important.push(line);
      }
    }

    return important.join('\n');
  }

  /**
   * 估算 token 数量（简单估算：4字符 ≈ 1 token）
   */
  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  /**
   * 格式化提取内容为 prompt 片段
   */
  formatForPrompt(extracted) {
    if (!extracted) return '';

    let formatted = '\n\n## 相关上下文（已提炼）\n';

    for (const [sourceRole, contents] of Object.entries(extracted)) {
      formatted += `\n### 来自 ${sourceRole}\n`;

      for (const item of contents) {
        if (item.description) {
          formatted += `\n**${item.description}**:\n`;
        }

        if (item.content) {
          if (Array.isArray(item.content)) {
            // 摘要或引用列表
            for (const entry of item.content) {
              if (entry.summary) {
                formatted += `> ${entry.summary}\n`;
              } else if (entry.content) {
                formatted += `\`${entry.file}\`:\n${entry.content.slice(0, 2000)}${entry.content.length > 2000 ? '\n[...]\n' : '\n'}`;
              }
            }
          } else if (typeof item.content === 'string') {
            formatted += `${item.content.slice(0, 2000)}${item.content.length > 2000 ? '\n[...]\n' : '\n'}`;
          }
        }
      }
    }

    return formatted;
  }
}

/**
 * 快速提炼单个文件（用于缓存未命中的情况）
 */
export async function quickExtract(filePath, maxTokens = 500) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const extractor = new ContentExtractor(null);
    return extractor.summarize(content, maxTokens);
  } catch {
    return null;
  }
}

/**
 * 提取 PRD 关键信息（专用函数）
 */
export async function extractPRDSummary(prdPath, maxTokens = 600) {
  try {
    const content = await fs.readFile(prdPath, 'utf-8');
    const extractor = new ContentExtractor(null);
    return extractor.summarize(content, maxTokens);
  } catch {
    return null;
  }
}

/**
 * 提取任务清单（专用函数）
 */
export async function extractTasksList(tasksPath) {
  try {
    const content = await fs.readFile(tasksPath, 'utf-8');
    
    // 匹配 Markdown 列表项
    const taskRegex = /^(?:- \s*(?:\[.\]\s*)?)?(\d+\.\d+)\s+(.+)$/gm;
    const tasks = [];
    let match;

    while ((match = taskRegex.exec(content)) !== null) {
      tasks.push({
        id: match[1],
        description: match[2].trim(),
        completed: content.includes(`[x] ${match[1]}`) || content.includes(`[X] ${match[1]}`)
      });
    }

    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      tasks
    };
  } catch {
    return { total: 0, completed: 0, tasks: [] };
  }
}
