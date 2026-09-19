import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/layouts/app-page-layout.js';
import type { PageVariant } from '../../src/layouts/app-page-layout.js';

async function renderLayout(opts?: {
  title?: string;
  variant?: PageVariant;
  withActions?: boolean;
}) {
  const el = document.createElement('app-page-layout');
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.variant !== undefined) el.variant = opts.variant;
  if (opts?.withActions) {
    el.actions = html`<button class="act">Add</button>`;
  }
  el.sidebar = html`<div class="sb">side</div>`;
  el.content = html`<p class="demo">content</p>`;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.querySelectorAll('app-page-layout').forEach((el) => {
    el.remove();
  });
});

describe('AppPageLayout', () => {
  it('renders without shadow DOM', async () => {
    const el = await renderLayout();
    expect(el.shadowRoot).toBeNull();
  });

  it('renders the title in the header', async () => {
    const el = await renderLayout({ title: 'Thành Viên' });
    const h2 = el.querySelector('header h2');
    expect(h2?.textContent?.trim()).toBe('Thành Viên');
  });

  it('omits the header when no title and no actions', async () => {
    const el = await renderLayout();
    expect(el.querySelector('header')).toBeNull();
  });

  it('renders the header when only actions are provided', async () => {
    const el = await renderLayout({ withActions: true });
    expect(el.querySelector('header')).not.toBeNull();
    expect(el.querySelector('header .act')).not.toBeNull();
  });

  it('renders the content template', async () => {
    const el = await renderLayout({ title: 'Danh Sách' });
    expect(el.querySelector('.page-content .demo')?.textContent).toBe(
      'content',
    );
  });

  it('always renders the sidebar region', async () => {
    const el = await renderLayout({ title: 'Quỹ' });
    const slot = el.querySelector('.layout-sidebar')!;
    expect(slot.querySelector('.sb')?.textContent).toBe('side');
    expect(slot.className).toContain('flex-shrink-0');
  });

  it('defaults to a full-width scrollable page', async () => {
    const el = await renderLayout({ title: 'Quỹ' });
    const root = el.querySelector(':scope > div')!;
    const page = el.querySelector('.page')!;
    expect(root.className).toContain('h-full');
    expect(root.className).toContain('overflow-hidden');
    expect(page.className).toContain('flex-col');
    expect(page.className).toContain('h-full');
    expect(page.className).toContain('w-full');
    expect(page.className).not.toContain('mx-auto');
    expect(page.className).not.toContain('max-w-4xl');
    expect(el.querySelector('.page-content')).not.toBeNull();
    expect(el.querySelector('.tree-viewport')).toBeNull();
  });

  it('paints the full-width background on the main region, not the page', async () => {
    const el = await renderLayout({ title: 'Quỹ' });
    const main = el.querySelector('.layout-main')!;
    expect(main.className).toContain('bg-white');
    expect(main.className).toContain('dark:bg-gray-900');
    expect(main.className).not.toContain('bg-gray-50');
    expect(el.querySelector('.page')!.className).not.toContain('bg-white');
  });

  it('constrains and centers the page when variant=centered', async () => {
    const el = await renderLayout({ title: 'Hồ Sơ', variant: 'centered' });
    const page = el.querySelector('.page')!;
    expect(page.className).toContain('max-w-4xl');
    expect(page.className).toContain('mx-auto');
    expect(page.className).toContain('w-full');
    expect(el.querySelector('.page-content')).not.toBeNull();
  });

  it('uses a light-gray background when variant=centered', async () => {
    const el = await renderLayout({ title: 'Hồ Sơ', variant: 'centered' });
    const main = el.querySelector('.layout-main')!;
    expect(main.className).toContain('bg-gray-50');
    expect(main.className).not.toContain('bg-white');
  });

  it('renders a full-bleed viewport when variant=canvas', async () => {
    const el = await renderLayout({ title: 'Tree', variant: 'canvas' });
    const viewport = el.querySelector('.tree-viewport')!;
    expect(viewport.className).toContain('flex-1');
    expect(viewport.className).toContain('overflow-hidden');
    expect(viewport.className).not.toContain('p-4');
    expect(viewport.querySelector('.demo')?.textContent).toBe('content');
    expect(el.querySelector('.page-content')).toBeNull();
    const main = el.querySelector('.layout-main')!;
    expect(main.className).toContain('bg-gray-50');
  });
});
