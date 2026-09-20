import {
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  startAuthentication,
  startRegistration,
} from '@simplewebauthn/browser';

const API_URL =
  import.meta.env.VITE_AUTH_BACKEND_URL ?? 'http://localhost:8080';

async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    ...(body === undefined
      ? {}
      : {
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text || response.statusText);
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

export async function register(name: string): Promise<void> {
  const { publicKey } = await post<{
    publicKey: PublicKeyCredentialCreationOptionsJSON;
  }>('/api/passkey/registerStart', { name });
  const attestation = await startRegistration({ optionsJSON: publicKey });
  await post<void>('/api/passkey/registerFinish', attestation);
}

export async function login(): Promise<void> {
  const { publicKey } = await post<{
    publicKey: PublicKeyCredentialRequestOptionsJSON;
  }>('/api/passkey/loginStart');
  const assertion = await startAuthentication({ optionsJSON: publicKey });
  await post<void>('/api/passkey/loginFinish', assertion);
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/api/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
