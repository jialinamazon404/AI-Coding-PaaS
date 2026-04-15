import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import net from 'net';

const LOOPBACK_HOSTS = new Set(['0.0.0.0', '127.0.0.1', 'localhost']);

function fileExists(targetPath) {
  return fsSync.existsSync(targetPath);
}

async function readJsonIfExists(filePath) {
  if (!fileExists(filePath)) return null;
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function collectBackendMockFiles(projectRoot) {
  const candidates = [
    'src/backend/openapi.yaml',
    'src/backend/openapi.yml',
    'src/backend/openapi.json',
    'src/backend/README.md',
    'backend/openapi.yaml',
    'backend/openapi.yml',
    'backend/openapi.json',
    'backend/README.md'
  ];
  return candidates.filter((relPath) => fileExists(path.join(projectRoot, relPath))).sort();
}

function detectFrameworkFromScripts(scripts = {}) {
  const dev = String(scripts.dev || '').trim();
  if (!dev) return null;
  if (/(^|\s)vite(\s|$)/.test(dev)) return 'vite';
  if (/(^|\s)next(\s|$)/.test(dev)) return 'next';
  if (/react-scripts/.test(dev)) return 'react-scripts';
  if (/vue-cli-service/.test(dev)) return 'vue-cli';
  return 'npm-dev';
}

function buildPreviewCommand({ framework, preferredPort }) {
  const port = String(preferredPort);
  if (framework === 'vite') {
    return {
      command: 'npm',
      args: ['run', 'dev', '--', '--host', '0.0.0.0', '--port', port]
    };
  }
  if (framework === 'next') {
    return {
      command: 'npm',
      args: ['run', 'dev', '--', '--hostname', '0.0.0.0', '--port', port]
    };
  }
  return {
    command: 'npm',
    args: ['run', 'dev']
  };
}

function getFrontendCandidates(projectRoot) {
  return [
    path.join(projectRoot, 'src', 'frontend'),
    path.join(projectRoot, 'frontend')
  ];
}

function getBackendCandidates(projectRoot) {
  return [
    path.join(projectRoot, 'src', 'backend'),
    path.join(projectRoot, 'backend')
  ];
}

function detectBackendFramework({ backendPath, packageJson }) {
  if (fileExists(path.join(backendPath, 'pom.xml'))) return 'spring-boot';
  if (packageJson) {
    const scripts = packageJson.scripts || {};
    const start = String(scripts.dev || scripts.start || '').trim();
    if (start.includes('nest')) return 'nest';
    if (start.includes('express')) return 'express';
    return 'node';
  }
  if (fileExists(path.join(backendPath, 'requirements.txt'))) return 'python';
  return 'unknown';
}

function buildBackendCommand({ framework, packageJson, preferredPort }) {
  const port = String(preferredPort);
  if (framework === 'spring-boot') {
    return {
      command: 'mvn',
      args: ['spring-boot:run', `-Dspring-boot.run.arguments=--server.port=${port}`]
    };
  }
  if (packageJson) {
    const scripts = packageJson.scripts || {};
    if (scripts.dev) {
      return {
        command: 'npm',
        args: ['run', 'dev', '--', '--port', port]
      };
    }
    if (scripts.start) {
      return {
        command: 'npm',
        args: ['run', 'start', '--', '--port', port]
      };
    }
  }
  if (framework === 'python' && fileExists(path.join(packageJson?.backendPath || '', 'app.py'))) {
    return {
      command: 'python',
      args: ['app.py']
    };
  }
  return null;
}

export function buildPreviewUrl({ host = '0.0.0.0', port, hostname }) {
  const safeHost = LOOPBACK_HOSTS.has(String(host)) ? (hostname || '127.0.0.1') : host;
  return `http://${safeHost}:${port}`;
}

export async function pickAvailablePort(preferredPort = 4173, maxAttempts = 20) {
  for (let offset = 0; offset < maxAttempts; offset++) {
    const port = Number(preferredPort) + offset;
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => resolve(false));
      server.once('listening', () => {
        server.close(() => resolve(true));
      });
      server.listen(port, '0.0.0.0');
    });
    if (available) return port;
  }
  throw new Error(`No available preview port found from ${preferredPort}`);
}

