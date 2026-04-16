/**
 * Figma REST → workspace/product/figma-spec.md + ui-layout.md 引用块
 * 纯 fetch，无额外依赖。
 */

import fs from 'fs/promises';
import path from 'path';

const FIGMA_API = 'https://api.figma.com/v1';

const SYNC_BLOCK_START = '<!-- devforge:figma-sync -->\n';
const SYNC_BLOCK_END = '\n<!-- /devforge:figma-sync -->\n';

/** @param {string | undefined | null} url */
export function parseFigmaUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const m = trimmed.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  if (!m) return null;
  const fileKey = m[1];
  const q = trimmed.match(/[?&]node-id=([^&]+)/);
  let nodeIds = null;
  if (q) {
    const raw = decodeURIComponent(q[1].replace(/\+/g, ' '));
    const converted = raw.replace(/-/g, ':');
    nodeIds = [converted];
  }
  return { fileKey, nodeIds };
}

/**
 * @param {string | string[] | undefined | null} raw
 * @returns {string[]}
 */
export function normalizeNodeIds(raw) {
  if (raw == null || raw === '') return [];
  const arr = Array.isArray(raw) ? raw : String(raw).split(/[,;\s]+/);
  return arr.map(s => s.trim().replace(/-/g, ':')).filter(Boolean);
}

export function figmaUrlFromKey(fileKey, nodeIds) {
  if (!fileKey) return '';
  const base = `https://www.figma.com/design/${fileKey}`;
  if (nodeIds?.length === 1) {
    const nid = nodeIds[0].replace(/:/g, '-');
    return `${base}?node-id=${encodeURIComponent(nid)}`;
  }
  return base;
}

/**
 * @typedef {{ type: 'pat', secret: string } | { type: 'oauth', accessToken: string }} FigmaRestAuth
 */

/**
 * @param {string | FigmaRestAuth} auth — PAT string (legacy) or explicit auth object
 * @returns {FigmaRestAuth}
 */
export function normalizeFigmaAuth(auth) {
  if (typeof auth === 'string') {
    return { type: 'pat', secret: auth };
  }
  if (auth?.type === 'pat' && auth.secret) return auth;
  if (auth?.type === 'oauth' && auth.accessToken) return auth;
  throw new Error('Invalid Figma auth: expected PAT string or { type, secret|accessToken }');
}

/**
 * @param {string} url
 * @param {string | FigmaRestAuth} auth
 */
export async function figmaFetchJson(url, auth) {
  const a = normalizeFigmaAuth(auth);
  const headers =
    a.type === 'pat'
      ? { 'X-Figma-Token': a.secret }
      : { Authorization: `Bearer ${a.accessToken}` };
  const res = await fetch(url, {
    headers
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Figma API ${res.status}: ${text.slice(0, 800)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Figma API returned non-JSON body');
  }
}

function boxSize(node) {
  const b = node.absoluteBoundingBox;
  if (!b || typeof b.width !== 'number' || typeof b.height !== 'number') return null;
  return { w: Math.round(b.width), h: Math.round(b.height) };
}

/**
 * @param {object} node
 * @param {number} depth
 * @param {number} maxDepth
 * @param {{ lines: number, maxLines: number, parts: string[], indent: string }} ctx
 */
function walkNode(node, depth, maxDepth, ctx) {
  if (!node || ctx.lines >= ctx.maxLines) return;
  if (depth > maxDepth) return;

  const pad = '  '.repeat(depth);
  const sz = boxSize(node);
  const dim = sz ? ` ${sz.w}×${sz.h}` : '';
  ctx.parts.push(`${pad}- **${node.type || '?'}** \`${(node.name || '').replace(/`/g, "'")}\`${dim}`);
  ctx.lines++;

  const kids = Array.isArray(node.children) ? node.children : [];
  const cap = depth === 0 ? 80 : 40;
  for (const c of kids.slice(0, cap)) {
    walkNode(c, depth + 1, maxDepth, ctx);
    if (ctx.lines >= ctx.maxLines) return;
  }
}

