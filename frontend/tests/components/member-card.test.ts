import { describe, expect, it } from 'vitest';
import '../../src/components/member-card.js';
import type { MemberCard } from '../../src/components/member-card.js';
import type { RelationCard } from '../../src/components/relation-card.js';
import type { Person } from '../../src/types/index.js';

type PersonDataOverrides = Partial<
  Pick<
    Person['data'],
    | 'firstName'
    | 'lastName'
    | 'gender'
    | 'birthYear'
    | 'deathYear'
    | 'generation'
    | 'role'
    | 'avatar'
    | 'notes'
  >
>;

const makePerson = (
  id: string,
  overrides?: PersonDataOverrides & { rels?: Partial<Person['rels']> },
): Person => {
  const { rels, ...data } = overrides ?? {};
  return {
    id,
    data: {
      firstName: 'Văn',
      lastName: 'Nguyễn',
      gender: 'M',
      generation: 1,
      ...data,
    },
    rels: {
      parents: [],
      spouses: [],
      children: [],
      ...rels,
    },
  };
};

async function renderComponent(
  person: Person,
  opts?: {
    persons?: Person[];
    currentPersonId?: string;
    honorific?: string;
    roleLabel?: string;
    locked?: boolean;
  },
): Promise<MemberCard> {
  const el = document.createElement('member-card');
  el.person = person;
  if (opts?.persons !== undefined) el.persons = opts.persons;
  if (opts?.currentPersonId !== undefined)
    el.currentPersonId = opts.currentPersonId;
  if (opts?.honorific !== undefined) el.honorific = opts.honorific;
  if (opts?.roleLabel !== undefined) el.roleLabel = opts.roleLabel;
  if (opts?.locked !== undefined) el.locked = opts.locked;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function awaitEvent(el: MemberCard, name: string): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener(name, (e) => resolve(e as CustomEvent), { once: true });
  });
}

