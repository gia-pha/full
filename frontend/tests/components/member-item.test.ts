import { describe, expect, it, vi } from 'vitest';
import { svg } from 'lit';
import '../../src/components/member-item.js';
import type { MemberItem } from '../../src/components/member-item.js';
import type { MemberAction } from '../../src/types/index.js';
import type { Person } from '../../src/types/index.js';

const makePerson = (
  overrides?: Partial<Person['data']> & { gender?: 'M' | 'F' },
): Person => ({
  id: 'test-1',
  data: {
    firstName: 'Văn',
    lastName: 'Nguyễn',
    gender: 'M',
    generation: 1,
    ...overrides,
  },
  rels: { parents: [], spouses: [], children: [] },
});

async function renderComponent(
  person: Person,
  opts?: {
    selected?: boolean;
    honorific?: string;
    locked?: boolean;
  },
): Promise<MemberItem> {
  const el = document.createElement('member-item');
  el.person = person;
  if (opts?.selected !== undefined) el.selected = opts.selected;
  if (opts?.honorific !== undefined) el.honorific = opts.honorific;
  if (opts?.locked !== undefined) el.locked = opts.locked;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getContent(el: MemberItem): string {
  return el.innerHTML;
}

describe('MemberItem', () => {
  it('renders person full name', async () => {
    const el = await renderComponent(makePerson());
    const rendered = getContent(el);
    expect(rendered).toContain('Văn Nguyễn');
  });

  it('renders person-avatar element', async () => {
    const el = await renderComponent(makePerson());
    expect(el.querySelector('person-avatar')).not.toBeNull();
  });

  it('passes person to avatar', async () => {
    const person = makePerson({ firstName: 'Test' });
    const el = await renderComponent(person);
    const avatar = el.querySelector('person-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar?.person).toBe(person);
  });

  it('uses sm size for avatar', async () => {
    const el = await renderComponent(makePerson());
    const avatar = el.querySelector('person-avatar');
    expect(avatar?.size).toBe('sm');
  });

  it('renders as div element', async () => {
    const el = await renderComponent(makePerson());
    expect(el.querySelector('div')).not.toBeNull();
  });

  it('has green hover classes', async () => {
    const el = await renderComponent(makePerson());
    const rendered = getContent(el);
    expect(rendered).toContain('hover:border-emerald-300');
    expect(rendered).toContain('hover:bg-emerald-50');
  });

  it('has border classes', async () => {
    const el = await renderComponent(makePerson());
    const rendered = getContent(el);
    expect(rendered).toContain('border');
    expect(rendered).toContain('rounded-xl');
  });

  it('shows role badge with correct color for admin', async () => {
    const el = await renderComponent(makePerson({ role: 'admin' }));
    const rendered = getContent(el);
    expect(rendered).toContain('Admin');
    expect(rendered).toContain('bg-red-100');
  });

  it('shows role badge with correct color for editor', async () => {
    const el = await renderComponent(makePerson({ role: 'editor' }));
    const rendered = getContent(el);
    expect(rendered).toContain('Editor');
    expect(rendered).toContain('bg-blue-100');
  });

  it('shows role badge with correct color for treasurer', async () => {
    const el = await renderComponent(makePerson({ role: 'treasurer' }));
    const rendered = getContent(el);
    expect(rendered).toContain('Treasurer');
    expect(rendered).toContain('bg-amber-100');
  });

  it('shows role badge with correct color for member', async () => {
    const el = await renderComponent(makePerson({ role: 'member' }));
    const rendered = getContent(el);
    expect(rendered).toContain('Member');
    expect(rendered).toContain('bg-gray-100');
  });

  it('shows deceased indicator for deceased person', async () => {
    const el = await renderComponent(makePerson({ deathYear: '2020' }));
    const rendered = getContent(el);
    expect(rendered).toContain('✝');
  });

  it('does not show deceased indicator for living person', async () => {
    const el = await renderComponent(makePerson());
    const rendered = getContent(el);
    expect(rendered).not.toContain('✝');
  });

  it('shows birth year', async () => {
    const el = await renderComponent(makePerson({ birthYear: '1985' }));
    const rendered = getContent(el);
    expect(rendered).toContain('1985');
  });

  it('shows birth and death years', async () => {
    const el = await renderComponent(
      makePerson({ birthYear: '1950', deathYear: '2020' }),
    );
    const rendered = getContent(el);
    expect(rendered).toContain('1950-2020');
  });

  it('shows generation', async () => {
    const el = await renderComponent(makePerson({ generation: 5 }));
    const rendered = getContent(el);
    expect(rendered).toContain('Gen');
    expect(rendered).toContain('>5<');
  });

  it('shows honorific when provided', async () => {
    const el = await renderComponent(makePerson(), { honorific: 'Bố' });
    const rendered = getContent(el);
    expect(rendered).toContain('Bố');
  });

  it('does not show honorific when empty', async () => {
    const el = await renderComponent(makePerson(), { honorific: '' });
    const rendered = getContent(el);
    expect(rendered).not.toContain('Bố');
  });

  it('shows lock icon when locked is true', async () => {
    const el = await renderComponent(makePerson(), { locked: true });
    const rendered = getContent(el);
    expect(rendered).toContain('🔒');
  });

  it('does not show lock icon when locked is false', async () => {
    const el = await renderComponent(makePerson(), { locked: false });
    const rendered = getContent(el);
    expect(rendered).not.toContain('🔒');
  });

  it('renders action buttons from array property', async () => {
    const el = await renderComponent(makePerson());
    const onClick = vi.fn();
    el.actions = [
      { label: 'View', icon: svg`<svg></svg>`, onClick },
      { label: 'Delete', icon: svg`<svg></svg>`, onClick },
    ];
    await el.updateComplete;
    const rendered = getContent(el);
    expect(rendered).toContain('View');
    expect(rendered).toContain('Delete');
    const buttons = el.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    buttons[0].click();
    expect(onClick).toHaveBeenCalled();
  });

  it('applies selected styles when selected is true', async () => {
    const el = await renderComponent(makePerson(), { selected: true });
    const rendered = getContent(el);
    expect(rendered).toContain('bg-emerald-50');
    expect(rendered).toContain('border-emerald-300');
    expect(rendered).toContain('You');
  });

  it('does not apply selected styles when selected is false', async () => {
    const el = await renderComponent(makePerson(), { selected: false });
    const rendered = getContent(el);
    expect(rendered).not.toContain('bg-emerald-50 border-emerald-300');
    expect(rendered).not.toContain('You');
  });

  it('renders female person name', async () => {
    const el = await renderComponent(
      makePerson({ gender: 'F', firstName: 'Hương', lastName: 'Trần' }),
    );
    const rendered = getContent(el);
    expect(rendered).toContain('Hương Trần');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent(makePerson());
    expect(el.shadowRoot).toBeNull();
  });

  it('renders with avatar image when person has avatar URL', async () => {
    const person = makePerson({
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
    });
    const el = await renderComponent(person);
    const avatar = el.querySelector('person-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar?.person.data.avatar).toBe(
      'https://xsgames.co/randomusers/avatar.php?g=male',
    );
  });
});
