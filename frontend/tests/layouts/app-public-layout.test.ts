import { html } from 'lit';
import { afterEach, describe, expect, it } from 'vitest';
import '../../src/layouts/app-public-layout.js';

async function renderLayout(opts?: {
  footerText?: string;
  noHero?: boolean;
  withHero?: boolean;
}) {
  const el = document.createElement('app-public-layout');
  if (opts?.footerText !== undefined) el.footerText = opts.footerText;
  if (opts?.noHero !== undefined) el.noHero = opts.noHero;
  if (opts?.withHero) el.hero = html`<h1 class="hero-title">Họ Nguyễn</h1>`;
  el.content = html`<section class="sec">content</section>`;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

afterEach(() => {
  document.querySelectorAll('app-public-layout').forEach((el) => {
    el.remove();
  });
});

describe('AppPublicLayout', () => {
  it('renders without shadow DOM', async () => {
    const el = await renderLayout();
    expect(el.shadowRoot).toBeNull();
  });

  it('renders the gradient hero when provided', async () => {
    const el = await renderLayout({ withHero: true });
    const hero = el.querySelector('.hero-title')!;
    expect(hero.textContent).toBe('Họ Nguyễn');
    const heroWrap = hero.closest('.from-emerald-600');
    expect(heroWrap).not.toBeNull();
  });

  it('omits the hero when none is provided', async () => {
    const el = await renderLayout();
    expect(el.querySelector('.from-emerald-600')).toBeNull();
  });

  it('hides the hero when noHero is set', async () => {
    const el = await renderLayout({ withHero: true, noHero: true });
    expect(el.querySelector('.from-emerald-600')).toBeNull();
  });

  it('renders a centered main area with the content template', async () => {
    const el = await renderLayout();
    const main = el.querySelector('main')!;
    expect(main.className).toContain('max-w-4xl');
    expect(main.querySelector('.sec')?.textContent).toBe('content');
  });

  it('renders a footer with text', async () => {
    const el = await renderLayout({ footerText: 'Họ Nguyễn © 2026' });
    const footer = el.querySelector('footer')!;
    expect(footer.textContent).toContain('Họ Nguyễn © 2026');
  });
});
