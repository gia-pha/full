import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/info-card.js';
import type {
  InfoCard,
  InfoCardColor,
} from '../../src/components/info-card.js';

async function renderComponent(opts?: {
  label?: string;
  value?: string;
  color?: InfoCardColor;
}): Promise<InfoCard> {
  const el = document.createElement('app-info-card');
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.value !== undefined) el.value = opts.value;
  if (opts?.color !== undefined) el.color = opts.color;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getCard(el: InfoCard): HTMLElement {
  return el.querySelector('.info-card')!;
}

function getLabel(el: InfoCard): HTMLParagraphElement {
  return getCard(el).querySelector('p')!;
}

function getValue(el: InfoCard): HTMLParagraphElement {
  return el.querySelector('.info-card-value')!;
}

afterEach(() => {
  document.querySelectorAll('app-info-card').forEach((el) => el.remove());
});

describe('InfoCard', () => {
  it('renders the label', async () => {
    const el = await renderComponent({ label: 'Birth year' });
    expect(getLabel(el).textContent).toBe('Birth year');
  });

  it('renders the value', async () => {
    const el = await renderComponent({ value: '1950' });
    expect(getValue(el).textContent).toBe('1950');
  });

  it('defaults to the blue color variant', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(getCard(el).className).toContain('bg-blue-50');
  });

  it.each([
    ['pink', 'bg-pink-50'],
    ['purple', 'bg-purple-50'],
    ['amber', 'bg-amber-50'],
  ] as const)('applies the %s color variant', async (color, bg) => {
    const el = await renderComponent({ color, label: 'x' });
    expect(getCard(el).className).toContain(bg);
  });

  it('falls back to blue for an unknown color', async () => {
    const el = document.createElement('app-info-card');
    el.color = 'red' as InfoCardColor;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(getCard(el).className).toContain('bg-blue-50');
  });

  it('renders with empty label and value', async () => {
    const el = await renderComponent({});
    expect(getCard(el)).not.toBeNull();
    expect(getValue(el).textContent).toBe('');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(el.shadowRoot).toBeNull();
  });
});