export async function detectSprintPreviewTarget({ projectRoot, hostname, preferredPort = 4173 }) {
  const result = await detectSprintPreviewTargets({ projectRoot, hostname, frontendPreferredPort: preferredPort });
  return {
    ...result,
    hasFrontend: result.hasFrontend,
    hasBackend: result.hasBackend,
    backendMockFiles: result.backendMockFiles
  };
}

export async function detectSprintPreviewTargets({
  projectRoot,
  hostname,
  frontendPreferredPort = 4173,
  backendPreferredPort = 8080
}) {
  const backendMockFiles = collectBackendMockFiles(projectRoot);
  const frontendCandidates = getFrontendCandidates(projectRoot);
  const backendCandidates = getBackendCandidates(projectRoot);
  let frontend = null;
  let backend = null;

  for (const candidate of frontendCandidates) {
    if (!fileExists(candidate)) continue;
    const pkg = await readJsonIfExists(path.join(candidate, 'package.json'));
    if (!pkg) {
      frontend = {
        hasFrontend: false,
        frontendPath: candidate,
        reason: 'frontend package.json not found'
      };
      break;
    }
    const framework = detectFrameworkFromScripts(pkg.scripts || {});
    if (!framework) {
      frontend = {
        hasFrontend: false,
        frontendPath: candidate,
        reason: 'frontend dev script not found'
      };
      break;
    }
    const port = await pickAvailablePort(frontendPreferredPort);
    const command = buildPreviewCommand({ framework, preferredPort: port });
    frontend = {
      hasFrontend: true,
      frontendPath: candidate,
      framework,
      port,
      command: command.command,
      args: command.args,
      url: buildPreviewUrl({ host: '0.0.0.0', port, hostname })
    };
    break;
  }

  for (const candidate of backendCandidates) {
    if (!fileExists(candidate)) continue;
    const pkg = await readJsonIfExists(path.join(candidate, 'package.json'));
    const framework = detectBackendFramework({ backendPath: candidate, packageJson: pkg });
    const command = buildBackendCommand({
      framework,
      packageJson: pkg ? { ...pkg, backendPath: candidate } : null,
      preferredPort: backendPreferredPort
    });
    if (!command) {
      backend = {
        hasBackend: false,
        backendPath: candidate,
        reason: 'backend start script not found'
      };
      break;
    }
    const port = await pickAvailablePort(backendPreferredPort);
    backend = {
      hasBackend: true,
      backendPath: candidate,
      framework,
      port,
      command: command.command,
      args: command.args,
      baseUrl: buildPreviewUrl({ host: '0.0.0.0', port, hostname }),
      healthUrl: buildPreviewUrl({ host: '0.0.0.0', port, hostname }) + '/health'
    };
    break;
  }

  if (!frontend) {
    frontend = {
      hasFrontend: false,
      frontendPath: null,
      reason: 'frontend app not found'
    };
  }
  if (!backend) {
    backend = {
      hasBackend: false,
      backendPath: null,
      reason: backendMockFiles.length > 0 ? 'backend app not found' : 'backend app not found'
    };
  }

  return {
    hasFrontend: !!frontend.hasFrontend,
    hasBackend: !!backend.hasBackend || backendMockFiles.length > 0,
    backendMockFiles,
    reason: !frontend.hasFrontend ? frontend.reason : '',
    frontendPath: frontend.frontendPath || null,
    framework: frontend.framework || null,
    port: frontend.port || null,
    command: frontend.command || null,
    args: frontend.args || [],
    url: frontend.url || null,
    targets: {
      frontend,
      backend: {
        ...backend,
        hasBackend: !!backend.hasBackend
      }
    }
  };
}
