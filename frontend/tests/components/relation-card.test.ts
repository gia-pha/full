import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/relation-card.js';
import type {
  RelationCard,
  RelationCardColor,
} from '../../src/components/relation-card.js';
import type { Person } from '../../src/types/index.js';

const makePerson = (overrides?: Partial<Person['data']>): Person => ({
  id: 'p1',
  data: {
    firstName: 'A',
    lastName: 'Nguyễn',
    gender: 'M',
    generation: 1,
    ...overrides,
  },
  rels: { parents: [], spouses: [], children: [] },
});

async function renderComponent(opts?: {
  label?: string;
  person?: Person;
  color?: RelationCardColor;
}): Promise<RelationCard> {
  const el = document.createElement('app-relation-card');
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.person !== undefined) el.person = opts.person;
  if (opts?.color !== undefined) el.color = opts.color;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getCard(el: RelationCard): HTMLButtonElement {
  return el.querySelector('.relation-card')!;
}

function awaitSelect(el: RelationCard): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener('select', (e) => resolve(e as CustomEvent), {
      once: true,
    });
  });
}

afterEach(() => {
  document.querySelectorAll('app-relation-card').forEach((el) => {
    el.remove();
  });
});

describe('RelationCard', () => {
  it('renders the label', async () => {
    const el = await renderComponent({ label: 'Spouse' });
    expect(getCard(el).textContent).toContain('Spouse');
  });

  it('renders the name only when no birth year', async () => {
    const el = await renderComponent({ person: makePerson() });
    expect(getCard(el).textContent).toContain('A Nguyễn');
    expect(getCard(el).textContent).not.toContain('(');
  });

  it('renders name with birth year', async () => {
    const el = await renderComponent({
      person: makePerson({ birthYear: '1960' }),
    });
    expect(getCard(el).textContent).toContain('A Nguyễn (1960)');
  });

  it('renders name with birth and death years', async () => {
    const el = await renderComponent({
      person: makePerson({ birthYear: '1920', deathYear: '1990' }),
    });
    expect(getCard(el).textContent).toContain('A Nguyễn (1920 - 1990)');
  });

  it('renders the male gender symbol', async () => {
    const el = await renderComponent({ person: makePerson({ gender: 'M' }) });
    expect(getCard(el).textContent).toContain('♂');
  });

  it('renders the female gender symbol', async () => {
    const el = await renderComponent({ person: makePerson({ gender: 'F' }) });
    expect(getCard(el).textContent).toContain('♀');
  });

  it('defaults to the blue color variant', async () => {
    const el = await renderComponent({ label: 'Parent' });
    expect(getCard(el).className).toContain('bg-blue-50');
    expect(getCard(el).className).toContain('border-blue-200');
    expect(getCard(el).className).toContain('hover:bg-blue-100');
  });

  it('applies the pink color variant', async () => {
    const el = await renderComponent({ label: 'Spouse', color: 'pink' });
    expect(getCard(el).className).toContain('bg-pink-50');
    expect(getCard(el).className).toContain('border-pink-200');
    expect(getCard(el).className).toContain('hover:bg-pink-100');
  });

  it('applies the green color variant', async () => {
    const el = await renderComponent({ label: 'Child', color: 'green' });
    expect(getCard(el).className).toContain('bg-green-50');
    expect(getCard(el).className).toContain('border-green-200');
    expect(getCard(el).className).toContain('hover:bg-green-100');
  });

  it('falls back to blue for an unknown color', async () => {
    const el = document.createElement('app-relation-card');
    el.person = makePerson();
    el.color = 'yellow' as RelationCardColor;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(getCard(el).className).toContain('bg-blue-50');
  });

  it('dispatches select event with the person when the card is clicked', async () => {
    const person = makePerson();
    const el = await renderComponent({ label: 'Spouse', person });
    const selectEvent = awaitSelect(el);
    getCard(el).click();
    const event = await selectEvent;
    expect(event.type).toBe('select');
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
    expect(event.detail).toEqual({ person });
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ label: 'x' });
    expect(el.shadowRoot).toBeNull();
  });
});
