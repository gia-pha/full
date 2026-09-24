import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { startRegistration, startAuthentication } = vi.hoisted(() => ({
  startRegistration: vi.fn(),
  startAuthentication: vi.fn(),
}));

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration,
  startAuthentication,
}));

import { login, logout, register } from '../../src/services/passkey.js';

const fetchMock = vi.fn();

function ok(body?: unknown) {
  return {
    ok: true,
    statusText: 'OK',
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  };
}

function fail(statusText: string, body = '') {
  return { ok: false, statusText, text: async () => body };
}

beforeEach(() => {
  fetchMock.mockReset();
  startRegistration.mockReset();
  startAuthentication.mockReset();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('passkey service', () => {
  describe('register', () => {
    it('runs start → ceremony → finish', async () => {
      const publicKey = { challenge: 'c1' };
      const attestation = { rawId: 'a1' };
      fetchMock
        .mockResolvedValueOnce(ok({ publicKey }))
        .mockResolvedValueOnce(ok());
      startRegistration.mockResolvedValueOnce(attestation);

      await register('Alice');

      expect(fetchMock).toHaveBeenCalledTimes(2);

      const start = fetchMock.mock.calls[0];
      expect(start[0]).toContain('/api/passkey/registerStart');
      expect(start[1].method).toBe('POST');
      expect(start[1].credentials).toBe('include');
      expect(JSON.parse(start[1].body)).toEqual({ name: 'Alice' });

      expect(startRegistration).toHaveBeenCalledWith({
        optionsJSON: publicKey,
      });

      const finish = fetchMock.mock.calls[1];
      expect(finish[0]).toContain('/api/passkey/registerFinish');
      expect(JSON.parse(finish[1].body)).toEqual(attestation);
    });

    it('throws the server message when start fails', async () => {
      fetchMock.mockResolvedValueOnce(fail('Bad Request', 'invalid name'));
      await expect(register('')).rejects.toThrow('invalid name');
      expect(startRegistration).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('falls back to statusText when the error body is empty', async () => {
      fetchMock.mockResolvedValueOnce(fail('Forbidden'));
      await expect(register('Alice')).rejects.toThrow('Forbidden');
    });
  });

  describe('login', () => {
    it('runs start → ceremony → finish', async () => {
      const publicKey = { challenge: 'l1' };
      const assertion = { rawId: 'a2' };
      fetchMock
        .mockResolvedValueOnce(ok({ publicKey }))
        .mockResolvedValueOnce(ok());
      startAuthentication.mockResolvedValueOnce(assertion);

      await login();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const start = fetchMock.mock.calls[0];
      expect(start[0]).toContain('/api/passkey/loginStart');
      expect(start[1].body).toBeUndefined();

      expect(startAuthentication).toHaveBeenCalledWith({
        optionsJSON: publicKey,
      });

      const finish = fetchMock.mock.calls[1];
      expect(finish[0]).toContain('/api/passkey/loginFinish');
      expect(JSON.parse(finish[1].body)).toEqual(assertion);
    });
  });

  describe('logout', () => {
    it('posts to the logout endpoint', async () => {
      fetchMock.mockResolvedValueOnce(ok());
      await logout();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const call = fetchMock.mock.calls[0];
      expect(call[0]).toContain('/api/logout');
      expect(call[1].method).toBe('POST');
      expect(call[1].credentials).toBe('include');
    });
  });
});
