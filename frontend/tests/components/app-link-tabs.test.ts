import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/app-link-tabs.js';
import type {
  AppLinkTabs,
  LinkTab,
} from '../../src/components/app-link-tabs.js';
import type { Locale } from '../../src/i18n/context.js';
import { mountWithLocale } from '../utils/i18n.js';

const defaultTabs: LinkTab[] = [
  { href: '/login', label: 'auth.login' },
  { href: '/register', label: 'auth.register' },
];

async function renderComponent(opts?: {
  tabs?: LinkTab[];
  active?: string;
  locale?: Locale;
}): Promise<AppLinkTabs> {
  const el = document.createElement('app-link-tabs');
  if (opts?.tabs !== undefined) el.tabs = opts.tabs;
  if (opts?.active !== undefined) el.active = opts.active;
  mountWithLocale(el, opts?.locale);
  await el.updateComplete;
  return el;
}

function getLinks(el: AppLinkTabs): HTMLAnchorElement[] {
  return Array.from(el.querySelectorAll<HTMLAnchorElement>('a'));
}

afterEach(() => {
  document.querySelectorAll('app-link-tabs').forEach((el) => {
    el.remove();
  });
  document.querySelectorAll('i18n-provider').forEach((el) => {
    el.remove();
  });
});

describe('AppLinkTabs', () => {
  describe('basic rendering', () => {
    it('renders one link per tab with the correct href', async () => {
      const el = await renderComponent({ tabs: defaultTabs, active: '/login' });
      const links = getLinks(el);
      expect(links).toHaveLength(2);
      expect(links[0].getAttribute('href')).toBe('/login');
      expect(links[1].getAttribute('href')).toBe('/register');
    });

    it('renders nothing when tabs is empty', async () => {
      const el = await renderComponent({ tabs: [] });
      expect(getLinks(el)).toHaveLength(0);
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ tabs: defaultTabs });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('active styling', () => {
    it('marks the matching tab as active', async () => {
      const el = await renderComponent({ tabs: defaultTabs, active: '/login' });
      const links = getLinks(el);
      expect(links[0].className).toContain('bg-emerald-600');
      expect(links[1].className).not.toContain('bg-emerald-600');
    });

    it('marks the second tab when it matches active', async () => {
      const el = await renderComponent({
        tabs: defaultTabs,
        active: '/register',
      });
      const links = getLinks(el);
      expect(links[1].className).toContain('bg-emerald-600');
      expect(links[0].className).not.toContain('bg-emerald-600');
    });

    it('marks no tab active when active matches no href', async () => {
      const el = await renderComponent({ tabs: defaultTabs, active: '/nope' });
      for (const link of getLinks(el)) {
        expect(link.className).not.toContain('bg-emerald-600');
      }
    });

    it('updates active styling when active changes', async () => {
      const el = await renderComponent({ tabs: defaultTabs, active: '/login' });
      expect(getLinks(el)[0].className).toContain('bg-emerald-600');
      el.active = '/register';
      await el.updateComplete;
      const links = getLinks(el);
      expect(links[0].className).not.toContain('bg-emerald-600');
      expect(links[1].className).toContain('bg-emerald-600');
    });
  });

  describe('labels', () => {
    it('translates label keys using the default (vi) locale', async () => {
      const el = await renderComponent({ tabs: defaultTabs });
      const links = getLinks(el);
      expect(links[0].textContent!.trim()).toBe('Đăng nhập');
      expect(links[1].textContent!.trim()).toBe('Đăng ký');
    });

    it('translates label keys when locale is en', async () => {
      const el = await renderComponent({ tabs: defaultTabs, locale: 'en' });
      const links = getLinks(el);
      expect(links[0].textContent!.trim()).toBe('Login');
      expect(links[1].textContent!.trim()).toBe('Register');
    });

    it('renders plain labels that are not translation keys', async () => {
      const el = await renderComponent({
        tabs: [{ href: '/help', label: 'Need help?' }],
      });
      expect(getLinks(el)[0].textContent!.trim()).toBe('Need help?');
    });
  });
});
