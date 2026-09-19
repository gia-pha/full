import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/layouts/app-auth-layout.js';

async function renderLayout(opts?: {
  title?: string;
  description?: string;
  logo?: string;
  footer?: string;
}) {
  const el = document.createElement('app-auth-layout');
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.description !== undefined) el.description = opts.description;
  if (opts?.logo !== undefined) el.logo = opts.logo;
  if (opts?.footer !== undefined) el.footer = opts.footer;
  el.content = html`<p class="card-body">form</p>`;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.querySelectorAll('app-auth-layout').forEach((el) => {
    el.remove();
  });
});

describe('AppAuthLayout', () => {
  it('renders without shadow DOM', async () => {
    const el = await renderLayout();
    expect(el.shadowRoot).toBeNull();
  });

  it('renders title and description', async () => {
    const el = await renderLayout({
      title: 'Gia Phả',
      description: 'Kết nối gia đình',
    });
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Gia Phả');
    expect(el.querySelector('.max-w-md p')?.textContent?.trim()).toBe(
      'Kết nối gia đình',
    );
  });

  it('shows the GP logo mark by default', async () => {
    const el = await renderLayout();
    const logo = el.querySelector('.bg-emerald-600')!;
    expect(logo.textContent?.trim()).toBe('GP');
  });

  it('hides the logo when logo is empty', async () => {
    const el = await renderLayout({ logo: '' });
    expect(el.querySelector('.bg-emerald-600')).toBeNull();
  });

  it('renders a centered card with the content template', async () => {
    const el = await renderLayout({ title: 'Gia Phả' });
    expect(el.querySelector('.max-w-md')).not.toBeNull();
    const card = el.querySelector('.shadow-xl')!;
    expect(card.className).toContain('rounded-2xl');
    expect(card.querySelector('.card-body')?.textContent).toBe('form');
  });

  it('renders optional footer text', async () => {
    const el = await renderLayout({ footer: 'Gia Phả © 2025' });
    const footer = el.querySelector('.max-w-md > p.text-gray-400');
    expect(footer?.textContent?.trim()).toBe('Gia Phả © 2025');
  });
});
