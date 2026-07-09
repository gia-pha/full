import { describe, expect, it } from 'vitest';
import '../../src/components/member-item.js';
import type { MemberItem } from '../../src/components/member-item.js';
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
  opts?: { selected?: boolean; showRole?: boolean },
): Promise<MemberItem> {
  const el = document.createElement('member-item');
  el.person = person;
  if (opts?.selected !== undefined) el.selected = opts.selected;
  if (opts?.showRole !== undefined) el.showRole = opts.showRole;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getShadowContent(el: MemberItem): string {
  return el.shadowRoot?.innerHTML || '';
}

describe('MemberItem', () => {
  it('renders person full name', async () => {
    const el = await renderComponent(makePerson());
    const rendered = getShadowContent(el);
    expect(rendered).toContain('Văn Nguyễn');
  });

  it('renders person-avatar element', async () => {
    const el = await renderComponent(makePerson());
    expect(el.shadowRoot?.querySelector('person-avatar')).not.toBeNull();
  });

  it('passes person to avatar', async () => {
    const person = makePerson({ firstName: 'Test' });
    const el = await renderComponent(person);
    const avatar = el.shadowRoot?.querySelector('person-avatar');
    expect(avatar).not.toBeNull();
    expect(avatar?.person).toBe(person);
  });

  it('uses sm size for avatar', async () => {
    const el = await renderComponent(makePerson());
    const avatar = el.shadowRoot?.querySelector('person-avatar');
    expect(avatar?.size).toBe('sm');
  });

  it('uses circle shape for avatar', async () => {
    const el = await renderComponent(makePerson());
    const avatar = el.shadowRoot?.querySelector('person-avatar');
    expect(avatar?.shape).toBe('circle');
  });

  it('does not show role by default', async () => {
    const el = await renderComponent(makePerson({ role: 'Admin' }));
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('Admin');
  });

  it('shows role when showRole is true', async () => {
    const el = await renderComponent(makePerson({ role: 'Admin' }), {
      showRole: true,
    });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('Admin');
  });

  it('hides role when showRole is false', async () => {
    const el = await renderComponent(makePerson({ role: 'Admin' }), {
      showRole: false,
    });
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('Admin');
  });

  it('shows deceased indicator for deceased person', async () => {
    const el = await renderComponent(makePerson({ deathYear: '2020' }));
    const rendered = getShadowContent(el);
    expect(rendered).toContain('✝');
    expect(rendered).toContain('2020');
  });

  it('does not show deceased indicator for living person', async () => {
    const el = await renderComponent(makePerson());
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('✝');
  });

  it('does not show deceased when deathYear is empty', async () => {
    const el = await renderComponent(makePerson({ deathYear: '' }));
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('✝');
  });

  it('applies selected attribute to item when selected is true', async () => {
    const el = await renderComponent(makePerson(), { selected: true });
    const item = el.shadowRoot?.querySelector('.item');
    expect(item?.hasAttribute('selected')).toBe(true);
  });

  it('does not apply selected attribute when selected is false', async () => {
    const el = await renderComponent(makePerson(), { selected: false });
    const item = el.shadowRoot?.querySelector('.item');
    expect(item?.hasAttribute('selected')).toBe(false);
  });

  it('renders with shadow DOM', async () => {
    const el = await renderComponent(makePerson());
    expect(el.shadowRoot).not.toBeNull();
  });

  it('renders female person name', async () => {
    const el = await renderComponent(
      makePerson({ gender: 'F', firstName: 'Hương', lastName: 'Trần' }),
    );
    const rendered = getShadowContent(el);
    expect(rendered).toContain('Hương Trần');
  });

  it('renders with generation info in person data', async () => {
    const el = await renderComponent(makePerson({ generation: 5 }));
    expect(el.person.data.generation).toBe(5);
  });
});
