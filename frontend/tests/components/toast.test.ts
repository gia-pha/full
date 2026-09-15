import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toast } from '../../src/components/toast.js';
import '../../src/components/toast.js';
import type { AppToast, ToastVariant } from '../../src/components/toast.js';

async function renderComponent(opts?: {
  message?: string;
  variant?: ToastVariant;
  duration?: number;
}): Promise<AppToast> {
  const el = document.createElement('app-toast');
  if (opts?.message !== undefined) el.message = opts.message;
  if (opts?.variant !== undefined) el.variant = opts.variant;
  if (opts?.duration !== undefined) el.duration = opts.duration;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function awaitEvent(el: AppToast, type: string): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener(type, (e) => resolve(e as CustomEvent), { once: true });
  });
}

async function tick(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0);
}

function stack(): HTMLElement | null {
  return document.querySelector('#app-toast-stack');
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll('app-toast').forEach((el) => {
    el.remove();
  });
  stack()?.remove();
});

describe('AppToast', () => {
  describe('rendering', () => {
    it('renders the message in a pill', async () => {
      const el = await renderComponent({ message: 'Saved!' });
      expect(el.querySelector('.toast-message')?.textContent?.trim()).toBe(
        'Saved!',
      );
      expect(el.querySelector('.toast')).not.toBeNull();
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ message: 'hi' });
      expect(el.shadowRoot).toBeNull();
    });

    it('shows an icon per variant', async () => {
      const success = await renderComponent({ variant: 'success' });
      expect(success.querySelector('.toast-icon')?.textContent?.trim()).toBe(
        '✅',
      );
      const error = await renderComponent({ variant: 'error' });
      expect(error.querySelector('.toast-icon')?.textContent?.trim()).toBe(
        '❌',
      );
      const warning = await renderComponent({ variant: 'warning' });
      expect(warning.querySelector('.toast-icon')?.textContent?.trim()).toBe(
        '⚠️',
      );
      const info = await renderComponent({ variant: 'info' });
      expect(info.querySelector('.toast-icon')?.textContent?.trim()).toBe('ℹ️');
    });
  });

  describe('variants', () => {
    it('defaults to success with status role', async () => {
      const el = await renderComponent();
      const pill = el.querySelector('.toast')!;
      expect(pill.className).toContain('bg-emerald-600');
      expect(pill.getAttribute('role')).toBe('status');
    });

    it('uses red with alert role for error', async () => {
      const el = await renderComponent({ variant: 'error' });
      const pill = el.querySelector('.toast')!;
      expect(pill.className).toContain('bg-red-600');
      expect(pill.getAttribute('role')).toBe('alert');
    });

    it('uses gray for info', async () => {
      const el = await renderComponent({ variant: 'info' });
      const pill = el.querySelector('.toast')!;
      expect(pill.className).toContain('bg-gray-800');
      expect(pill.className).not.toContain('bg-red-600');
    });

    it('uses amber with status role for warning', async () => {
      const el = await renderComponent({ variant: 'warning' });
      const pill = el.querySelector('.toast')!;
      expect(pill.className).toContain('bg-amber-600');
      expect(pill.getAttribute('role')).toBe('status');
    });

    it('falls back to success for unknown variants', async () => {
      const el = await renderComponent({ variant: 'bogus' as 'success' });
      expect(el.querySelector('.toast')?.className).toContain('bg-emerald-600');
    });
  });

  describe('dismiss', () => {
    it('dispatches dismiss event on close click', async () => {
      const el = await renderComponent({ duration: 0 });
      const eventPromise = awaitEvent(el, 'dismiss');
      (el.querySelector('.toast-close') as HTMLButtonElement).click();
      const event = await eventPromise;
      expect(event.type).toBe('dismiss');
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
    });

    it('auto-dismisses after the duration elapses', async () => {
      const dismiss = vi.fn();
      const el = await renderComponent({ duration: 100 });
      el.addEventListener('dismiss', dismiss);
      expect(dismiss).not.toHaveBeenCalled();
      vi.advanceTimersByTime(99);
      expect(dismiss).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(dismiss).toHaveBeenCalledTimes(1);
    });

    it('does not auto-dismiss when duration is 0', async () => {
      let dismissed = false;
      const el = await renderComponent({ duration: 0 });
      el.addEventListener('dismiss', () => {
        dismissed = true;
      });
      vi.advanceTimersByTime(10_000);
      await tick();
      expect(dismissed).toBe(false);
    });

    it('restarts the timer when duration changes', async () => {
      const el = await renderComponent({ duration: 0 });
      let dismissed = false;
      el.addEventListener('dismiss', () => {
        dismissed = true;
      });
      el.duration = 50;
      await el.updateComplete;
      vi.advanceTimersByTime(20);
      expect(dismissed).toBe(false);
      vi.advanceTimersByTime(50);
      expect(dismissed).toBe(true);
    });

    it('does not dismiss after being disconnected', async () => {
      const el = await renderComponent({ duration: 100 });
      let dismissed = false;
      el.addEventListener('dismiss', () => {
        dismissed = true;
      });
      el.remove();
      vi.advanceTimersByTime(1000);
      expect(dismissed).toBe(false);
    });
  });
});

describe('toast helper', () => {
  it('creates a stack with an open toast and removes both on dismiss', async () => {
    const pending = toast('Copied!', { variant: 'success' });
    await tick();
    const container = stack();
    expect(container).not.toBeNull();
    expect(container?.children).toHaveLength(1);
    expect(
      container?.querySelector('.toast-message')?.textContent?.trim(),
    ).toBe('Copied!');

    (container!.querySelector('.toast-close') as HTMLButtonElement).click();
    await pending;
    expect(stack()).toBeNull();
  });

  it('auto-dismisses and resolves', async () => {
    const pending = toast('Bye', { duration: 200 });
    await tick();
    expect(stack()?.children).toHaveLength(1);
    vi.advanceTimersByTime(200);
    await pending;
    expect(stack()).toBeNull();
  });

  it('passes variant and duration through to the element', async () => {
    const pending = toast('Boom', { variant: 'error', duration: 0 });
    await tick();
    const el = stack()!.querySelector('app-toast') as AppToast;
    expect(el.variant).toBe('error');
    expect(el.duration).toBe(0);
    expect(el.querySelector('.toast')?.className).toContain('bg-red-600');
    (el.querySelector('.toast-close') as HTMLButtonElement).click();
    await pending;
  });

  it('stacks multiple toasts in one container', async () => {
    const first = toast('One', { duration: 0 });
    const second = toast('Two', { duration: 0 });
    await tick();
    expect(stack()?.children).toHaveLength(2);

    const els = stack()!.querySelectorAll('app-toast');
    (els[0].querySelector('.toast-close') as HTMLButtonElement).click();
    await first;
    expect(stack()?.children).toHaveLength(1);

    (els[1].querySelector('.toast-close') as HTMLButtonElement).click();
    await second;
    expect(stack()).toBeNull();
  });
});
