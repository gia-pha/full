import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { login } = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock('../../src/services/passkey.js', () => ({
  login,
  register: vi.fn(),
  logout: vi.fn(),
}));

import '../../src/pages/login-page.js';
import type { LoginPage } from '../../src/pages/login-page.js';

function flush(): Promise<void> {
  return (async () => {
    for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0));
  })();
}

async function renderPage(): Promise<LoginPage> {
  const el = document.createElement('login-page');
  document.body.appendChild(el);
  await el.updateComplete;
  await flush();
  return el;
}

function submitButton(el: LoginPage): HTMLButtonElement | null {
  return el.querySelector<HTMLButtonElement>('app-button button');
}

beforeEach(() => {
  login.mockReset();
});

afterEach(() => {
  document.querySelectorAll('login-page').forEach((el) => {
    el.remove();
  });
});

describe('LoginPage', () => {
  it('renders the passkey button with the login tab active', async () => {
    const el = await renderPage();
    expect(el.querySelector('app-button')).not.toBeNull();
    expect(el.querySelector('app-link-tabs')?.getAttribute('active')).toBe(
      '/login',
    );
  });

  it('calls login and dispatches auth-success on success', async () => {
    login.mockResolvedValueOnce(undefined);
    const el = await renderPage();
    const success = vi.fn();
    window.addEventListener('auth-success', success);

    submitButton(el)?.click();
    await flush();

    window.removeEventListener('auth-success', success);
    expect(login).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledTimes(1);
    expect(el.querySelector('[role="status"]')?.textContent).toContain(
      'Đăng nhập thành công',
    );
  });

  it('shows an error message when login fails', async () => {
    login.mockRejectedValueOnce(new Error('passkey failed'));
    const el = await renderPage();
    const success = vi.fn();
    window.addEventListener('auth-success', success);

    submitButton(el)?.click();
    await flush();

    window.removeEventListener('auth-success', success);
    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'passkey failed',
    );
    expect(success).not.toHaveBeenCalled();
  });
});
