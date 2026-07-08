import { describe, expect, it } from 'vitest';
import '../../components/person-avatar.js';
import type {
  AvatarShape,
  AvatarSize,
  PersonAvatar,
} from '../../components/person-avatar.js';
import type { Person } from '../../types/index.js';

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

const mockPerson = makePerson();

async function renderComponent(
  person: Person,
  opts?: {
    size?: AvatarSize;
    shape?: AvatarShape;
    showDeceased?: boolean;
    withName?: boolean;
  },
): Promise<PersonAvatar> {
  const el = document.createElement('person-avatar');
  el.person = person;
  if (opts?.size) el.size = opts.size;
  if (opts?.shape) el.shape = opts.shape;
  if (opts?.showDeceased !== undefined) el.showDeceased = opts.showDeceased;
  if (opts?.withName !== undefined) el.withName = opts.withName;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getShadowContent(el: PersonAvatar): string {
  return el.shadowRoot?.innerHTML || '';
}

describe('PersonAvatar', () => {
  it('renders male avatar with blue colors', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getShadowContent(el);
    expect(rendered).toContain('bg-blue-100');
    expect(rendered).toContain('text-blue-600');
  });

  it('renders female avatar with pink colors', async () => {
    const female = makePerson({ gender: 'F', lastName: 'B' });
    const el = await renderComponent(female);
    const rendered = getShadowContent(el);
    expect(rendered).toContain('bg-pink-100');
    expect(rendered).toContain('text-pink-600');
  });

  it('shows deceased indicator when enabled and person is deceased', async () => {
    const deceased = makePerson({ deathYear: '2020' });
    const el = await renderComponent(deceased, { showDeceased: true });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('✝');
  });

  it('does not show deceased indicator when disabled', async () => {
    const deceased = makePerson({ deathYear: '2020' });
    const el = await renderComponent(deceased, { showDeceased: false });
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('✝');
  });

  it('does not show deceased indicator for living person', async () => {
    const el = await renderComponent(mockPerson, { showDeceased: true });
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('✝');
  });

  it('renders name when withName is true', async () => {
    const el = await renderComponent(mockPerson, { withName: true });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('Văn');
    expect(rendered).toContain('Nguyễn');
  });

  it('does not render name when withName is false', async () => {
    const el = await renderComponent(mockPerson, { withName: false });
    const rendered = getShadowContent(el);
    expect(rendered).not.toContain('Văn Nguyễn');
  });

  it('uses rounded shape with gender symbol for male', async () => {
    const el = await renderComponent(mockPerson, { shape: 'rounded' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('rounded-2xl');
    expect(rendered).toContain('♂');
  });

  it('uses rounded shape with gender symbol for female', async () => {
    const female = makePerson({ gender: 'F' });
    const el = await renderComponent(female, { shape: 'rounded' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('♀');
  });

  it('uses circle shape with initial letter', async () => {
    const el = await renderComponent(mockPerson, { shape: 'circle' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('rounded-full');
    expect(rendered).toContain('N');
  });

  it('applies xs size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'xs' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('w-6');
    expect(rendered).toContain('h-6');
  });

  it('applies sm size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'sm' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('w-8');
    expect(rendered).toContain('h-8');
  });

  it('applies md size classes by default', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getShadowContent(el);
    expect(rendered).toContain('w-12');
    expect(rendered).toContain('h-12');
  });

  it('applies lg size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'lg' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('w-16');
    expect(rendered).toContain('h-16');
  });

  it('applies xl size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'xl' });
    const rendered = getShadowContent(el);
    expect(rendered).toContain('w-20');
    expect(rendered).toContain('h-20');
  });

  it('renders with shadow DOM', async () => {
    const el = await renderComponent(mockPerson);
    expect(el.shadowRoot).not.toBeNull();
  });
});
