import { describe, expect, it } from 'vitest';
import '../../src/components/sidebar.js';
import type { NavItem, Sidebar } from '../../src/components/sidebar.js';
import type { Locale } from '../../src/i18n/context.js';
import type { Clan, Person } from '../../src/types/index.js';
import { mountWithLocale } from '../utils/i18n.js';

function makeClans(): Clan[] {
  return [
    {
      id: 'c1',
      name: 'Họ Nguyễn',
      lineage: 'father',
      origin: 'Bắc Ninh',
      history: '',
      notableFigures: [],
      images: [],
    },
    {
      id: 'c2',
      name: 'Họ Trần',
      lineage: 'mother',
      origin: 'Huế',
      history: '',
      notableFigures: [],
      images: [],
    },
  ];
}

function makePerson(overrides?: { role?: string; gender?: 'M' | 'F' }): Person {
  return {
    id: 'p1',
    data: {
      firstName: 'Văn',
      lastName: 'Nguyễn',
      gender: overrides?.gender ?? 'M',
      generation: 1,
      role: overrides?.role,
    },
    rels: { parents: [], spouses: [], children: [] },
  };
}

function makeNavItems(
  role: 'admin' | 'editor' | 'member' = 'admin',
): NavItem[] {
  const items: NavItem[] = [
    { id: 'tree', icon: '🌳', labelKey: 'app.sidebar.tree' },
    { id: 'members', icon: '👥', labelKey: 'app.sidebar.members' },
    { id: 'clan-info', icon: '🏛️', labelKey: 'app.sidebar.clanInfo' },
    { id: 'events', icon: '📅', labelKey: 'app.sidebar.events' },
    { id: 'calendar', icon: '🗓️', labelKey: 'app.sidebar.calendar' },
    { id: 'funds', icon: '💰', labelKey: 'app.sidebar.funds' },
  ];
  if (role === 'admin')
    items.push({ id: 'admin', icon: '⚙️', labelKey: 'app.sidebar.admin' });
  if (role === 'editor' || role === 'admin')
    items.push({ id: 'invite', icon: '📨', labelKey: 'app.sidebar.invite' });
  items.push({
    id: 'notifications',
    icon: '🔔',
    labelKey: 'app.sidebar.notifications',
    unreadBadge: true,
  });
  items.push({ id: 'profile', icon: '👤', labelKey: 'app.sidebar.profile' });
  items.push({
    id: 'public-page',
    icon: '🌐',
    labelKey: 'app.sidebar.publicPage',
  });
  return items;
}

function makeMobileNavItems(items: NavItem[]): NavItem[] {
  const notifications = items.find((i) => i.id === 'notifications');
  return notifications
    ? [...items.slice(0, 5), notifications]
    : items.slice(0, 5);
}

async function renderSidebar(
  opts: {
    clans?: Clan[];
    navItems?: NavItem[];
    mobileNavItems?: NavItem[];
    currentClanId?: string;
    currentPage?: string;
    sidebarOpen?: boolean;
    unreadCount?: number;
    language?: Locale;
    currentPerson?: Person;
    roleLabel?: string;
  } = {},
): Promise<Sidebar> {
  const el = document.createElement('app-sidebar');
  if (opts.clans !== undefined) el.clans = opts.clans;
  el.navItems = opts.navItems ?? makeNavItems();
  el.mobileNavItems = opts.mobileNavItems ?? makeMobileNavItems(el.navItems);
  if (opts.currentClanId !== undefined) el.currentClanId = opts.currentClanId;
  if (opts.currentPage !== undefined) el.currentPage = opts.currentPage;
  if (opts.sidebarOpen !== undefined) el.sidebarOpen = opts.sidebarOpen;
  if (opts.unreadCount !== undefined) el.unreadCount = opts.unreadCount;
  if (opts.currentPerson !== undefined) el.currentPerson = opts.currentPerson;
  if (opts.roleLabel !== undefined) el.roleLabel = opts.roleLabel;
  mountWithLocale(el, opts.language);
  await el.updateComplete;
  await el.updateComplete;
  return el;
}