describe('MemberCard', () => {
  it('renders nothing when person is not set', async () => {
    const el = document.createElement('member-card');
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.innerHTML).not.toContain('member-card-panel');
    expect(el.querySelector('.member-card-panel')).toBeNull();
    el.remove();
  });

  it('renders person full name', async () => {
    const el = await renderComponent(makePerson('p1'));
    expect(el.innerHTML).toContain('Văn Nguyễn');
  });

  it('renders panel with header and close button', async () => {
    const el = await renderComponent(makePerson('p1'));
    expect(el.querySelector('.member-card-panel')).not.toBeNull();
    expect(el.querySelector('.member-card-panel .member-close')).not.toBeNull();
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent(makePerson('p1'));
    expect(el.shadowRoot).toBeNull();
  });

  it('renders person-avatar with person', async () => {
    const person = makePerson('p1');
    const el = await renderComponent(person);
    const avatar = el.querySelector('person-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar?.person).toBe(person);
  });

  it('shows honorific when provided', async () => {
    const el = await renderComponent(makePerson('p1'), { honorific: 'Bố' });
    expect(el.textContent).toContain('Danh xưng: Bố');
  });

  it('does not show honorific when empty', async () => {
    const el = await renderComponent(makePerson('p1'));
    expect(el.textContent).not.toContain('Danh xưng');
  });

  it('shows You badge when person is current person', async () => {
    const el = await renderComponent(makePerson('p1'), {
      currentPersonId: 'p1',
    });
    const content = el.querySelector('.member-card-panel')!.innerHTML;
    expect(content).toContain('Bạn');
  });

  it('does not show You badge for other persons', async () => {
    const el = await renderComponent(makePerson('p1'), {
      currentPersonId: 'p2',
    });
    expect(el.querySelector('.member-card-panel')!.innerHTML).not.toContain(
      'Bạn',
    );
  });

  it('shows deceased badge for deceased person', async () => {
    const el = await renderComponent(makePerson('p1', { deathYear: '2020' }));
    expect(el.textContent).toContain('✝ Mất');
  });

  it('does not show deceased badge for living person', async () => {
    const el = await renderComponent(makePerson('p1'));
    expect(el.textContent).not.toContain('✝ Mất');
  });

  it('renders info cards for birth year, gender, generation, role', async () => {
    const el = await renderComponent(
      makePerson('p1', {
        birthYear: '1980',
        gender: 'F',
        generation: 3,
        role: 'admin',
      }),
    );
    const content = el.innerHTML;
    expect(content).toContain('Năm sinh');
    expect(content).toContain('1980');
    expect(content).toContain('Giới tính');
    expect(content).toContain('Nữ');
    expect(content).toContain('Thế hệ');
    expect(content).toContain('>3<');
    expect(content).toContain('Vai trò');
    expect(content).toContain('Quản trị');
  });

  it('shows dash for missing birth year', async () => {
    const el = await renderComponent(makePerson('p1'));
    const cards = el.querySelectorAll('app-info-card');
    expect(cards[0]?.value).toBe('-');
  });

  it('uses roleLabel prop when provided', async () => {
    const el = await renderComponent(makePerson('p1', { role: 'admin' }), {
      roleLabel: 'Quản trị',
    });
    expect(el.innerHTML).toContain('Quản trị');
  });

  it('shows spouse relation card when spouse exists', async () => {
    const person = makePerson('p1', {
      rels: { parents: [], spouses: ['p2'], children: [] },
    });
    const spouse = makePerson('p2', {
      firstName: 'Lan',
      lastName: 'Trần',
      gender: 'F',
      birthYear: '1982',
    });
    const el = await renderComponent(person, { persons: [person, spouse] });
    const card = el.querySelector(
      '.member-card-panel app-relation-card',
    ) as RelationCard | null;
    expect(card).not.toBeNull();
    expect(card?.label).toBe('Vợ/chồng');
    expect(card?.person).toBe(spouse);
    expect(card?.color).toBe('pink');
  });

  it('renders a card for each spouse and parent', async () => {
    const person = makePerson('p1', {
      rels: { parents: ['p0', 'p3'], spouses: ['p2', 'p4'], children: [] },
    });
    const persons = [
      person,
      makePerson('p2', { firstName: 'Lan' }),
      makePerson('p4', { firstName: 'Hoa' }),
      makePerson('p0', { firstName: 'Cường' }),
      makePerson('p3', { firstName: 'Em' }),
    ];
    const el = await renderComponent(person, { persons });
    const cards = [
      ...el.querySelectorAll('app-relation-card'),
    ] as RelationCard[];
    expect(cards.length).toBe(4);
    expect(cards.filter((c) => c.color === 'pink').length).toBe(2);
    expect(cards.filter((c) => c.color === 'blue').length).toBe(2);
  });

  it('shows parent relation card when parent exists', async () => {
    const person = makePerson('p1', {
      rels: { parents: ['p0'], spouses: [], children: [] },
    });
    const parent = makePerson('p0', {
      firstName: 'Cường',
      lastName: 'Nguyễn',
      birthYear: '1955',
    });
    const el = await renderComponent(person, { persons: [person, parent] });
    const card = el.querySelector(
      '.member-card-panel app-relation-card',
    ) as RelationCard | null;
    expect(card).not.toBeNull();
    expect(card?.label).toBe('Bố mẹ');
    expect(card?.person).toBe(parent);
    expect(card?.color).toBe('blue');
  });

  it('does not render relation cards without relations', async () => {
    const el = await renderComponent(makePerson('p1'), {
      persons: [makePerson('p1')],
    });
    expect(el.querySelectorAll('app-relation-card').length).toBe(0);
  });

  it('dispatches select event with spouse id from relation card', async () => {
    const person = makePerson('p1', {
      rels: { parents: [], spouses: ['p2'], children: [] },
    });
    const spouse = makePerson('p2', { firstName: 'Lan', birthYear: '1982' });
    const el = await renderComponent(person, { persons: [person, spouse] });
    const selectEvent = awaitEvent(el, 'select');
    (
      el
        .querySelector('.member-card-panel app-relation-card')!
        .querySelector('.relation-card') as HTMLButtonElement
    ).click();
    const event = await selectEvent;
    expect(event.detail).toEqual({ id: 'p2' });
  });

  it('renders children list with names and years', async () => {
    const person = makePerson('p1', {
      rels: { parents: [], spouses: [], children: ['c1', 'c2'] },
    });
    const c1 = makePerson('c1', { firstName: 'An', birthYear: '2010' });
    const c2 = makePerson('c2', {
      firstName: 'Bình',
      gender: 'F',
      birthYear: '2012',
    });
    const el = await renderComponent(person, {
      persons: [person, c1, c2],
    });
    const sheet = el.querySelector('.member-card-panel')!;
    expect(sheet.textContent).toContain('Con cái (2)');
    expect(sheet.textContent).toContain('An Nguyễn');
    expect(sheet.textContent).toContain('Bình Nguyễn');
    expect(sheet.textContent).toContain('2010');
    expect(sheet.textContent).toContain('2012');
  });

  it('dispatches select event with child id on child click', async () => {
    const person = makePerson('p1', {
      rels: { parents: [], spouses: [], children: ['c1'] },
    });
    const c1 = makePerson('c1', { firstName: 'An' });
    const el = await renderComponent(person, { persons: [person, c1] });
    const selectEvent = awaitEvent(el, 'select');
    (
      el
        .querySelector('.member-card-panel app-relation-card')!
        .querySelector('.relation-card') as HTMLButtonElement
    ).click();
    const event = await selectEvent;
    expect(event.detail).toEqual({ id: 'c1' });
  });

  it('does not render children section without children', async () => {
    const el = await renderComponent(makePerson('p1'));
    expect(el.innerHTML).not.toContain('Con cái (');
  });

  it('shows notes when not locked and person has notes', async () => {
    const el = await renderComponent(makePerson('p1', { notes: 'A note' }));
    const content = el.querySelector('.member-card-panel')!.innerHTML;
    expect(content).toContain('Ghi chú');
    expect(content).toContain('A note');
  });

  it('shows limited access box when locked', async () => {
    const el = await renderComponent(makePerson('p1', { notes: 'A note' }), {
      locked: true,
      currentPersonId: 'p2',
    });
    const content = el.querySelector('.member-card-panel')!.textContent!;
    expect(content).toContain('🔒 Truy cập hạn chế');
    expect(content).not.toContain('A note');
  });

  it('shows notes for current person even when locked', async () => {
    const el = await renderComponent(makePerson('p1', { notes: 'A note' }), {
      locked: true,
      currentPersonId: 'p1',
    });
    const content = el.querySelector('.member-card-panel')!.textContent!;
    expect(content).not.toContain('🔒 Truy cập hạn chế');
    expect(content).toContain('A note');
  });

  it('shows edit button for editor role', async () => {
    const el = await renderComponent(makePerson('p1', { role: 'editor' }));
    expect(el.querySelector('.member-edit')).not.toBeNull();
  });

  it('shows edit button for admin role', async () => {
    const el = await renderComponent(makePerson('p1', { role: 'admin' }));
    expect(el.querySelector('.member-edit')).not.toBeNull();
  });

  it('does not show edit button for member role', async () => {
    const el = await renderComponent(makePerson('p1', { role: 'member' }));
    expect(el.querySelector('.member-edit')).toBeNull();
  });

  it('dispatches edit event on edit click', async () => {
    const el = await renderComponent(makePerson('p1', { role: 'admin' }));
    const editEvent = awaitEvent(el, 'edit');
    (
      el.querySelector('.member-card-panel .member-edit') as HTMLButtonElement
    ).click();
    const event = await editEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('shows delete button for other persons', async () => {
    const el = await renderComponent(makePerson('p1'), {
      currentPersonId: 'p2',
    });
    expect(el.querySelector('.member-delete')).not.toBeNull();
  });

  it('does not show delete button for current person', async () => {
    const el = await renderComponent(makePerson('p1'), {
      currentPersonId: 'p1',
    });
    expect(el.querySelector('.member-delete')).toBeNull();
  });

  it('dispatches delete event on delete click', async () => {
    const el = await renderComponent(makePerson('p1'), {
      currentPersonId: 'p2',
    });
    const deleteEvent = awaitEvent(el, 'delete');
    (
      el.querySelector('.member-card-panel .member-delete') as HTMLButtonElement
    ).click();
    const event = await deleteEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('dispatches close event on close button click', async () => {
    const el = await renderComponent(makePerson('p1'));
    const closeEvent = awaitEvent(el, 'close');
    (
      el.querySelector('.member-card-panel .member-close') as HTMLButtonElement
    ).click();
    const event = await closeEvent;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('renders female person with pink gender color', async () => {
    const el = await renderComponent(
      makePerson('p1', { gender: 'F', firstName: 'Hương', lastName: 'Trần' }),
    );
    expect(el.innerHTML).toContain('Hương Trần');
    expect(el.innerHTML).toContain('Nữ');
  });

  it('re-renders when person changes', async () => {
    const person = makePerson('p1');
    const el = await renderComponent(person);
    const other = makePerson('p2', { firstName: 'Hòa', lastName: 'Phạm' });
    el.person = other;
    await el.updateComplete;
    expect(el.innerHTML).toContain('Hòa Phạm');
  });
});
