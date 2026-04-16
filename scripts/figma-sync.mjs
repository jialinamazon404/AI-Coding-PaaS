#!/usr/bin/env node
/**
 * CLI：将 Figma 文件同步到 workspace/<sprintId>/product/figma-spec.md
 *
 * 鉴权（二选一）：FIGMA_TOKEN（PAT），或 FIGMA_CLIENT_ID + FIGMA_CLIENT_SECRET + 已完成 OAuth（本机 ~/.config/devforge/figma-oauth.json）
 * 可选：FIGMA_FILE_KEY、FIGMA_NODE_IDS（逗号分隔，node id 可用 1:2 或 1-2）
 *
 * 用法：
 *   node scripts/figma-sync.mjs --sprint <sprintId> --file-key <key> [--node-ids "1:2,3:4"] [--url <figmaUrl>]
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { syncFigmaToSprint, parseFigmaUrl, normalizeNodeIds } from '../dashboard/server/figma-sync.js';
import { resolveFigmaRestAuth } from '../dashboard/server/figma-oauth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function getArg(name, short) {
  const long = `--${name}`;
  const ix = process.argv.findIndex((a, i) => a === long || a === short);
  if (ix === -1) return undefined;
  return process.argv[ix + 1];
}

const sprintId = getArg('sprint', '-s');
const fileKeyArg = getArg('file-key', '-k');
const figmaUrl = getArg('url', '-u');
const nodeIdsArg = getArg('node-ids', '-n');

if (!sprintId) {
  console.error(
    'Usage: node scripts/figma-sync.mjs --sprint <sprintId> [--file-key <key>] [--url <figmaUrl>] [--node-ids "1:2,3:4"]\n' +
      'Env: FIGMA_TOKEN (PAT) 或 OAuth 存储 + FIGMA_CLIENT_ID/SECRET；可选 FIGMA_FILE_KEY / FIGMA_NODE_IDS'
  );
  process.exit(1);
}

let restAuth;
try {
  restAuth = await resolveFigmaRestAuth();
} catch (e) {
  console.error(e.message || e);
  process.exit(1);
}
if (!restAuth) {
  console.error('No Figma auth: set FIGMA_TOKEN or complete OAuth (FIGMA_CLIENT_ID/SECRET + figma-oauth.json).');
  process.exit(1);
}
const auth =
  restAuth.mode === 'pat'
    ? { type: 'pat', secret: restAuth.token }
    : { type: 'oauth', accessToken: restAuth.accessToken };

let fileKey = (fileKeyArg || process.env.FIGMA_FILE_KEY || '').trim();
let nodeIds = normalizeNodeIds(nodeIdsArg || process.env.FIGMA_NODE_IDS);

if (figmaUrl) {
  const parsed = parseFigmaUrl(figmaUrl.trim());
  if (parsed) {
    fileKey = fileKey || parsed.fileKey;
    if (parsed.nodeIds?.length) {
      nodeIds = [...new Set([...nodeIds, ...parsed.nodeIds])];
    }
  }
}

if (!fileKey) {
  console.error('Missing file key: pass --file-key or set FIGMA_FILE_KEY, or use --url with a Figma file URL.');
  process.exit(1);
}

const workspacePath = path.join(ROOT, 'workspace', sprintId);

const out = await syncFigmaToSprint({
  workspacePath,
  fileKey,
  nodeIds,
  figmaUrl: figmaUrl?.trim() || undefined,
  auth
});

console.log(JSON.stringify(out, null, 2));
