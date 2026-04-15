import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

import {
  buildPreviewUrl,
  detectSprintPreviewTargets,
  detectSprintPreviewTarget,
  pickAvailablePort
} from '../dashboard/server/preview-target.js';

async function withTempProject(structure, run) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'devforge-preview-'));
  try {
    await createTree(tempDir, structure);
    return await run(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function createTree(baseDir, structure) {
  for (const [relPath, value] of Object.entries(structure)) {
    const absPath = path.join(baseDir, relPath);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, typeof value === 'string' ? value : JSON.stringify(value, null, 2));
  }
}

test('detectSprintPreviewTarget prefers generated src/frontend vite app and includes backend mock files', async () => {
  await withTempProject(
    {
      'src/frontend/package.json': {
        name: 'preview-app',
        scripts: { dev: 'vite', build: 'vite build' }
      },
      'src/backend/openapi.yaml': 'openapi: 3.0.0',
      'src/backend/README.md': '# API'
    },
    async (projectDir) => {
      const result = await detectSprintPreviewTarget({
        projectRoot: projectDir,
        hostname: '192.168.1.20',
        preferredPort: 4173
      });

      assert.equal(result.hasFrontend, true);
      assert.equal(result.framework, 'vite');
      assert.equal(result.command, 'npm');
      assert.equal(result.args.slice(0, 6).join(' '), 'run dev -- --host 0.0.0.0 --port');
      const selectedPort = Number(result.args[6]);
      assert.ok(Number.isInteger(selectedPort));
      assert.ok(selectedPort >= 4173);
      assert.equal(result.frontendPath, path.join(projectDir, 'src', 'frontend'));
      assert.equal(result.hasBackend, true);
      assert.deepEqual(result.backendMockFiles, ['src/backend/README.md', 'src/backend/openapi.yaml']);
      assert.equal(result.url, `http://192.168.1.20:${selectedPort}`);
    }
  );
});

test('detectSprintPreviewTarget falls back to project frontend directory and reports unsupported app when no package exists', async () => {
  await withTempProject(
    {
      'frontend/src/main.js': 'console.log("hello")',
      'backend/README.md': '# backend only'
    },
    async (projectDir) => {
      const result = await detectSprintPreviewTarget({
        projectRoot: projectDir,
        hostname: '10.0.0.8',
        preferredPort: 4180
      });

      assert.equal(result.hasFrontend, false);
      assert.equal(result.frontendPath, path.join(projectDir, 'frontend'));
      assert.match(result.reason || '', /package\.json/i);
      assert.equal(result.hasBackend, true);
      assert.deepEqual(result.backendMockFiles, ['backend/README.md']);
    }
  );
});

test('buildPreviewUrl rewrites 0.0.0.0 host to browser hostname', () => {
  assert.equal(buildPreviewUrl({ host: '0.0.0.0', port: 4173, hostname: '192.168.0.12' }), 'http://192.168.0.12:4173');
  assert.equal(buildPreviewUrl({ host: '127.0.0.1', port: 4173, hostname: '192.168.0.12' }), 'http://192.168.0.12:4173');
  assert.equal(buildPreviewUrl({ host: '10.0.0.9', port: 4173, hostname: '192.168.0.12' }), 'http://10.0.0.9:4173');
});

test('pickAvailablePort returns preferred port when it is free', async () => {
  const port = await pickAvailablePort(4197);
  assert.equal(typeof port, 'number');
  assert.ok(port >= 4197);
});

test('detectSprintPreviewTargets returns frontend and backend targets when backend pom.xml exists', async () => {
  await withTempProject(
    {
      'src/frontend/package.json': {
        name: 'preview-app',
        scripts: { dev: 'vite' }
      },
      'backend/pom.xml': '<project></project>'
    },
    async (projectDir) => {
      const result = await detectSprintPreviewTargets({
        projectRoot: projectDir,
        hostname: '192.168.1.88',
        frontendPreferredPort: 4300,
        backendPreferredPort: 8088
      });
      assert.equal(result.hasFrontend, true);
      assert.equal(result.targets.frontend.hasFrontend, true);
      assert.equal(result.targets.frontend.framework, 'vite');
      assert.equal(result.targets.backend.hasBackend, true);
      assert.equal(result.targets.backend.framework, 'spring-boot');
      assert.equal(result.targets.backend.command, 'mvn');
      assert.ok(Array.isArray(result.targets.backend.args));
    }
  );
});
