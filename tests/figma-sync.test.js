import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseFigmaUrl,
  normalizeNodeIds,
  figmaUrlFromKey,
  stripFigmaSyncBlock,
  summarizeDocumentTree,
  normalizeFigmaAuth
} from '../dashboard/server/figma-sync.js';

test('parseFigmaUrl extracts file key and converts node-id dashes to colons', () => {
  const u =
    'https://www.figma.com/design/AbCdEfGh123/X?type=design&node-id=12-34&mode=dev';
  const p = parseFigmaUrl(u);
  assert.ok(p);
  assert.equal(p.fileKey, 'AbCdEfGh123');
  assert.deepEqual(p.nodeIds, ['12:34']);
});

test('parseFigmaUrl supports /file/ URLs', () => {
  const p = parseFigmaUrl('https://www.figma.com/file/ZZZ99/foo');
  assert.ok(p);
  assert.equal(p.fileKey, 'ZZZ99');
  assert.equal(p.nodeIds, null);
});

test('normalizeNodeIds splits and converts hyphens in ids', () => {
  assert.deepEqual(normalizeNodeIds('1:2, 3-4'), ['1:2', '3:4']);
  assert.deepEqual(normalizeNodeIds(['5:6']), ['5:6']);
});

test('figmaUrlFromKey builds design URL with node-id when single node', () => {
  assert.equal(
    figmaUrlFromKey('ABC', ['1:23']),
    'https://www.figma.com/design/ABC?node-id=1-23'
  );
});

test('stripFigmaSyncBlock removes marked block', () => {
  const raw =
    '<!-- devforge:figma-sync -->\nhello\n<!-- /devforge:figma-sync -->\n\n# Rest';
  assert.equal(stripFigmaSyncBlock(raw).trim(), '# Rest');
});

test('normalizeFigmaAuth accepts PAT string or objects', () => {
  assert.equal(normalizeFigmaAuth('patval').type, 'pat');
  assert.equal(normalizeFigmaAuth('patval').secret, 'patval');
  assert.equal(normalizeFigmaAuth({ type: 'oauth', accessToken: 'x' }).accessToken, 'x');
});

test('summarizeDocumentTree walks children', () => {
  const doc = {
    type: 'FRAME',
    name: 'Root',
    absoluteBoundingBox: { width: 100, height: 50 },
    children: [{ type: 'TEXT', name: 'Title', absoluteBoundingBox: { width: 10, height: 10 } }]
  };
  const md = summarizeDocumentTree(doc, { maxDepth: 3, maxLines: 50 });
  assert.match(md, /FRAME.*Root/);
  assert.match(md, /TEXT.*Title/);
});