/**
 * @param {object} doc
 * @param {{ maxDepth?: number, maxLines?: number }} opts
 */
export function summarizeDocumentTree(doc, opts = {}) {
  const maxDepth = opts.maxDepth ?? 5;
  const maxLines = opts.maxLines ?? 220;
  const ctx = { lines: 0, maxLines, parts: [] };
  walkNode(doc, 0, maxDepth, ctx);
  if (ctx.lines >= ctx.maxLines) {
    ctx.parts.push('\n_（树状结构已截断；可在 Dashboard 同步时填写 `nodeIds` 缩小范围。）_');
  }
  return ctx.parts.join('\n');
}

function collectSolidFills(node, out, budget) {
  if (!node || out.length >= budget) return;
  const fills = node.fills;
  if (Array.isArray(fills)) {
    for (const f of fills) {
      if (f?.visible === false) continue;
      if (f?.type === 'SOLID' && f.color && out.length < budget) {
        const { r, g, b, a = 1 } = f.color;
        const hex = rgbaToHex(r, g, b, a);
        out.push({ hex, name: node.name, type: node.type });
      }
    }
  }
  if (Array.isArray(node.children)) {
    for (const c of node.children.slice(0, 60)) {
      collectSolidFills(c, out, budget);
      if (out.length >= budget) return;
    }
  }
}

function rgbaToHex(r, g, b, a) {
  const R = Math.round(r * 255);
  const G = Math.round(g * 255);
  const B = Math.round(b * 255);
  const A = a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : '';
  const hx = n => n.toString(16).padStart(2, '0');
  return `#${hx(R)}${hx(G)}${hx(B)}${A}`;
}

/**
 * @param {object} root
 */
export function summarizeColors(root, max = 24) {
  const rows = [];
  collectSolidFills(root, rows, max);
  if (!rows.length) return '_（未采集到 SOLID 填充；可能为组件库或远程样式。）_';
  const lines = ['| 颜色 | 示例节点 | 类型 |', '| --- | --- | --- |'];
  for (const r of rows) {
    const name = String(r.name || '').replace(/\|/g, '/').slice(0, 60);
    lines.push(`| \`${r.hex}\` | ${name} | ${r.type} |`);
  }
  return lines.join('\n');
}

/**
 * @param {object} params
 * @param {string} params.workspacePath
 * @param {string} params.fileKey
 * @param {string[]} [params.nodeIds]
 * @param {string} [params.figmaUrl]
 * @param {string | FigmaRestAuth} [params.token] — PAT string (legacy)
 * @param {FigmaRestAuth} [params.auth] — overrides token when set
 */
