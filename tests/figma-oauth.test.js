import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

test('saveOAuthRefreshToken and loadOAuthRefreshToken roundtrip', async () => {
  const tmp = path.join(os.tmpdir(), `devforge-figma-oauth-${Date.now()}.json`);
  process.env.FIGMA_CLIENT_SECRET = 'unit-test-client-secret-min-len';
  process.env.FIGMA_OAUTH_STORE_PATH = tmp;

  const { saveOAuthRefreshToken, loadOAuthRefreshToken, clearOAuthTokens } = await import(
    '../dashboard/server/figma-oauth.js'
  );

  await saveOAuthRefreshToken('my-refresh-token-value');
  const loaded = await loadOAuthRefreshToken();
  assert.equal(loaded, 'my-refresh-token-value');
  await clearOAuthTokens();
  try {
    await fs.access(tmp);
    assert.fail('store file should be removed');
  } catch {
    assert.ok(true);
  }

  delete process.env.FIGMA_OAUTH_STORE_PATH;
  delete process.env.FIGMA_CLIENT_SECRET;
});
