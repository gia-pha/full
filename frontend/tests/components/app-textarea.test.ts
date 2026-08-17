import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-textarea.js';
import type { AppTextarea } from '../../src/components/app-textarea.js';

async function renderComponent(opts?: {
  label?: string;
  value?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
}): Promise<AppTextarea> {
  const el = document.createElement('app-textarea');
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.value !== undefined) el.value = opts.value;
  if (opts?.placeholder !== undefined) el.placeholder = opts.placeholder;
  if (opts?.rows !== undefined) el.rows = opts.rows;
  if (opts?.required !== undefined) el.required = opts.required;
  if (opts?.disabled !== undefined) el.disabled = opts.disabled;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getTextarea(el: AppTextarea): HTMLTextAreaElement {
  return el.querySelector('textarea')!;
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-textarea').forEach((el) => el.remove());
});

describe('AppTextarea', () => {
  describe('basic rendering', () => {
    it('renders a label and textarea', async () => {
      const el = await renderComponent({ label: 'Notes' });
      expect(el.querySelector('label')).not.toBeNull();
      expect(el.querySelector('label')!.textContent).toBe('Notes');
      expect(getTextarea(el)).not.toBeNull();
    });

    it('renders without a label when label is empty', async () => {
      const el = await renderComponent({});
      expect(el.querySelector('label')).toBeNull();
      expect(getTextarea(el)).not.toBeNull();
    });

    it('defaults to 3 rows', async () => {
      const el = await renderComponent({});
      expect(getTextarea(el).rows).toBe(3);
    });

    it('renders custom rows', async () => {
      const el = await renderComponent({ rows: 6 });
      expect(getTextarea(el).rows).toBe(6);
    });

    it('renders initial value', async () => {
      const el = await renderComponent({ value: 'Lorem ipsum' });
      expect(getTextarea(el).value).toBe('Lorem ipsum');
    });

    it('renders value content in the markup', async () => {
      const el = await renderComponent({ value: 'line one\nline two' });
      expect(getTextarea(el).textContent).toBe('line one\nline two');
    });

    it('renders placeholder', async () => {
      const el = await renderComponent({ placeholder: 'Write here' });
      expect(getTextarea(el).placeholder).toBe('Write here');
    });

    it('sets aria-label from label', async () => {
      const el = await renderComponent({ label: 'History' });
      expect(getTextarea(el).getAttribute('aria-label')).toBe('History');
    });

    it('reflects required attribute', async () => {
      const el = await renderComponent({ required: true });
      expect(getTextarea(el).hasAttribute('required')).toBe(true);
    });

    it('reflects disabled attribute', async () => {
      const el = await renderComponent({ disabled: true });
      expect(getTextarea(el).disabled).toBe(true);
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ label: 'Notes' });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('value sync', () => {
    it('updates value on input', async () => {
      const el = await renderComponent({ label: 'Notes' });
      const textarea = getTextarea(el);
      textarea.value = 'typed';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;
      expect(el.value).toBe('typed');
      expect(getTextarea(el).value).toBe('typed');
    });

    it('keeps user input across re-renders', async () => {
      const el = await renderComponent({ label: 'Notes' });
      const textarea = getTextarea(el);
      textarea.value = 'kept';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;
      el.placeholder = 'changed';
      await el.updateComplete;
      expect(getTextarea(el).value).toBe('kept');
    });
  });

  describe('events', () => {
    it('bubbles input events from the textarea to the host', async () => {
      const el = await renderComponent({ label: 'Notes' });
      let inputReceived = '';
      el.addEventListener('input', (e) => {
        inputReceived = (e.target as HTMLTextAreaElement).value;
      });
      const textarea = getTextarea(el);
      textarea.value = 'abc';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      await tick();
      expect(inputReceived).toBe('abc');
    });
  });
});
