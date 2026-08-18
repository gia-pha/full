import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/avatar-stack.js';
import type { AvatarStack } from '../../src/components/avatar-stack.js';
import type { AvatarSize } from '../../src/components/person-avatar.js';
import type { Person } from '../../src/types/index.js';

const makePerson = (id: string, gender: 'M' | 'F'): Person => ({
  id,
  data: {
    firstName: id,
    lastName: 'Test',
    gender,
    generation: 1,
  },
  rels: { parents: [], spouses: [], children: [] },
});

const people = [
  makePerson('a', 'M'),
  makePerson('b', 'F'),
  makePerson('c', 'M'),
  makePerson('d', 'F'),
  makePerson('e', 'M'),
  makePerson('f', 'F'),
];

async function renderComponent(opts?: {
  people?: Person[];
  max?: number;
  size?: AvatarSize;
  label?: string;
  showOverflow?: boolean;
}): Promise<AvatarStack> {
  const el = document.createElement('app-avatar-stack');
  if (opts?.people !== undefined) el.people = opts.people;
  if (opts?.max !== undefined) el.max = opts.max;
  if (opts?.size !== undefined) el.size = opts.size;
  if (opts?.label !== undefined) el.label = opts.label;
  if (opts?.showOverflow !== undefined) el.showOverflow = opts.showOverflow;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getAvatars(el: AvatarStack): HTMLElement[] {
  return Array.from(el.querySelectorAll('person-avatar'));
}

afterEach(() => {
  document.querySelectorAll('app-avatar-stack').forEach((el) => el.remove());
});

describe('AvatarStack', () => {
  it('renders one avatar per person up to the default max of 5', async () => {
    const el = await renderComponent({ people });
    expect(getAvatars(el)).toHaveLength(5);
  });

  it('renders all people when fewer than max', async () => {
    const el = await renderComponent({ people: people.slice(0, 3) });
    expect(getAvatars(el)).toHaveLength(3);
  });

  it('honors a custom max', async () => {
    const el = await renderComponent({ people, max: 2 });
    expect(getAvatars(el)).toHaveLength(2);
  });

  it('passes each person to person-avatar', async () => {
    const el = await renderComponent({ people: people.slice(0, 2) });
    await el.updateComplete;
    const avatars = el.querySelectorAll(
      'person-avatar',
    ) as Array<HTMLElement & { person: Person }>;
    expect(avatars[0].person.id).toBe('a');
    expect(avatars[1].person.id).toBe('b');
  });

  it('stacks avatars with negative space and white borders', async () => {
    const el = await renderComponent({ people: people.slice(0, 2) });
    const stack = el.querySelector('.-space-x-2')!;
    expect(stack).not.toBeNull();
    const wrapped = stack!.querySelector('div')!;
    expect(wrapped.className).toContain('border-2');
    expect(wrapped.className).toContain('border-white');
  });

  it('passes the size prop to each avatar', async () => {
    const el = await renderComponent({ people: people.slice(0, 2), size: 'md' });
    const avatars = el.querySelectorAll('person-avatar') as Array<
      { size: AvatarSize }
    >;
    expect(avatars[0].size).toBe('md');
  });

  it('renders the label text when provided', async () => {
    const el = await renderComponent({ people, label: '6 người tham gia' });
    expect(el.querySelector('span')!.textContent).toBe('6 người tham gia');
  });

  it('renders no label span when label is empty', async () => {
    const el = await renderComponent({ people });
    expect(el.querySelector('span')).toBeNull();
  });

  it('renders nothing but the wrapper when people is empty', async () => {
    const el = await renderComponent({});
    expect(getAvatars(el)).toHaveLength(0);
  });

  it('renders a +N overflow badge when people exceed max', async () => {
    const el = await renderComponent({ people, max: 4 });
    const badge = el.querySelector('.text-xs');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('+2');
    expect(getAvatars(el)).toHaveLength(4);
  });

  it('does not render overflow badge when people fit within max', async () => {
    const el = await renderComponent({ people: people.slice(0, 3), max: 5 });
    expect(el.textContent).not.toContain('+');
  });

  it('hides the overflow badge when showOverflow is false', async () => {
    const el = await renderComponent({ people, max: 2, showOverflow: false });
    expect(el.textContent).not.toContain('+');
    expect(getAvatars(el)).toHaveLength(2);
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ people });
    expect(el.shadowRoot).toBeNull();
  });
});
