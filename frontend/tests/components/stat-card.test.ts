import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/stat-card.js';
import type { StatCard, StatCardColor } from '../../src/components/stat-card.js';

async function renderComponent(opts?: {
  icon?: string;
  label?: string;
  value?: string;
  color?: StatCardColor;
  classes?: string;
}): Promise<StatCard> {
  const el = document.createElement('app-stat-card');
  if (opts?.icon !== undefined) el.icon = opts.icon;
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.value !== undefined) el.value = opts.value;
  if (opts?.color !== undefined) el.color = opts.color;
  if (opts?.classes !== undefined) el.classes = opts.classes;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getCard(el: StatCard): HTMLElement {
  return el.querySelector('.stat-card')!;
}

function getLabel(el: StatCard): HTMLParagraphElement {
  return getCard(el).querySelector('p')!;
}

function getValue(el: StatCard): HTMLParagraphElement {
  return el.querySelector('.stat-card-value')!;
}

afterEach(() => {
  document.querySelectorAll('app-stat-card').forEach((el) => el.remove());
});

describe('StatCard', () => {
  it('renders icon and label together', async () => {
    const el = await renderComponent({ icon: '📍', label: 'Origin' });
    expect(getLabel(el).textContent).toBe('📍 Origin');
  });

  it('renders the value', async () => {
    const el = await renderComponent({ value: 'Hà Nội' });
    expect(getValue(el).textContent).toBe('Hà Nội');
  });

  it('defaults to the blue color variant', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(getCard(el).className).toContain('bg-blue-50');
    expect(getCard(el).className).toContain('border-blue-200');
  });

  it.each([
    ['amber', 'bg-amber-50', 'border-amber-200'],
    ['green', 'bg-green-50', 'border-green-200'],
    ['purple', 'bg-purple-50', 'border-purple-200'],
  ] as const)('applies the %s color variant', async (color, bg, border) => {
    const el = await renderComponent({ color, label: 'x' });
    expect(getCard(el).className).toContain(bg);
    expect(getCard(el).className).toContain(border);
  });

  it('falls back to blue for an unknown color', async () => {
    const el = document.createElement('app-stat-card');
    el.color = 'red' as StatCardColor;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(getCard(el).className).toContain('bg-blue-50');
  });

  it('applies extra classes (e.g. grid span)', async () => {
    const el = await renderComponent({ classes: 'sm:col-span-2' });
    expect(getCard(el).className).toContain('sm:col-span-2');
  });

  it('renders with no label or value when empty', async () => {
    const el = await renderComponent({});
    expect(getCard(el)).not.toBeNull();
    expect(getValue(el).textContent).toBe('');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(el.shadowRoot).toBeNull();
  });
});
