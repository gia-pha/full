import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-button.js';
import type {
  AppButton,
  ButtonVariant,
} from '../../src/components/app-button.js';

async function renderComponent(opts?: {
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: string;
  label?: string;
}): Promise<AppButton> {
  const el = document.createElement('app-button');
  if (opts?.variant !== undefined) el.variant = opts.variant;
  if (opts?.disabled !== undefined) el.disabled = opts.disabled;
  if (opts?.icon !== undefined) el.icon = opts.icon;
  el.label = opts?.label ?? 'Save';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getButton(el: AppButton): HTMLButtonElement {
  return el.querySelector('button')!;
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-button').forEach((el) => el.remove());
});

describe('AppButton', () => {
  describe('basic rendering', () => {
    it('renders a native button with label', async () => {
      const el = await renderComponent({ label: 'Save changes' });
      const button = getButton(el);
      expect(button.tagName).toBe('BUTTON');
      expect(button.textContent!.trim()).toBe('Save changes');
    });

    it('renders the icon before the label when icon is set', async () => {
      const el = await renderComponent({ icon: '+', label: 'Add event' });
      const button = getButton(el);
      const spans = Array.from(button.querySelectorAll('span'));
      expect(spans).toHaveLength(2);
      expect(spans[0].textContent).toBe('+');
      expect(spans[1].textContent).toBe('Add event');
    });

    it('renders only the label when icon is empty', async () => {
      const el = await renderComponent({ icon: '', label: 'Save' });
      const spans = getButton(el).querySelectorAll('span');
      expect(spans).toHaveLength(1);
      expect(spans[0].textContent).toBe('Save');
    });

    it('defaults to primary variant', async () => {
      const el = await renderComponent();
      expect(getButton(el).className).toContain('bg-emerald-600');
    });

    it('applies secondary variant styles', async () => {
      const el = await renderComponent({ variant: 'secondary' });
      const className = getButton(el).className;
      expect(className).toContain('bg-gray-100');
      expect(className).not.toContain('bg-emerald-600');
    });

    it('applies danger variant styles', async () => {
      const el = await renderComponent({ variant: 'danger' });
      expect(getButton(el).className).toContain('bg-red-600');
    });

    it('applies soft-danger variant styles', async () => {
      const el = await renderComponent({ variant: 'soft-danger' });
      const className = getButton(el).className;
      expect(className).toContain('bg-red-50');
      expect(className).toContain('text-red-600');
    });

    it('falls back to primary for unknown variant', async () => {
      const el = document.createElement('app-button');
      el.variant = 'unknown' as ButtonVariant;
      document.body.appendChild(el);
      await el.updateComplete;
      expect(getButton(el).className).toContain('bg-emerald-600');
      el.remove();
    });

    it('inner button fills host width', async () => {
      const el = await renderComponent();
      expect(getButton(el).className).toContain('w-full');
    });

    it('makes the host inline-block so consumer width classes apply', async () => {
      const el = await renderComponent();
      expect(el.style.display).toBe('inline-block');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent();
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('interaction', () => {
    it('dispatches click event on click', async () => {
      const el = await renderComponent();
      let clicks = 0;
      el.addEventListener('click', () => {
        clicks++;
      });
      getButton(el).click();
      await tick();
      expect(clicks).toBe(1);
    });

    it('is not disabled by default', async () => {
      const el = await renderComponent();
      expect(getButton(el).disabled).toBe(false);
    });

    it('is disabled when disabled is set', async () => {
      const el = await renderComponent({ disabled: true });
      const button = getButton(el);
      expect(button.disabled).toBe(true);
      expect(button.className).toContain('opacity-50');
    });
  });
});