function awaitEvent(el: Sidebar, name: string): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener(name, (e) => resolve(e as CustomEvent), { once: true });
  });
}

describe('Sidebar', () => {
  it('renders without shadow DOM', async () => {
    const el = await renderSidebar();
    expect(el.shadowRoot).toBeNull();
  });

  it('renders desktop panel, mobile shell, and drawer', async () => {
    const el = await renderSidebar();
    expect(el.querySelector('.sidebar-panel')).not.toBeNull();
    expect(el.querySelector('.sidebar-mobile')).not.toBeNull();
    expect(el.querySelector('.drawer-overlay')).not.toBeNull();
    expect(el.querySelector('.drawer-panel')).not.toBeNull();
  });

  it('renders a nav button for each base page', async () => {
    const el = await renderSidebar();
    const nav = el.querySelector('.sidebar-panel nav')!;
    for (const page of [
      'tree',
      'members',
      'clan-info',
      'events',
      'calendar',
      'funds',
    ]) {
      expect(nav.querySelector(`[data-page="${page}"]`), page).not.toBeNull();
    }
  });

  it('renders secondary nav buttons for notifications, profile, public page', async () => {
    const el = await renderSidebar();
    const nav = el.querySelector('.sidebar-panel nav')!;
    expect(nav.querySelector('[data-page="notifications"]')).not.toBeNull();
    expect(nav.querySelector('[data-page="profile"]')).not.toBeNull();
    expect(nav.querySelector('[data-page="public-page"]')).not.toBeNull();
  });

  it('renders exactly the nav items it is given', async () => {
    const el = await renderSidebar({
      navItems: [
        { id: 'tree', icon: '🌳', labelKey: 'app.sidebar.tree' },
        { id: 'funds', icon: '💰', labelKey: 'app.sidebar.funds' },
      ],
    });
    const nav = el.querySelector('.sidebar-panel nav')!;
    const pages = [...nav.querySelectorAll('[data-page]')].map((b) =>
      b.getAttribute('data-page'),
    );
    expect(pages).toEqual(['tree', 'funds']);
  });

  it('renders a clan button for each clan when expanded', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const buttons = el.querySelectorAll('.sidebar-panel .clan-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('data-clan')).toBe('c1');
    expect(buttons[1].getAttribute('data-clan')).toBe('c2');
  });

  it('highlights the active clan', async () => {
    const el = await renderSidebar({
      clans: makeClans(),
      currentClanId: 'c2',
    });
    const buttons = el.querySelectorAll('.sidebar-panel .clan-btn');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('data-clan')).toBe('c2');
    expect(buttons[0].className).toContain('bg-emerald-50');
  });

  it('uses lineage-specific dot colors', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const buttons = el.querySelectorAll('.sidebar-panel .clan-btn');
    const dot0 = buttons[0].querySelector('span')!;
    const dot1 = buttons[1].querySelector('span')!;
    expect(dot0.className).toContain('bg-blue-500');
    expect(dot1.className).toContain('bg-pink-500');
  });

  it('uses purple dot for unknown lineage', async () => {
    const el = await renderSidebar({
      clans: [
        {
          id: 'c3',
          name: 'Họ Lê',
          origin: 'Hà Nội',
          history: '',
          notableFigures: [],
          images: [],
        },
      ],
    });
    const dot = el.querySelector('.sidebar-panel .clan-btn span')!;
    expect(dot.className).toContain('bg-purple-500');
  });

  it('renders Vietnamese labels by default', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    expect(el.innerHTML).toContain('Cây Phổ Hệ');
    expect(el.innerHTML).toContain('Dòng Họ');
    expect(el.innerHTML).toContain('Theo cha');
    expect(el.innerHTML).toContain('Theo mẹ');
  });

  it('renders English labels when language is en', async () => {
    const el = await renderSidebar({ clans: makeClans(), language: 'en' });
    expect(el.innerHTML).toContain('Family Tree');
    expect(el.innerHTML).toContain('Clans');
    expect(el.innerHTML).toContain("Father's Line");
    expect(el.innerHTML).not.toContain('Cây Phổ Hệ');
  });

  it('shows the desktop panel when expanded', async () => {
    const el = await renderSidebar({ sidebarOpen: true });
    expect(el.querySelector('.sidebar-panel')!.className).toContain('w-80');
  });

  it('hides the desktop panel when collapsed', async () => {
    const el = await renderSidebar({ sidebarOpen: false });
    expect(el.querySelector('.sidebar-panel')!.className).toContain('w-0');
  });

  it('shows unread count badge on notifications', async () => {
    const el = await renderSidebar({ unreadCount: 3 });
    const notifications = el.querySelector(
      '.sidebar-panel [data-page="notifications"]',
    )!;
    expect(notifications.textContent).toContain('3');
  });

  it('shows no unread badge when unreadCount is zero', async () => {
    const el = await renderSidebar({ unreadCount: 0 });
    const notifications = el.querySelector(
      '.sidebar-panel [data-page="notifications"]',
    )!;
    expect(notifications.querySelector('.bg-red-500')).toBeNull();
  });

  it('marks active nav item', async () => {
    const el = await renderSidebar({ currentPage: 'events' });
    const active = el.querySelector('.sidebar-panel [data-page="events"]');
    const idle = el.querySelector('.sidebar-panel [data-page="tree"]');
    expect(active!.className).toContain('bg-emerald-50');
    expect(idle!.className).not.toContain('bg-emerald-50');
  });

  it('shows only the current clan when more than one clan', async () => {
    const el = await renderSidebar({ clans: makeClans(), currentClanId: 'c2' });
    const buttons = el.querySelectorAll('.sidebar-panel .clan-btn');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('data-clan')).toBe('c2');
    expect(el.querySelector('.sidebar-panel .clan-chevron')).not.toBeNull();
  });
  it('shows the first clan when collapsed and no active clan', async () => {
    const el = await renderSidebar({
      clans: [...makeClans(), { ...makeClans()[0], id: 'c3', name: 'Họ Lê' }],
    });
    const buttons = el.querySelectorAll('.sidebar-panel .clan-btn');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('data-clan')).toBe('c1');
  });
  it('shows all clans without collapse when there is a single clan', async () => {
    const el = await renderSidebar({ clans: [makeClans()[0]] });
    const btn = el.querySelector(
      '.sidebar-panel .clan-btn',
    ) as HTMLButtonElement;
    expect(el.querySelectorAll('.sidebar-panel .clan-btn').length).toBe(1);
    expect(el.querySelector('.sidebar-panel .clan-chevron')).toBeNull();
    const eventPromise = awaitEvent(el, 'clan-select');
    btn.click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ id: 'c1' });
  });
  it('expands the clan list when the collapsed current clan is clicked', async () => {
    const el = await renderSidebar({
      clans: [...makeClans(), { ...makeClans()[0], id: 'c3', name: 'Họ Lê' }],
      currentClanId: 'c2',
    });
    let dispatched = false;
    el.addEventListener('clan-select', () => {
      dispatched = true;
    });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c2"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    expect(dispatched).toBe(false);
    expect(el.querySelectorAll('.sidebar-panel .clan-btn').length).toBe(3);
    expect(
      el.querySelector('.sidebar-panel .clan-btn')!.closest('div')!.className,
    ).toContain('max-h-56');
  });
  it('collapses the clan list when the current clan is clicked while expanded', async () => {
    const el = await renderSidebar({ clans: makeClans(), currentClanId: 'c1' });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    expect(el.querySelectorAll('.sidebar-panel .clan-btn').length).toBe(2);
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    expect(el.querySelectorAll('.sidebar-panel .clan-btn').length).toBe(1);
  });
  it('collapses the clan list after selecting a clan', async () => {
    const el = await renderSidebar({
      clans: [...makeClans(), { ...makeClans()[0], id: 'c3', name: 'Họ Lê' }],
      currentClanId: 'c2',
    });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c2"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const eventPromise = awaitEvent(el, 'clan-select');
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c3"]',
      ) as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ id: 'c3' });
    expect(el.querySelectorAll('.sidebar-panel .clan-btn').length).toBe(1);
  });

  it('dispatches clan-select with clan id on clan button click', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const eventPromise = awaitEvent(el, 'clan-select');
    (
      el.querySelector(
        '.sidebar-panel .clan-btn[data-clan="c2"]',
      ) as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ id: 'c2' });
  });

  it('dispatches page-select with page id on nav click', async () => {
    const el = await renderSidebar();
    const eventPromise = awaitEvent(el, 'page-select');
    (
      el.querySelector(
        '.sidebar-panel [data-page="calendar"]',
      ) as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ page: 'calendar' });
  });

  it('dispatches toggle-language from desktop, mobile, and drawer buttons', async () => {
    const el = await renderSidebar();
    const eventPromise = awaitEvent(el, 'toggle-language');
    (
      el.querySelector('.sidebar-mobile .lang-btn') as HTMLButtonElement
    ).click();
    await eventPromise;
    const second = awaitEvent(el, 'toggle-language');
    (
      el.querySelector('.drawer-panel .lang-btn-full') as HTMLButtonElement
    ).click();
    await second;
  });

  it('shows language switch labels based on current language', async () => {
    const vi = await renderSidebar({ language: 'vi' });
    expect(vi.innerHTML).toContain('Switch to English');
    vi.remove();
    const en = await renderSidebar({ language: 'en' });
    expect(en.innerHTML).toContain('Chuyển sang Tiếng Việt');
  });

  it('shows mobile bottom nav from mobileNavItems', async () => {
    const el = await renderSidebar({
      navItems: makeNavItems('admin'),
      mobileNavItems: makeMobileNavItems(makeNavItems('admin')),
    });
    const bottomNav = el.querySelector('.sidebar-mobile nav') as HTMLElement;
    const buttons = [...bottomNav.querySelectorAll('.nav-btn')];
    expect(buttons.map((b) => b.getAttribute('data-page'))).toEqual([
      'tree',
      'members',
      'clan-info',
      'events',
      'calendar',
      'notifications',
    ]);
  });

  it('shows mobile unread dot on notifications icon', async () => {
    const el = await renderSidebar({ unreadCount: 2 });
    const mobileNotifications = el.querySelector(
      '.sidebar-mobile [data-page="notifications"]',
    )!;
    expect(mobileNotifications.querySelector('.bg-red-500')).not.toBeNull();
  });

  it('shows current clan name in mobile header', async () => {
    const el = await renderSidebar({
      clans: makeClans(),
      currentClanId: 'c2',
    });
    expect(el.querySelector('.sidebar-mobile header')!.textContent).toContain(
      'Họ Trần',
    );
  });

  it('renders drawer closed when sidebar is collapsed', async () => {
    const el = await renderSidebar({ sidebarOpen: false });
    const overlay = el.querySelector('.drawer-overlay')!;
    const panel = el.querySelector('.drawer-panel')!;
    expect(overlay.className).toContain('opacity-0');
    expect(panel.className).toContain('-translate-x-full');
  });

  it('opens drawer when sidebar is expanded', async () => {
    const el = await renderSidebar({ sidebarOpen: true });
    const overlay = el.querySelector('.drawer-overlay')!;
    const panel = el.querySelector('.drawer-panel')!;
    expect(overlay.className).toContain('opacity-100');
    expect(panel.className).toContain('translate-x-0');
  });

  it('closes drawer when sidebarOpen changes to false', async () => {
    const el = await renderSidebar({ sidebarOpen: true });
    el.sidebarOpen = false;
    await el.updateComplete;
    await el.updateComplete;
    expect(el.querySelector('.drawer-overlay')!.className).toContain(
      'opacity-0',
    );
    expect(el.querySelector('.drawer-panel')!.className).toContain(
      '-translate-x-full',
    );
  });

  it('opens drawer on menu button click', async () => {
    const el = await renderSidebar({ sidebarOpen: false });
    (
      el.querySelector('.sidebar-mobile .menu-btn') as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const overlay = el.querySelector('.drawer-overlay')!;
    const panel = el.querySelector('.drawer-panel')!;
    expect(overlay.className).toContain('opacity-100');
    expect(panel.className).toContain('translate-x-0');
  });

  it('closes drawer when overlay background is clicked', async () => {
    const el = await renderSidebar({ sidebarOpen: false });
    (
      el.querySelector('.sidebar-mobile .menu-btn') as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const overlay = el.querySelector('.drawer-overlay') as HTMLElement;
    overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.querySelector('.drawer-overlay')!.className).toContain(
      'opacity-0',
    );
  });

  it('does not close drawer when clicking inside the panel', async () => {
    const el = await renderSidebar({ sidebarOpen: false });
    (
      el.querySelector('.sidebar-mobile .menu-btn') as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const panel = el.querySelector('.drawer-panel') as HTMLElement;
    panel.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(el.querySelector('.drawer-overlay')!.className).toContain(
      'opacity-100',
    );
  });

  it('dispatches page-select and closes drawer on drawer nav click', async () => {
    const el = await renderSidebar({ sidebarOpen: false });
    (
      el.querySelector('.sidebar-mobile .menu-btn') as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const eventPromise = awaitEvent(el, 'page-select');
    (
      el.querySelector('.drawer-panel [data-page="funds"]') as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ page: 'funds' });
    expect(el.querySelector('.drawer-panel')!.className).toContain(
      '-translate-x-full',
    );
  });

  it('closes drawer on drawer clan click', async () => {
    const el = await renderSidebar({
      clans: makeClans(),
      sidebarOpen: false,
    });
    (
      el.querySelector('.sidebar-mobile .menu-btn') as HTMLButtonElement
    ).click();
    await el.updateComplete;
    (
      el.querySelector(
        '.drawer-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const eventPromise = awaitEvent(el, 'clan-select');
    (
      el.querySelector(
        '.drawer-panel .clan-btn[data-clan="c2"]',
      ) as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ id: 'c2' });
    expect(el.querySelector('.drawer-panel')!.className).toContain(
      '-translate-x-full',
    );
  });

  it('shows current person name and role in drawer header', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ role: 'admin' }),
      roleLabel: 'Admin',
    });
    const panel = el.querySelector('.drawer-panel')!;
    expect(panel.textContent).toContain('Văn Nguyễn');
    expect(panel.textContent).toContain('Admin');
    expect(panel.innerHTML).toContain('♂');
  });

  it('shows female gender symbol in drawer header', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ gender: 'F' }),
    });
    expect(el.querySelector('.drawer-panel')!.innerHTML).toContain('♀');
  });

  it('omits drawer person header without a current person', async () => {
    const el = await renderSidebar();
    const panel = el.querySelector('.drawer-panel')!;
    expect(panel.innerHTML).not.toContain('bg-gradient-to-br');
  });

  it('re-renders when currentPage changes', async () => {
    const el = await renderSidebar({ currentPage: 'tree' });
    el.currentPage = 'funds';
    await el.updateComplete;
    const funds = el.querySelector('.sidebar-panel [data-page="funds"]');
    expect(funds!.className).toContain('bg-emerald-50');
  });
});
