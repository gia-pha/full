import { describe, expect, it } from 'vitest';
import '../../src/components/person-avatar.js';
import type {
  AvatarSize,
  PersonAvatar,
} from '../../src/components/person-avatar.js';
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

const mockPerson = makePerson();

async function renderComponent(
  person: Person,
  opts?: {
    size?: AvatarSize;
  },
): Promise<PersonAvatar> {
  const el = document.createElement('person-avatar');
  el.person = person;
  if (opts?.size) el.size = opts.size;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getContent(el: PersonAvatar): string {
  return el.innerHTML;
}

describe('PersonAvatar', () => {
  it('renders male avatar with blue colors', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getContent(el);
    expect(rendered).toContain('bg-blue-100');
    expect(rendered).toContain('text-blue-600');
  });

  it('renders female avatar with pink colors', async () => {
    const female = makePerson({ gender: 'F', lastName: 'B' });
    const el = await renderComponent(female);
    const rendered = getContent(el);
    expect(rendered).toContain('bg-pink-100');
    expect(rendered).toContain('text-pink-600');
  });

  it('renders image when avatar URL is provided', async () => {
    const person = makePerson({
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male',
    });
    const el = await renderComponent(person);
    const rendered = getContent(el);
    expect(rendered).toContain('<img');
    expect(rendered).toContain(
      'https://xsgames.co/randomusers/avatar.php?g=male',
    );
    expect(rendered).toContain('object-cover');
  });

  it('does not render image when avatar URL is not provided', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getContent(el);
    expect(rendered).not.toContain('<img');
  });

  it('renders default SVG icon when no avatar URL', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getContent(el);
    expect(rendered).toContain('<svg');
    expect(rendered).toContain('viewBox="0 0 24 24"');
  });

  it('always uses rounded-full (circle shape)', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getContent(el);
    expect(rendered).toContain('rounded-full');
  });

  it('applies xs size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'xs' });
    const rendered = getContent(el);
    expect(rendered).toContain('w-6');
    expect(rendered).toContain('h-6');
  });

  it('applies sm size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'sm' });
    const rendered = getContent(el);
    expect(rendered).toContain('w-8');
    expect(rendered).toContain('h-8');
  });

  it('applies md size classes by default', async () => {
    const el = await renderComponent(mockPerson);
    const rendered = getContent(el);
    expect(rendered).toContain('w-12');
    expect(rendered).toContain('h-12');
  });

  it('applies lg size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'lg' });
    const rendered = getContent(el);
    expect(rendered).toContain('w-16');
    expect(rendered).toContain('h-16');
  });

  it('applies xl size classes', async () => {
    const el = await renderComponent(mockPerson, { size: 'xl' });
    const rendered = getContent(el);
    expect(rendered).toContain('w-20');
    expect(rendered).toContain('h-20');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent(mockPerson);
    expect(el.shadowRoot).toBeNull();
  });
});