export async function syncFigmaToSprint(params) {
  const { workspacePath, fileKey } = params;
  const auth = params.auth ?? params.token;
  if (auth == null) {
    throw new Error('syncFigmaToSprint: missing token or auth');
  }
  const nodeIds = normalizeNodeIds(params.nodeIds);
  const figmaUrl =
    (params.figmaUrl && String(params.figmaUrl).trim()) || figmaUrlFromKey(fileKey, nodeIds);

  let document;
  let fileName = fileKey;
  let version = '';

  if (nodeIds.length) {
    const ids = nodeIds.map(id => encodeURIComponent(id)).join(',');
    const url = `${FIGMA_API}/files/${encodeURIComponent(fileKey)}/nodes?ids=${ids}&depth=5`;
    const data = await figmaFetchJson(url, auth);
    fileName = data.name || fileName;
    version = data.version || '';
    const roots = [];
    if (data.nodes && typeof data.nodes === 'object') {
      for (const id of nodeIds) {
        const entry =
          data.nodes[id] ||
          data.nodes[id.replace(/:/g, '-')] ||
          data.nodes[decodeURIComponent(id)] ||
          Object.values(data.nodes).find((v) => v?.document?.id === id);
        if (entry?.document) roots.push(entry.document);
      }
    }
    if (!roots.length) {
      throw new Error('Figma nodes 响应中未找到请求的 document（请检查 node id 是否与文件一致）');
    }
    document = {
      type: 'DOCUMENT',
      name: 'Selected nodes',
      children: roots
    };
  } else {
    const url = `${FIGMA_API}/files/${encodeURIComponent(fileKey)}?depth=4`;
    const data = await figmaFetchJson(url, auth);
    document = data.document;
    fileName = data.name || fileName;
    version = data.version || '';
  }

  const treeMd = summarizeDocumentTree(document, { maxDepth: 5, maxLines: 240 });
  const colorMd = summarizeColors(document, 20);

  const productDir = path.join(workspacePath, 'product');
  await fs.mkdir(productDir, { recursive: true });

  const scope = nodeIds.length ? nodeIds.join(', ') : 'full file (depth capped)';
  const frontMatter = `---
figmaFileKey: "${fileKey}"
figmaUrl: "${figmaUrl.replace(/"/g, '\\"')}"
syncedAt: "${new Date().toISOString()}"
figmaVersion: "${String(version).replace(/"/g, '\\"')}"
nodeScope: "${scope.replace(/"/g, '\\"')}"
---

`;

  const body = `# Figma 结构化摘要

> 文件：**${fileName}** · Key: \`${fileKey}\`  
> 同步范围：${nodeIds.length ? `节点 \`${scope}\`` : '整文件（API depth 限制，树可能不完整）'}  
> 设计入口：${figmaUrl ? `[Figma](${figmaUrl})` : '（未提供 URL）'}

## Frame / 组件树（截断展示）

${treeMd}

## 颜色线索（部分 SOLID）

${colorMd}

## 使用说明

- 与 \`product/ui-layout.md\` **交叉阅读**：本文件偏结构与尺寸；产品语言与流程以 ui-layout 为准。
- 若两者冲突，实现时以 **本文件中的层级与尺寸** 为优先依据，并在提交说明或 PR 中写明取舍。
`;

  const specPath = path.join(productDir, 'figma-spec.md');
  await fs.writeFile(specPath, frontMatter + body, 'utf-8');

  await mergeUiLayoutFigmaBlock(productDir, figmaUrl);

  return {
    figmaUrl,
    fileName,
    fileKey,
    nodeIds,
    paths: {
      figmaSpec: specPath,
      uiLayout: path.join(productDir, 'ui-layout.md')
    }
  };
}

/**
 * @param {string} productDir
 * @param {string} figmaUrl
 */
export async function mergeUiLayoutFigmaBlock(productDir, figmaUrl) {
  const uiPath = path.join(productDir, 'ui-layout.md');
  let existing = '';
  try {
    existing = await fs.readFile(uiPath, 'utf-8');
  } catch {
    existing =
      '# 界面布局与交互\n\n> 本文件由 Figma 同步自动创建占位；请产品角色补充页面说明与交互流程。\n';
  }

  const stripped = stripFigmaSyncBlock(existing);
  const linkLine = figmaUrl
    ? `- Figma 链接：[打开设计稿](${figmaUrl})`
    : '- Figma 链接：（未提供；可在 Dashboard「同步 Figma」时粘贴完整 Figma URL）';
  const block =
    SYNC_BLOCK_START +
    '> **设计稿对齐（自动维护，请勿删除本标记块）**  \n' +
    '> ' +
    linkLine +
    '  \n' +
    '> - **结构化摘要**（Frame 树、尺寸、颜色线索）见同目录 [`figma-spec.md`](./figma-spec.md)。\n' +
    '> - 实现 UI 时请与 **figma-spec** 交叉核对；与下文产品描述冲突时，以 **figma-spec 的结构与尺寸** 为准，并在说明中记录取舍。\n' +
    SYNC_BLOCK_END;

  await fs.writeFile(uiPath, block + stripped, 'utf-8');
}

/** @param {string} content */
export function stripFigmaSyncBlock(content) {
  const re = /<!--\s*devforge:figma-sync\s*-->[\s\S]*?<!--\s*\/devforge:figma-sync\s*-->\n?/g;
  return String(content || '').replace(re, '').trimStart();
}
