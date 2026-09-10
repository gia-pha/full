import { afterEach, describe, expect, it } from 'vitest';
import { confirmDialog } from '../../src/components/confirm-dialog.js';
import '../../src/components/confirm-dialog.js';
import type { ConfirmDialog } from '../../src/components/confirm-dialog.js';

async function renderComponent(opts?: {
  open?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}): Promise<ConfirmDialog> {
  const el = document.createElement('app-confirm-dialog');
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.message !== undefined) el.message = opts.message;
  if (opts?.confirmLabel !== undefined) el.confirmLabel = opts.confirmLabel;
  if (opts?.cancelLabel !== undefined) el.cancelLabel = opts.cancelLabel;
  if (opts?.danger !== undefined) el.danger = opts.danger;
  document.body.appendChild(el);
  if (opts?.open !== undefined) el.open = opts.open;
  await el.updateComplete;
  return el;
}

function awaitEvent(el: ConfirmDialog, type: string): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener(type, (e) => resolve(e as CustomEvent), { once: true });
  });
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-confirm-dialog').forEach((el) => {
    el.remove();
  });
});

describe('ConfirmDialog', () => {
  describe('rendering', () => {
    it('renders nothing when closed', async () => {
      const el = await renderComponent({ open: false, message: 'Delete?' });
      expect(el.querySelector('.confirm-message')).toBeNull();
    });

    it('renders app-modal with message when open', async () => {
      const el = await renderComponent({ open: true, message: 'Delete this?' });
      expect(el.querySelector('app-modal')).not.toBeNull();
      expect(
        el.querySelector('.confirm-message')?.textContent?.trim(),
      ).toContain('Delete this?');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ open: true });
      expect(el.shadowRoot).toBeNull();
    });

    it('reflects open attribute', async () => {
      const el = await renderComponent({ open: true });
      expect(el.hasAttribute('open')).toBe(true);
      el.open = false;
      await el.updateComplete;
      expect(el.hasAttribute('open')).toBe(false);
    });
  });

  describe('labels', () => {
    it('falls back to translated labels', async () => {
      const el = await renderComponent({ open: true });
      expect(el.querySelector('.confirm-ok')?.textContent?.trim()).toBe(
        'Xác nhận',
      );
      expect(el.querySelector('.confirm-cancel')?.textContent?.trim()).toBe(
        'Hủy',
      );
    });

    it('keeps the default confirm label when danger', async () => {
      const el = await renderComponent({ open: true, danger: true });
      expect(el.querySelector('.confirm-ok')?.textContent?.trim()).toBe(
        'Xác nhận',
      );
    });

    it('uses custom labels when provided', async () => {
      const el = await renderComponent({
        open: true,
        confirmLabel: 'Yes',
        cancelLabel: 'No',
      });
      expect(el.querySelector('.confirm-ok')?.textContent?.trim()).toBe('Yes');
      expect(el.querySelector('.confirm-cancel')?.textContent?.trim()).toBe(
        'No',
      );
    });
  });

  describe('danger styling', () => {
    it('uses red confirm button when danger', async () => {
      const el = await renderComponent({ open: true, danger: true });
      const ok = el.querySelector('.confirm-ok')!;
      expect(ok.className).toContain('bg-red-600');
    });

    it('uses emerald confirm button by default', async () => {
      const el = await renderComponent({ open: true });
      const ok = el.querySelector('.confirm-ok')!;
      expect(ok.className).toContain('bg-emerald-600');
      expect(ok.className).not.toContain('bg-red-600');
    });
  });

  describe('events', () => {
    it('dispatches confirm event on confirm click', async () => {
      const el = await renderComponent({ open: true });
      const eventPromise = awaitEvent(el, 'confirm');
      (el.querySelector('.confirm-ok') as HTMLButtonElement).click();
      const event = await eventPromise;
      expect(event.type).toBe('confirm');
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
    });

    it('dispatches cancel event on cancel click', async () => {
      const el = await renderComponent({ open: true });
      const eventPromise = awaitEvent(el, 'cancel');
      (el.querySelector('.confirm-cancel') as HTMLButtonElement).click();
      const event = await eventPromise;
      expect(event.type).toBe('cancel');
    });

    it('dispatches cancel event on modal close (escape/overlay/X)', async () => {
      const el = await renderComponent({ open: true });
      const eventPromise = awaitEvent(el, 'cancel');
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      const event = await eventPromise;
      expect(event.type).toBe('cancel');
    });

    it('does not dispatch confirm on cancel click', async () => {
      const el = await renderComponent({ open: true });
      let confirmed = false;
      el.addEventListener('confirm', () => {
        confirmed = true;
      });
      (el.querySelector('.confirm-cancel') as HTMLButtonElement).click();
      await tick();
      expect(confirmed).toBe(false);
    });
  });
});

describe('confirmDialog helper', () => {
  it('appends an open dialog to the body', async () => {
    const pending = confirmDialog({ message: 'Sure?' });
    await tick();
    const el = document.querySelector('app-confirm-dialog');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('open')).not.toBeNull();
    (el!.querySelector('.confirm-cancel') as HTMLButtonElement).click();
    await pending;
  });

  it('resolves true when confirmed and removes itself', async () => {
    const pending = confirmDialog({ message: 'Sure?' });
    await tick();
    const el = document.querySelector('app-confirm-dialog')!;
    (el.querySelector('.confirm-ok') as HTMLButtonElement).click();
    await expect(pending).resolves.toBe(true);
    await tick();
    expect(document.querySelector('app-confirm-dialog')).toBeNull();
  });

  it('resolves false when cancelled and removes itself', async () => {
    const pending = confirmDialog({ message: 'Sure?' });
    await tick();
    const el = document.querySelector('app-confirm-dialog')!;
    (el.querySelector('.confirm-cancel') as HTMLButtonElement).click();
    await expect(pending).resolves.toBe(false);
    await tick();
    expect(document.querySelector('app-confirm-dialog')).toBeNull();
  });

  it('resolves false when dismissed via escape', async () => {
    const pending = confirmDialog({ message: 'Sure?' });
    await tick();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await expect(pending).resolves.toBe(false);
  });

  it('passes title and danger through to the dialog', async () => {
    const pending = confirmDialog({
      title: 'Delete member',
      message: 'Cannot undo.',
      danger: true,
    });
    await tick();
    const el = document.querySelector<ConfirmDialog>('app-confirm-dialog')!;
    expect(el.title).toBe('Delete member');
    expect(el.danger).toBe(true);
    expect(el.querySelector('.confirm-ok')?.className).toContain('bg-red-600');
    (el.querySelector('.confirm-cancel') as HTMLButtonElement).click();
    await pending;
  });
});
