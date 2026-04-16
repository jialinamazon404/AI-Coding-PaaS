/**
 * Figma OAuth 2 (authorization code) — token exchange, refresh, encrypted local store.
 * @see https://developers.figma.com/docs/rest-api/authentication/
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const FIGMA_AUTHORIZE = 'https://www.figma.com/oauth';
const FIGMA_TOKEN_URL = 'https://api.figma.com/v1/oauth/token';
const FIGMA_REFRESH_URL = 'https://api.figma.com/v1/oauth/refresh';

/** Default scope for reading file JSON used by figma-sync */
export const FIGMA_OAUTH_DEFAULT_SCOPE = 'file_content:read';

const oauthStates = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

function pruneStates() {
  const now = Date.now();
  for (const [k, v] of oauthStates) {
    if (v.expires < now) oauthStates.delete(k);
  }
}

export function createOAuthState(redirectAfter) {
  pruneStates();
  const state = crypto.randomBytes(24).toString('hex');
  oauthStates.set(state, {
    redirectAfter: redirectAfter || '',
    expires: Date.now() + STATE_TTL_MS
  });
  return state;
}

export function consumeOAuthState(state) {
  pruneStates();
  const entry = oauthStates.get(state);
  if (!entry || entry.expires < Date.now()) {
    oauthStates.delete(state);
    return null;
  }
  oauthStates.delete(state);
  return entry;
}

export function getFigmaOAuthStorePath() {
  const override = (process.env.FIGMA_OAUTH_STORE_PATH || '').trim();
  if (override) return override;
  return path.join(os.homedir(), '.config', 'devforge', 'figma-oauth.json');
}

function getEncryptionKey() {
  const secret = (process.env.FIGMA_CLIENT_SECRET || '').trim();
  if (!secret) {
    throw new Error('FIGMA_CLIENT_SECRET is required to encrypt stored OAuth refresh token');
  }
  return crypto.scryptSync(secret, 'devforge-figma-oauth-v1', 32);
}

function encryptString(plain) {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

function decryptString(b64) {
  const key = getEncryptionKey();
  const buf = Buffer.from(b64, 'base64');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

export async function saveOAuthRefreshToken(refreshToken) {
  const p = getFigmaOAuthStorePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  const payload = {
    v: 1,
    refreshEnc: encryptString(refreshToken),
    savedAt: new Date().toISOString()
  };
  await fs.writeFile(p, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function loadOAuthRefreshToken() {
  const p = getFigmaOAuthStorePath();
  try {
    const raw = await fs.readFile(p, 'utf-8');
    const j = JSON.parse(raw);
    if (!j?.refreshEnc) return null;
    return decryptString(j.refreshEnc);
  } catch {
    return null;
  }
}

export async function clearOAuthTokens() {
  const p = getFigmaOAuthStorePath();
  try {
    await fs.unlink(p);
  } catch {
    /* ignore */
  }
}

function basicAuthHeader() {
  const id = (process.env.FIGMA_CLIENT_ID || '').trim();
  const secret = (process.env.FIGMA_CLIENT_SECRET || '').trim();
  const b64 = Buffer.from(`${id}:${secret}`, 'utf8').toString('base64');
  return `Basic ${b64}`;
}

/**
 * @param {string} code
 * @param {string} redirectUri — must match authorize redirect_uri exactly
 */
export async function exchangeAuthorizationCode(code, redirectUri) {
  const body = new URLSearchParams({
    redirect_uri: redirectUri,
    code,
    grant_type: 'authorization_code'
  }).toString();

  const res = await fetch(FIGMA_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader()
    },
    body
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Figma token exchange ${res.status}: ${text.slice(0, 600)}`);
  }
  return JSON.parse(text);
}

export async function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    refresh_token: refreshToken
  }).toString();

  const res = await fetch(FIGMA_REFRESH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader()
    },
    body
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Figma token refresh ${res.status}: ${text.slice(0, 600)}`);
  }
  return JSON.parse(text);
}

export function getFigmaOAuthRedirectUri() {
  const explicit = (process.env.FIGMA_OAUTH_REDIRECT_URI || '').trim();
  if (explicit) return explicit;
  const base = (process.env.API_BASE || '').replace(/\/$/, '');
  if (base) return `${base}/api/figma/oauth/callback`;
  const port = process.env.PORT || 3000;
  return `http://127.0.0.1:${port}/api/figma/oauth/callback`;
}

export function buildFigmaAuthorizeUrl(state, scope = FIGMA_OAUTH_DEFAULT_SCOPE) {
  const clientId = (process.env.FIGMA_CLIENT_ID || '').trim();
  if (!clientId) throw new Error('FIGMA_CLIENT_ID is not set');
  const redirectUri = getFigmaOAuthRedirectUri();
  const u = new URL(FIGMA_AUTHORIZE);
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', redirectUri);
  u.searchParams.set('scope', scope);
  u.searchParams.set('state', state);
  u.searchParams.set('response_type', 'code');
  return u.toString();
}

export function figmaOAuthConfigured() {
  const id = (process.env.FIGMA_CLIENT_ID || '').trim();
  const secret = (process.env.FIGMA_CLIENT_SECRET || '').trim();
  return !!(id && secret);
}

export async function figmaOAuthConnected() {
  const p = getFigmaOAuthStorePath();
  try {
    await fs.access(p);
    return fsSync.existsSync(p);
  } catch {
    return false;
  }
}

/**
 * Resolve credentials for Figma REST: OAuth（若已授权）优先，否则 PAT。
 * @returns {Promise<{ mode: 'pat', token: string } | { mode: 'oauth', accessToken: string } | null>}
 */
export async function resolveFigmaRestAuth() {
  if (figmaOAuthConfigured()) {
    const refresh = await loadOAuthRefreshToken();
    if (refresh) {
      try {
        const data = await refreshAccessToken(refresh);
        if (data?.access_token) {
          return { mode: 'oauth', accessToken: data.access_token };
        }
      } catch (e) {
        const pat = (process.env.FIGMA_TOKEN || '').trim();
        if (pat) {
          return { mode: 'pat', token: pat };
        }
        throw e;
      }
    }
  }

  const pat = (process.env.FIGMA_TOKEN || '').trim();
  if (pat) return { mode: 'pat', token: pat };

  return null;
}
