import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/toggle.js';
import type { AppToggle, ToggleDetail } from '../../src/components/toggle.js';

async function renderComponent(opts?: {
  checked?: boolean;
  label?: string;
  disabled?: boolean;
}): Promise<AppToggle> {
  const el = document.createElement('app-toggle');
  if (opts?.checked !== undefined) el.checked = opts.checked;
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.disabled !== undefined) el.disabled = opts.disabled;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getSwitch(el: AppToggle): HTMLButtonElement {
  return el.querySelector('button[role="switch"]')!;
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-toggle').forEach((el) => {
    el.remove();
  });
});

describe('AppToggle', () => {
  describe('basic rendering', () => {
    it('renders a switch button', async () => {
      const el = await renderComponent({});
      expect(getSwitch(el)).not.toBeNull();
    });

    it('renders without a label span when label is empty', async () => {
      const el = await renderComponent({});
      expect(el.querySelector('label > span')).toBeNull();
    });

    it('renders the label text', async () => {
      const el = await renderComponent({ label: 'Fund changes' });
      const span = el.querySelector('label > span');
      expect(span).not.toBeNull();
      expect(span!.textContent).toBe('Fund changes');
    });

    it('defaults to unchecked', async () => {
      const el = await renderComponent({});
      expect(getSwitch(el).getAttribute('aria-checked')).toBe('false');
    });

    it('renders checked state', async () => {
      const el = await renderComponent({ checked: true });
      expect(getSwitch(el).getAttribute('aria-checked')).toBe('true');
    });

    it('reflects disabled', async () => {
      const el = await renderComponent({ disabled: true });
      expect(getSwitch(el).disabled).toBe(true);
    });

    it('sets aria-label from label', async () => {
      const el = await renderComponent({ label: 'New events' });
      expect(getSwitch(el).getAttribute('aria-label')).toBe('New events');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({});
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('interaction', () => {
    it('toggles to checked on click and dispatches change', async () => {
      const el = await renderComponent({});
      const events: ToggleDetail[] = [];
      el.addEventListener('change', (e) =>
        events.push((e as CustomEvent<ToggleDetail>).detail),
      );
      getSwitch(el).click();
      await el.updateComplete;
      expect(el.checked).toBe(true);
      expect(getSwitch(el).getAttribute('aria-checked')).toBe('true');
      expect(events).toEqual([{ checked: true }]);
    });

    it('toggles back to unchecked on second click', async () => {
      const el = await renderComponent({ checked: true });
      const events: ToggleDetail[] = [];
      el.addEventListener('change', (e) =>
        events.push((e as CustomEvent<ToggleDetail>).detail),
      );
      getSwitch(el).click();
      await el.updateComplete;
      expect(el.checked).toBe(false);
      expect(events).toEqual([{ checked: false }]);
    });

    it('does not toggle when disabled', async () => {
      const el = await renderComponent({ disabled: true });
      let changed = false;
      el.addEventListener('change', () => {
        changed = true;
      });
      getSwitch(el).click();
      await el.updateComplete;
      await tick();
      expect(el.checked).toBe(false);
      expect(changed).toBe(false);
    });

    it('bubbles change events to the host', async () => {
      const el = await renderComponent({});
      let bubbled = false;
      el.addEventListener('change', () => {
        bubbled = true;
      });
      getSwitch(el).click();
      await tick();
      expect(bubbled).toBe(true);
    });
  });
});
