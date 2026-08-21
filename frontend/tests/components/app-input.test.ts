import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-input.js';
import type { AppInput, FieldType } from '../../src/components/app-input.js';

async function renderComponent(opts?: {
  label?: string;
  type?: FieldType;
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}): Promise<AppInput> {
  const el = document.createElement('app-input');
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.type !== undefined) el.type = opts.type;
  if (opts?.value !== undefined) el.value = opts.value;
  if (opts?.placeholder !== undefined) el.placeholder = opts.placeholder;
  if (opts?.required !== undefined) el.required = opts.required;
  if (opts?.disabled !== undefined) el.disabled = opts.disabled;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getInput(el: AppInput): HTMLInputElement {
  return el.querySelector('input')!;
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-input').forEach((el) => {
    el.remove();
  });
});

describe('AppInput', () => {
  describe('basic rendering', () => {
    it('renders a label and input', async () => {
      const el = await renderComponent({ label: 'Name' });
      expect(el.querySelector('label')).not.toBeNull();
      expect(el.querySelector('label')!.textContent).toBe('Name');
      expect(getInput(el)).not.toBeNull();
    });

    it('renders without a label when label is empty', async () => {
      const el = await renderComponent({});
      expect(el.querySelector('label')).toBeNull();
      expect(getInput(el)).not.toBeNull();
    });

    it('defaults to text type', async () => {
      const el = await renderComponent({});
      expect(getInput(el).type).toBe('text');
    });

    it.each([
      'text',
      'number',
      'date',
      'url',
    ] as const)('renders %s type', async (type) => {
      const el = await renderComponent({ type });
      expect(getInput(el).type).toBe(type);
    });

    it('renders initial value', async () => {
      const el = await renderComponent({ value: 'Nguyen Van A' });
      expect(getInput(el).value).toBe('Nguyen Van A');
    });

    it('renders placeholder', async () => {
      const el = await renderComponent({ placeholder: 'Enter name' });
      expect(getInput(el).placeholder).toBe('Enter name');
    });

    it('sets aria-label from label', async () => {
      const el = await renderComponent({ label: 'Birth year' });
      expect(getInput(el).getAttribute('aria-label')).toBe('Birth year');
    });

    it('reflects required attribute', async () => {
      const el = await renderComponent({ required: true });
      expect(getInput(el).hasAttribute('required')).toBe(true);
    });

    it('reflects disabled attribute', async () => {
      const el = await renderComponent({ disabled: true });
      expect(getInput(el).disabled).toBe(true);
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ label: 'Name' });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('value sync', () => {
    it('updates value on input', async () => {
      const el = await renderComponent({ label: 'Name' });
      const input = getInput(el);
      input.value = 'typed';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;
      expect(el.value).toBe('typed');
      expect(getInput(el).value).toBe('typed');
    });

    it('keeps user input across re-renders', async () => {
      const el = await renderComponent({ label: 'Name' });
      const input = getInput(el);
      input.value = 'kept';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;
      el.placeholder = 'changed';
      await el.updateComplete;
      expect(getInput(el).value).toBe('kept');
    });
  });

  describe('events', () => {
    it('bubbles change events from the input to the host', async () => {
      const el = await renderComponent({ label: 'Name' });
      let changed = false;
      el.addEventListener('change', () => {
        changed = true;
      });
      getInput(el).dispatchEvent(new Event('change', { bubbles: true }));
      await tick();
      expect(changed).toBe(true);
    });

    it('bubbles input events from the input to the host', async () => {
      const el = await renderComponent({ label: 'Name' });
      let inputReceived = '';
      el.addEventListener('input', (e) => {
        inputReceived = (e.target as HTMLInputElement).value;
      });
      const input = getInput(el);
      input.value = 'abc';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await tick();
      expect(inputReceived).toBe('abc');
    });
  });
});
