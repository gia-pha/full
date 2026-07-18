import { describe, expect, it } from 'vitest';
import '../../src/components/role-badge.js';
import type { RoleBadge } from '../../src/components/role-badge.js';

async function renderComponent(opts?: { name?: string; label?: string }): Promise<RoleBadge> {
  const el = document.createElement('role-badge');
  if (opts?.name !== undefined) el.name = opts.name;
  if (opts?.label !== undefined) el.label = opts.label;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getContent(el: RoleBadge): string {
  return el.innerHTML;
}

describe('RoleBadge', () => {
  it('renders admin role with correct label and color', async () => {
    const el = await renderComponent({ name: 'admin' });
    const rendered = getContent(el);
    expect(rendered).toContain('Admin');
    expect(rendered).toContain('bg-red-100');
  });

  it('renders editor role with correct label and color', async () => {
    const el = await renderComponent({ name: 'editor' });
    const rendered = getContent(el);
    expect(rendered).toContain('Editor');
    expect(rendered).toContain('bg-blue-100');
  });

  it('renders treasurer role with correct label and color', async () => {
    const el = await renderComponent({ name: 'treasurer' });
    const rendered = getContent(el);
    expect(rendered).toContain('Treasurer');
    expect(rendered).toContain('bg-amber-100');
  });

  it('renders member role with correct label and color', async () => {
    const el = await renderComponent({ name: 'member' });
    const rendered = getContent(el);
    expect(rendered).toContain('Member');
    expect(rendered).toContain('bg-gray-100');
  });

  it('renders nothing for unknown role', async () => {
    const el = await renderComponent({ name: 'unknown' });
    expect(el.querySelector('span')).toBeNull();
  });

  it('renders nothing for empty name', async () => {
    const el = await renderComponent({ name: '' });
    expect(el.querySelector('span')).toBeNull();
  });

  it('uses custom label when provided', async () => {
    const el = await renderComponent({ name: 'admin', label: 'Super Admin' });
    const rendered = getContent(el);
    expect(rendered).toContain('Super Admin');
  });

  it('custom label still uses role color', async () => {
    const el = await renderComponent({ name: 'editor', label: 'Custom Editor' });
    const rendered = getContent(el);
    expect(rendered).toContain('Custom Editor');
    expect(rendered).toContain('bg-blue-100');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ name: 'admin' });
    expect(el.shadowRoot).toBeNull();
  });
});
