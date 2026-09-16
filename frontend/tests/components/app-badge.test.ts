import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-badge.js';
import type {
  AppBadge,
  BadgeColor,
  BadgeSize,
} from '../../src/components/app-badge.js';

async function renderComponent(opts?: {
  label?: string;
  color?: BadgeColor;
  size?: BadgeSize;
}): Promise<AppBadge> {
  const el = document.createElement('app-badge');
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.color !== undefined) el.color = opts.color;
  if (opts?.size !== undefined) el.size = opts.size;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getBadge(el: AppBadge): HTMLElement {
  return el.querySelector('.app-badge')!;
}

afterEach(() => {
  document.querySelectorAll('app-badge').forEach((el) => {
    el.remove();
  });
});

describe('AppBadge', () => {
  it('renders the label', async () => {
    const el = await renderComponent({ label: 'Reunion' });
    expect(getBadge(el).textContent).toBe('Reunion');
  });

  it('defaults to the gray color variant', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(getBadge(el).className).toContain('bg-gray-100');
    expect(getBadge(el).className).toContain('text-gray-500');
  });

  it('defaults to the md size', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(getBadge(el).className).toContain('px-3');
    expect(getBadge(el).className).toContain('py-1');
  });

  it('is always a rounded pill', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(getBadge(el).className).toContain('rounded-full');
    expect(getBadge(el).className).toContain('font-medium');
  });

  it.each([
    ['emerald', 'bg-emerald-100', 'text-emerald-700'],
    ['amber', 'bg-amber-100', 'text-amber-700'],
    ['blue', 'bg-blue-100', 'text-blue-700'],
    ['purple', 'bg-purple-100', 'text-purple-700'],
    ['red', 'bg-red-100', 'text-red-700'],
  ] as const)('applies the %s color variant with a dark-mode pair', async (color, bg, text) => {
    const el = await renderComponent({ color, label: 'x' });
    const classes = getBadge(el).className;
    expect(classes).toContain(bg);
    expect(classes).toContain(text);
    expect(classes).toContain(`dark:bg-${color}-900`);
    expect(classes).toContain(`dark:text-${color}-300`);
  });

  it('falls back to gray for an unknown color', async () => {
    const el = document.createElement('app-badge');
    el.color = 'lime' as BadgeColor;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(getBadge(el).className).toContain('bg-gray-100');
  });

  it('uses the compact sm size', async () => {
    const el = await renderComponent({ size: 'sm', label: '↗' });
    expect(getBadge(el).className).toContain('px-2');
    expect(getBadge(el).className).toContain('py-0.5');
    expect(getBadge(el).className).not.toContain('px-3');
  });

  it('falls back to md for an unknown size', async () => {
    const el = document.createElement('app-badge');
    el.size = 'xl' as BadgeSize;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(getBadge(el).className).toContain('px-3');
  });

  it('keeps consumer layout classes on the host untouched', async () => {
    const el = document.createElement('app-badge');
    el.className = 'ml-2';
    el.label = 'x';
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.classList.contains('ml-2')).toBe(true);
    expect(getBadge(el).className).not.toContain('ml-2');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(el.shadowRoot).toBeNull();
  });
});
