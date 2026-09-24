import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { register } = vi.hoisted(() => ({ register: vi.fn() }));

vi.mock('../../src/services/passkey.js', () => ({
  login: vi.fn(),
  register,
  logout: vi.fn(),
}));

import '../../src/pages/register-page.js';
import type { RegisterPage } from '../../src/pages/register-page.js';

function flush(): Promise<void> {
  return (async () => {
    for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0));
  })();
}

async function renderPage(): Promise<RegisterPage> {
  const el = document.createElement('register-page');
  document.body.appendChild(el);
  await el.updateComplete;
  await flush();
  return el;
}

function nameInput(el: RegisterPage) {
  return el.querySelector('app-input');
}

function submitButton(el: RegisterPage): HTMLButtonElement | null {
  return el.querySelector<HTMLButtonElement>('app-button button');
}

beforeEach(() => {
  register.mockReset();
});

afterEach(() => {
  document.querySelectorAll('register-page').forEach((el) => {
    el.remove();
  });
});

describe('RegisterPage', () => {
  it('renders the name input and submit button with the register tab active', async () => {
    const el = await renderPage();
    expect(nameInput(el)).not.toBeNull();
    expect(submitButton(el)).not.toBeNull();
    expect(el.querySelector('app-link-tabs')?.getAttribute('active')).toBe(
      '/register',
    );
  });

  it('does not call register when the name is empty', async () => {
    const el = await renderPage();
    submitButton(el)?.click();
    await flush();
    expect(register).not.toHaveBeenCalled();
  });

  it('calls register with the trimmed name and dispatches auth-success', async () => {
    register.mockResolvedValueOnce(undefined);
    const el = await renderPage();
    const input = nameInput(el);
    if (input) input.value = '  Alice  ';
    const success = vi.fn();
    window.addEventListener('auth-success', success);

    submitButton(el)?.click();
    await flush();

    window.removeEventListener('auth-success', success);
    expect(register).toHaveBeenCalledWith('Alice');
    expect(success).toHaveBeenCalledTimes(1);
    expect(el.querySelector('[role="status"]')?.textContent).toContain(
      'Đăng ký thành công',
    );
  });

  it('shows an error message when register fails', async () => {
    register.mockRejectedValueOnce(new Error('name taken'));
    const el = await renderPage();
    const input = nameInput(el);
    if (input) input.value = 'Alice';

    submitButton(el)?.click();
    await flush();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain(
      'name taken',
    );
  });
});
