import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/lunar-date.js';
import type {
  LunarDate,
  LunarDateLang,
  LunarDateVariant,
} from '../../src/components/lunar-date.js';

async function renderComponent(opts?: {
  date?: string;
  lang?: LunarDateLang;
  variant?: LunarDateVariant;
}): Promise<LunarDate> {
  const el = document.createElement('app-lunar-date');
  if (opts?.date !== undefined) el.date = opts.date;
  if (opts?.lang !== undefined) el.lang = opts.lang;
  if (opts?.variant !== undefined) el.variant = opts.variant;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getWrapper(el: LunarDate): HTMLElement | null {
  return el.querySelector('.lunar-date');
}

function getText(el: LunarDate): string | null {
  return (
    (el.querySelector('.lunar-date-text') as HTMLElement | null)?.textContent ??
    null
  );
}

afterEach(() => {
  document.querySelectorAll('app-lunar-date').forEach((el) => {
    el.remove();
  });
});

describe('AppLunarDate', () => {
  it('renders nothing when no date is set', async () => {
    const el = await renderComponent();
    expect(getWrapper(el)).toBeNull();
    expect(el.textContent).toBe('');
  });

  it('renders nothing for an unparseable date', async () => {
    const el = await renderComponent({ date: 'not-a-date' });
    expect(getWrapper(el)).toBeNull();
  });

  it('renders nothing for an out-of-range month or day', async () => {
    const badMonth = await renderComponent({ date: '2024-13-01' });
    expect(getWrapper(badMonth)).toBeNull();
    const badDay = await renderComponent({ date: '2024-04-31' });
    expect(getWrapper(badDay)).toBeNull();
  });

  it('renders the Vietnamese full lunar date by default', async () => {
    const el = await renderComponent({ date: '2025-01-29' });
    const wrapper = getWrapper(el)!;
    expect(getText(el)).toBe('1/Giêng/2025');
    expect(wrapper.className).toContain('text-amber-600');
    expect(wrapper.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      '🌙',
    );
  });

  it('converts a mid-year solar date', async () => {
    const el = await renderComponent({ date: '1990-06-15' });
    expect(getText(el)).toBe('21/Năm/1990');
  });

  it('renders the English full lunar date when lang is en', async () => {
    const el = await renderComponent({ date: '2025-01-29', lang: 'en' });
    expect(getText(el)).toBe('1 Month 1 2025 AL');
  });

  it('falls back to Vietnamese for an unknown lang', async () => {
    const el = await renderComponent({
      date: '2025-01-29',
      lang: 'fr' as LunarDateLang,
    });
    expect(getText(el)).toBe('1/Giêng/2025');
  });

  it('renders the compact day/roman-month variant without the icon', async () => {
    const el = await renderComponent({
      date: '2025-01-29',
      variant: 'compact',
    });
    const wrapper = getWrapper(el)!;
    expect(wrapper.textContent).toBe('1/I');
    expect(wrapper.className).toContain('text-[9px]');
    expect(wrapper.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('renders compact months as roman numerals', async () => {
    const el = await renderComponent({
      date: '1990-06-15',
      variant: 'compact',
    });
    expect(getWrapper(el)!.textContent).toBe('21/V');
  });

  it('falls back to the full variant for an unknown variant', async () => {
    const el = await renderComponent({
      date: '2025-01-29',
      variant: 'bogus' as LunarDateVariant,
    });
    expect(getText(el)).toBe('1/Giêng/2025');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ date: '2025-01-29' });
    expect(el.shadowRoot).toBeNull();
  });
});
