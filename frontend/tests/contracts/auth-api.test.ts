// @vitest-environment node
// Consumer contract tests (Pact) for the auth APIs used by the login and
// register pages. These exercise the real client code in
// src/services/passkey.ts against a Pact mock provider and generate the
// contract files in pacts/ that get published to the Pact Broker and
// verified by the auth (Go) provider.
import path from 'node:path';

import { MatchersV3 as M, PactV4 } from '@pact-foundation/pact';
import { describe, expect, it, vi } from 'vitest';

import { assertion, attestation, params } from './fixtures';

vi.mock('@simplewebauthn/browser', async () => {
  const f = await import('./fixtures.js');
  return {
    startRegistration: vi.fn(async () => f.attestation),
    startAuthentication: vi.fn(async () => f.assertion),
  };
});

// Session ids are fixed so the provider states can seed the matching session.
const REG_SESSION = 'pact-reg-session';
const LOGIN_SESSION = 'pact-login-session';
const UNKNOWN_SESSION = 'pact-unknown-session';

const setCookie = (sid: string) =>
  M.regex(
    /^sid=[A-Za-z0-9_=-]+; Path=\/; Max-Age=3600; HttpOnly; SameSite=Strict$/,
    `sid=${sid}; Path=/; Max-Age=3600; HttpOnly; SameSite=Strict`,
  );

const b64url = /^[A-Za-z0-9_-]+$/;

const newProvider = () =>
  new PactV4({
    consumer: 'frontend',
    provider: 'auth',
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
  });

// The browser keeps the `sid` cookie between the start/finish calls; node
// fetch does not, so emulate the cookie jar the contract relies on.
function installCookieJar(initial: Record<string, string> = {}) {
  const jar = new Map<string, string>(Object.entries(initial));
  const realFetch = globalThis.fetch;

  vi.stubGlobal(
    'fetch',
    async (input: Parameters<typeof realFetch>[0], init: RequestInit = {}) => {
      const headers = new Headers(init.headers);
      if (jar.size > 0 && !headers.has('Cookie')) {
        headers.set('Cookie', [...jar].map(([k, v]) => `${k}=${v}`).join('; '));
      }
      const response = await realFetch(input, { ...init, headers });
      for (const cookie of response.headers.getSetCookie()) {
        const [pair] = cookie.split(';');
        const eq = pair.indexOf('=');
        jar.set(pair.slice(0, eq), pair.slice(eq + 1));
      }
      return response;
    },
  );

  return () => vi.unstubAllGlobals();
}

async function importPasskeyService(baseUrl: string) {
  vi.stubEnv('VITE_AUTH_BACKEND_URL', baseUrl);
  vi.resetModules();
  return import('../../src/services/passkey.js');
}

