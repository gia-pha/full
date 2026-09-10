import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-search-bar.js';
import type {
  AppSearchBar,
  SearchDetail,
} from '../../src/components/app-search-bar.js';

async function renderComponent(opts?: {
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  debounce?: number;
}): Promise<AppSearchBar> {
  const el = document.createElement('app-search-bar');
  if (opts?.value !== undefined) el.value = opts.value;
  if (opts?.placeholder !== undefined) el.placeholder = opts.placeholder;
  if (opts?.ariaLabel !== undefined) el.ariaLabel = opts.ariaLabel;
  if (opts?.debounce !== undefined) el.debounce = opts.debounce;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getInput(el: AppSearchBar): HTMLInputElement {
  return el.querySelector('input')!;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function nextSearch(el: AppSearchBar): Promise<SearchDetail> {
  return new Promise((resolve) => {
    el.addEventListener(
      'search',
      (e) => resolve((e as CustomEvent<SearchDetail>).detail),
      { once: true },
    );
  });
}

afterEach(() => {
  document.querySelectorAll('app-search-bar').forEach((el) => {
    el.remove();
  });
});

describe('AppSearchBar', () => {
  describe('basic rendering', () => {
    it('renders a search input', async () => {
      const el = await renderComponent();
      expect(el.querySelector('form')).not.toBeNull();
      expect(getInput(el).type).toBe('search');
    });

    it('renders placeholder and aria-label', async () => {
      const el = await renderComponent({
        placeholder: 'Search members',
        ariaLabel: 'Members search',
      });
      expect(getInput(el).placeholder).toBe('Search members');
      expect(getInput(el).getAttribute('aria-label')).toBe('Members search');
    });

    it('defaults aria-label to Search', async () => {
      const el = await renderComponent();
      expect(getInput(el).getAttribute('aria-label')).toBe('Search');
    });

    it('renders a search icon', async () => {
      const el = await renderComponent();
      expect(el.querySelector('svg')).not.toBeNull();
    });

    it('renders initial value', async () => {
      const el = await renderComponent({ value: 'Nguyen' });
      expect(getInput(el).value).toBe('Nguyen');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent();
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('clear button', () => {
    it('is hidden when empty', async () => {
      const el = await renderComponent();
      expect(el.querySelector('button')).toBeNull();
    });

    it('is shown when there is a value', async () => {
      const el = await renderComponent({ value: 'Nguyen' });
      expect(el.querySelector('button')).not.toBeNull();
    });

    it('clears the value and emits search with empty string', async () => {
      const el = await renderComponent({ value: 'Nguyen', debounce: 0 });
      const detail = nextSearch(el);
      el.querySelector<HTMLButtonElement>('button')!.click();
      await el.updateComplete;
      expect(el.value).toBe('');
      expect((await detail).value).toBe('');
    });
  });

  describe('events', () => {
    it('updates value on input', async () => {
      const el = await renderComponent({ debounce: 0 });
      const input = getInput(el);
      input.value = 'typed';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;
      expect(el.value).toBe('typed');
    });

    it('emits debounced search event on input', async () => {
      const el = await renderComponent({ debounce: 10 });
      const detail = nextSearch(el);
      const input = getInput(el);
      input.value = 'abc';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(30);
      expect((await detail).value).toBe('abc');
    });

    it('only emits once for rapid input', async () => {
      const el = await renderComponent({ debounce: 10 });
      let count = 0;
      el.addEventListener('search', () => count++);
      const input = getInput(el);
      for (const v of ['a', 'ab', 'abc']) {
        input.value = v;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await sleep(2);
      }
      await sleep(30);
      expect(count).toBe(1);
    });

    it('emits immediately on submit', async () => {
      const el = await renderComponent({ value: 'go', debounce: 1000 });
      const detail = nextSearch(el);
      el.querySelector('form')!.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );
      expect((await detail).value).toBe('go');
    });

    it('bubbles search events to the host', async () => {
      const el = await renderComponent({ debounce: 0 });
      let received = false;
      el.addEventListener('search', () => {
        received = true;
      });
      const input = getInput(el);
      input.value = 'x';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(10);
      expect(received).toBe(true);
    });
  });
});
