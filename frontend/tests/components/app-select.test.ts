import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-select.js';
import type {
  AppSelect,
  SelectOption,
} from '../../src/components/app-select.js';

const eventTypes: SelectOption[] = [
  { value: 'memorial', label: 'Giao to' },
  { value: 'meeting', label: 'Hoi nghi' },
  { value: 'reunion', label: 'Quen ma' },
];

async function renderComponent(opts?: {
  label?: string;
  options?: SelectOption[];
  value?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}): Promise<AppSelect> {
  const el = document.createElement('app-select');
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.options !== undefined) el.options = opts.options;
  if (opts?.value !== undefined) el.value = opts.value;
  if (opts?.placeholder !== undefined) el.placeholder = opts.placeholder;
  if (opts?.required !== undefined) el.required = opts.required;
  if (opts?.disabled !== undefined) el.disabled = opts.disabled;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getSelect(el: AppSelect): HTMLSelectElement {
  return el.querySelector('select')!;
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-select').forEach((el) => {
    el.remove();
  });
});

describe('AppSelect', () => {
  describe('basic rendering', () => {
    it('renders a label and select', async () => {
      const el = await renderComponent({
        label: 'Type',
        options: eventTypes,
      });
      expect(el.querySelector('label')).not.toBeNull();
      expect(el.querySelector('label')!.textContent).toBe('Type');
      expect(getSelect(el)).not.toBeNull();
    });

    it('renders without a label when label is empty', async () => {
      const el = await renderComponent({ options: eventTypes });
      expect(el.querySelector('label')).toBeNull();
      expect(getSelect(el)).not.toBeNull();
    });

    it('renders options', async () => {
      const el = await renderComponent({ options: eventTypes });
      const options = getSelect(el).querySelectorAll('option');
      expect(options.length).toBe(3);
      expect(Array.from(options).map((o) => o.value)).toEqual([
        'memorial',
        'meeting',
        'reunion',
      ]);
      expect(options[0].textContent).toBe('Giao to');
    });

    it('renders nothing in select without options', async () => {
      const el = await renderComponent({});
      expect(getSelect(el).querySelectorAll('option').length).toBe(0);
    });

    it('selects the given value', async () => {
      const el = await renderComponent({
        options: eventTypes,
        value: 'meeting',
      });
      expect(getSelect(el).value).toBe('meeting');
    });

    it('renders placeholder option with empty value', async () => {
      const el = await renderComponent({
        options: eventTypes,
        placeholder: '-- None --',
      });
      const options = getSelect(el).querySelectorAll('option');
      expect(options.length).toBe(4);
      expect(options[0].value).toBe('');
      expect(options[0].textContent).toBe('-- None --');
    });

    it('reflects required attribute', async () => {
      const el = await renderComponent({
        options: eventTypes,
        required: true,
      });
      expect(getSelect(el).hasAttribute('required')).toBe(true);
    });

    it('reflects disabled attribute', async () => {
      const el = await renderComponent({
        options: eventTypes,
        disabled: true,
      });
      expect(getSelect(el).disabled).toBe(true);
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ options: eventTypes });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('value sync', () => {
    it('updates value on change', async () => {
      const el = await renderComponent({
        options: eventTypes,
        value: 'memorial',
      });
      const select = getSelect(el);
      select.value = 'reunion';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await el.updateComplete;
      expect(el.value).toBe('reunion');
      expect(getSelect(el).value).toBe('reunion');
    });

    it('keeps user selection across re-renders', async () => {
      const el = await renderComponent({
        options: eventTypes,
        value: 'memorial',
      });
      const select = getSelect(el);
      select.value = 'meeting';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await el.updateComplete;
      el.placeholder = '-- None --';
      await el.updateComplete;
      expect(getSelect(el).value).toBe('meeting');
    });
  });

  describe('events', () => {
    it('bubbles change events from the select to the host', async () => {
      const el = await renderComponent({ options: eventTypes });
      let changed = '';
      el.addEventListener('change', (e) => {
        changed = (e.target as HTMLSelectElement).value;
      });
      const select = getSelect(el);
      select.value = 'meeting';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      await tick();
      expect(changed).toBe('meeting');
    });
  });
});
