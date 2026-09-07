import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sandboxGet, SandboxRequestError } from '../src/core/http/sandbox.gateway';
import { invalidateToken } from '../src/core/auth/token.service';
const originalFetch = globalThis.fetch;
function configure() {
  // Synthetic credentials only; every request is intercepted by the test.
  process.env.SANDBOX_CLIENT_ID = 'test-client'; process.env.SANDBOX_CLIENT_SECRET = 'test-secret'; process.env.SANDBOX_USERNAME = 'test-user'; process.env.SANDBOX_PASSWORD = 'test-password'; invalidateToken();
}
test('gateway keeps credentials in token exchange and retries one 401', async () => {
  configure(); let tokens = 0, reads = 0;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith('/oauth/token')) { tokens++; assert.equal(init?.method, 'POST'); assert.ok(new Headers(init?.headers).get('Authorization')?.startsWith('Basic ')); return Response.json({ access_token: `test-token-${tokens}`, expires_in: 300 }); }
    reads++; assert.equal(new Headers(init?.headers).get('Authorization'), `Bearer test-token-${tokens}`);
    assert.ok(!url.includes('test-secret')); assert.ok(url.endsWith('/api/sandbox/zones?limit=200'));
    return reads === 1 ? new Response(null, { status: 401 }) : Response.json([{ zoneCode: 'Z01' }]);
  };
  try { assert.deepEqual(await sandboxGet('zones', '?limit=200'), [{ zoneCode: 'Z01' }]); assert.equal(tokens, 2); assert.equal(reads, 2); } finally { globalThis.fetch = originalFetch; invalidateToken(); }
});
test('rate limit metadata is preserved without automatic request retries', async () => {
  configure(); let reads = 0;
  globalThis.fetch = async input => String(input).endsWith('/oauth/token') ? Response.json({ access_token: 'test-token', expires_in: 300 }) : (reads++, Response.json({ code: 'SANDBOX_RATE_LIMITED' }, { status: 429, headers: { 'Retry-After': '12' } }));
  try { await assert.rejects(() => sandboxGet('zones'), (e: unknown) => e instanceof SandboxRequestError && e.status === 429 && e.retryAfterSeconds === 12 && e.code === 'SANDBOX_RATE_LIMITED'); assert.equal(reads, 1); } finally { globalThis.fetch = originalFetch; invalidateToken(); }
});
test('concurrent API reads share one token exchange', async () => {
  configure(); let tokens = 0;
  globalThis.fetch = async input => { if (String(input).endsWith('/oauth/token')) { tokens++; await new Promise(resolve => setTimeout(resolve, 5)); return Response.json({ access_token: 'test-token', expires_in: 300 }); } return Response.json([]); };
  try { await Promise.all([sandboxGet('zones'), sandboxGet('license-types')]); assert.equal(tokens, 1); } finally { globalThis.fetch = originalFetch; invalidateToken(); }
});