describe('auth API contract (login + register pages)', () => {
  it('register: start returns creation options, finish accepts the attestation', async () => {
    const teardown = installCookieJar();
    try {
      const provider = newProvider();

      const first = provider
        .addInteraction()
        .given('the auth service is available')
        .uponReceiving('a request to start registration for Alice')
        .withRequest('POST', '/api/passkey/registerStart', (b) => {
          b.headers({ 'Content-Type': 'application/json' });
          b.jsonBody({ name: 'Alice' });
        })
        .willRespondWith(200, (b) => {
          b.headers({
            'Content-Type': 'application/json',
            'Set-Cookie': setCookie(REG_SESSION),
          });
          b.jsonBody({
            publicKey: {
              rp: {
                name: M.string('Gia Pha'),
                id: M.regex(/^[a-z0-9.-]+$/, params.rpId),
              },
              user: {
                name: M.string('Alice'),
                displayName: M.string('Alice'),
                id: M.regex(b64url, params.userId),
              },
              challenge: M.regex(b64url, params.challenge),
              pubKeyCredParams: M.atLeastOneLike({
                type: M.string('public-key'),
                alg: M.integer(-7),
              }),
              timeout: M.integer(300000),
              authenticatorSelection: {
                residentKey: M.string('required'),
              },
              extensions: { credProps: M.boolean(true) },
            },
          });
        });

      provider
        .addInteraction()
        .given('a registration session exists')
        .uponReceiving(
          'a request to finish registration with a valid attestation',
        )
        .withRequest('POST', '/api/passkey/registerFinish', (b) => {
          b.headers({
            'Content-Type': 'application/json',
            Cookie: `sid=${REG_SESSION}`,
          });
          b.jsonBody(attestation);
        })
        .willRespondWith(200, (b) => {
          b.headers({
            'Content-Type': 'application/json',
            'Set-Cookie': setCookie(`${REG_SESSION}-2`),
          });
          b.jsonBody(M.string('Registration Success'));
        });

      await first.executeTest(async (mockServer) => {
        const { register } = await importPasskeyService(mockServer.url);
        await expect(register('Alice')).resolves.toBeUndefined();
      });
    } finally {
      teardown();
    }
  });

  it('registerFinish with an unknown session is rejected with 400', async () => {
    const teardown = installCookieJar({ sid: UNKNOWN_SESSION });
    try {
      const provider = newProvider();

      const last = provider
        .addInteraction()
        .given('no registration session exists')
        .uponReceiving(
          'a request to finish registration with an unknown session',
        )
        .withRequest('POST', '/api/passkey/registerFinish', (b) => {
          b.headers({
            'Content-Type': 'application/json',
            Cookie: `sid=${UNKNOWN_SESSION}`,
          });
          b.jsonBody(attestation);
        })
        .willRespondWith(400, (b) => {
          b.headers({ 'Content-Type': 'application/json' });
          b.jsonBody(M.string('session id not found'));
        });

      await last.executeTest(async (mockServer) => {
        const response = await fetch(
          `${mockServer.url}/api/passkey/registerFinish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attestation),
          },
        );
        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toContain(
          'session id not found',
        );
      });
    } finally {
      teardown();
    }
  });

  it('login: start returns request options, finish accepts the assertion', async () => {
    const teardown = installCookieJar();
    try {
      const provider = newProvider();

      const first = provider
        .addInteraction()
        .given('the auth service is available')
        .uponReceiving('a request to start login')
        .withRequest('POST', '/api/passkey/loginStart')
        .willRespondWith(200, (b) => {
          b.headers({
            'Content-Type': 'application/json',
            'Set-Cookie': setCookie(LOGIN_SESSION),
          });
          b.jsonBody({
            publicKey: {
              challenge: M.regex(b64url, params.challenge),
              timeout: M.integer(300000),
              rpId: M.regex(/^[a-z0-9.-]+$/, params.rpId),
            },
          });
        });

      provider
        .addInteraction()
        .given('a login session and a user with a passkey exist')
        .uponReceiving('a request to finish login with a valid assertion')
        .withRequest('POST', '/api/passkey/loginFinish', (b) => {
          b.headers({
            'Content-Type': 'application/json',
            Cookie: `sid=${LOGIN_SESSION}`,
          });
          b.jsonBody(assertion);
        })
        .willRespondWith(200, (b) => {
          b.headers({
            'Content-Type': 'application/json',
            'Set-Cookie': setCookie(`${LOGIN_SESSION}-2`),
          });
          b.jsonBody(M.string('Login Success'));
        });

      await first.executeTest(async (mockServer) => {
        const { login } = await importPasskeyService(mockServer.url);
        await expect(login()).resolves.toBeUndefined();
      });
    } finally {
      teardown();
    }
  });

  it('loginFinish with an unknown session is rejected with 400', async () => {
    const teardown = installCookieJar({ sid: UNKNOWN_SESSION });
    try {
      const provider = newProvider();

      const last = provider
        .addInteraction()
        .given('no login session exists')
        .uponReceiving('a request to finish login with an unknown session')
        .withRequest('POST', '/api/passkey/loginFinish', (b) => {
          b.headers({
            'Content-Type': 'application/json',
            Cookie: `sid=${UNKNOWN_SESSION}`,
          });
          b.jsonBody(assertion);
        })
        .willRespondWith(400, (b) => {
          b.headers({ 'Content-Type': 'application/json' });
          b.jsonBody(M.string('session id not found'));
        });

      await last.executeTest(async (mockServer) => {
        const response = await fetch(
          `${mockServer.url}/api/passkey/loginFinish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assertion),
          },
        );
        expect(response.status).toBe(400);
        await expect(response.text()).resolves.toContain(
          'session id not found',
        );
      });
    } finally {
      teardown();
    }
  });
});
