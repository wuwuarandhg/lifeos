/**
 * lifeOS — Auth Service
 *
 * Single-user passphrase authentication for a self-hosted app.
 *
 * Design:
 * - Passphrase configured via AUTH_SECRET env var
 * - Supports both plaintext and pre-hashed (bcrypt) values
 * - Sessions are HMAC-SHA256 signed tokens stored in httpOnly cookies
 * - Session verification is Edge-compatible (uses Web Crypto API)
 * - Passphrase verification uses bcryptjs (Node.js only — runs in server actions)
 */

import { compareSync, hashSync } from 'bcryptjs';
import { cookies } from 'next/headers';

// ============================================================
// Constants
// ============================================================

const SESSION_COOKIE_NAME = 'lifeos-session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// ============================================================
// Secret management
// ============================================================

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret === 'changeme' || secret === 'changeme-to-a-strong-passphrase') {
    // In development, allow a weak default. In production, this is a problem.
    if (process.env.NODE_ENV === 'production') {
      console.error('[lifeOS] CRITICAL: AUTH_SECRET is not set or is using the default value. Set a strong passphrase.');
    }
    return secret || 'lifeos-dev-default';
  }
  return secret;
}

/**
 * Check if auth is enabled. If AUTH_SECRET is empty or unset, auth is disabled.
 * This allows running without auth in local dev if explicitly intended.
 */
export function isAuthEnabled(): boolean {
  const secret = process.env.AUTH_SECRET;
  return !!secret && secret.length > 0;
}

/**
 * Check if the configured secret looks like a bcrypt hash.
 */
function isBcryptHash(value: string): boolean {
  return /^\$2[aby]?\$\d{1,2}\$.{53}$/.test(value);
}

// ============================================================
// Passphrase verification (Node.js runtime only)
// ============================================================

/**
 * Verify a user-supplied passphrase against the configured AUTH_SECRET.
 *
 * Supports two modes:
 * 1. AUTH_SECRET is a bcrypt hash → compare input against hash
 * 2. AUTH_SECRET is plaintext → hash input and compare (constant-time via bcrypt)
 *
 * Returns true if the passphrase matches.
 */
export function verifyPassphrase(input: string): boolean {
  const secret = getAuthSecret();

  if (isBcryptHash(secret)) {
    // AUTH_SECRET is already a bcrypt hash — compare directly
    return compareSync(input, secret);
  }

  // AUTH_SECRET is plaintext — use bcrypt compare for timing safety
  // Hash the stored secret and compare (this is slightly unusual but ensures
  // constant-time comparison without requiring the user to pre-hash)
  const hash = hashSync(secret, 10);
  return compareSync(input, hash);
}

// ============================================================
// Session token creation & verification (HMAC-SHA256)
// ============================================================

/**
 * Get a signing key derived from AUTH_SECRET for HMAC operations.
 * Uses the raw secret bytes — this is only for session token signing,
 * not for passphrase storage.
 */
async function getSigningKey(): Promise<CryptoKey> {
  const secret = getAuthSecret();
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(secret);

  return crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Create a signed session token.
 *
 * Payload: base64url(JSON { iat, exp })
 * Signature: HMAC-SHA256(payload, secret)
 * Token: payload.signature
 */
export async function createSessionToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + SESSION_MAX_AGE,
  };

  const payloadStr = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const key = await getSigningKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payloadStr)
  );

  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${payloadStr}.${signature}`;
}

/**
 * Verify a session token. Returns true if valid and not expired.
 *
 * This function is Edge-compatible — uses only Web Crypto API.
 */
export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return false;

    // Verify signature
    const key = await getSigningKey();
    const encoder = new TextEncoder();
    const sigBytes = Uint8Array.from(
      atob(signature.replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadStr)
    );

    if (!valid) return false;

    // Check expiration
    const payloadJSON = atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJSON);
    const now = Math.floor(Date.now() / 1000);

    return payload.exp > now;
  } catch {
    return false;
  }
}

// ============================================================
// Cookie helpers (used in server actions)
// ============================================================

/**
 * Set the session cookie after successful login.
 */
export async function setSessionCookie(): Promise<void> {
  const token = await createSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear the session cookie (logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}

/**
 * Get the current session token from cookies.
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

/**
 * Check if the current request is authenticated.
 * This is for use in server actions and server components.
 */
export async function isAuthenticated(): Promise<boolean> {
  if (!isAuthEnabled()) return true; // Auth disabled = always authenticated
  const token = await getSessionToken();
  if (!token) return false;
  return verifySessionToken(token);
}

/** Cookie name exported for middleware use */
export const COOKIE_NAME = SESSION_COOKIE_NAME;
