import { describe, expect, it } from 'vitest';
import '../../src/components/sidebar.js';
import type { Sidebar } from '../../src/components/sidebar.js';
import type { Clan, Person } from '../../src/types/index.js';

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

async function renderSidebar(
  opts: {
    clans?: Clan[];
    currentClanId?: string;
    currentPage?: string;
    sidebarOpen?: boolean;
    unreadCount?: number;
    darkMode?: boolean;
    language?: 'vi' | 'en';
    currentPerson?: Person;
  } = {},
): Promise<Sidebar> {
  const el = document.createElement('app-sidebar');
  if (opts.clans !== undefined) el.clans = opts.clans;
  if (opts.currentClanId !== undefined) el.currentClanId = opts.currentClanId;
  if (opts.currentPage !== undefined) el.currentPage = opts.currentPage;
  if (opts.sidebarOpen !== undefined) el.sidebarOpen = opts.sidebarOpen;
  if (opts.unreadCount !== undefined) el.unreadCount = opts.unreadCount;
  if (opts.darkMode !== undefined) el.darkMode = opts.darkMode;
  if (opts.language !== undefined) el.language = opts.language;
  if (opts.currentPerson !== undefined) el.currentPerson = opts.currentPerson;
  document.body.appendChild(el);
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

  it('renders desktop, mobile, and drawer sections', async () => {
    const el = await renderSidebar();
    expect(el.querySelector('.sidebar-desktop')).not.toBeNull();
    expect(el.querySelector('.sidebar-mobile')).not.toBeNull();
    expect(el.querySelector('.drawer-overlay')).not.toBeNull();
    expect(el.querySelector('.drawer-panel')).not.toBeNull();
  });

  it('renders a nav button for each base page', async () => {
    const el = await renderSidebar();
    const nav = el.querySelector('.sidebar-desktop nav')!;
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
    const nav = el.querySelector('.sidebar-desktop nav')!;
    expect(nav.querySelector('[data-page="notifications"]')).not.toBeNull();
    expect(nav.querySelector('[data-page="profile"]')).not.toBeNull();
    expect(nav.querySelector('[data-page="public-page"]')).not.toBeNull();
  });

  it('does not show admin or invite items for member role', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ role: 'member' }),
    });
    const nav = el.querySelector('.sidebar-desktop nav')!;
    expect(nav.querySelector('[data-page="admin"]')).toBeNull();
    expect(nav.querySelector('[data-page="invite"]')).toBeNull();
  });

  it('shows invite item for editor role but not admin item', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ role: 'editor' }),
    });
    const nav = el.querySelector('.sidebar-desktop nav')!;
    expect(nav.querySelector('[data-page="admin"]')).toBeNull();
    expect(nav.querySelector('[data-page="invite"]')).not.toBeNull();
  });

  it('shows admin and invite items for admin role', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ role: 'admin' }),
    });
    const nav = el.querySelector('.sidebar-desktop nav')!;
    expect(nav.querySelector('[data-page="admin"]')).not.toBeNull();
    expect(nav.querySelector('[data-page="invite"]')).not.toBeNull();
  });

  it('does not show admin or invite items without a current person', async () => {
    const el = await renderSidebar();
    const nav = el.querySelector('.sidebar-desktop nav')!;
    expect(nav.querySelector('[data-page="admin"]')).toBeNull();
    expect(nav.querySelector('[data-page="invite"]')).toBeNull();
  });

  it('renders a clan button for each clan', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    const buttons = el.querySelectorAll('.sidebar-desktop .clan-btn');
    expect(buttons.length).toBe(2);
    expect(buttons[0].getAttribute('data-clan')).toBe('c1');
    expect(buttons[1].getAttribute('data-clan')).toBe('c2');
  });

  it('highlights the active clan', async () => {
    const el = await renderSidebar({
      clans: makeClans(),
      currentClanId: 'c2',
    });
    const buttons = el.querySelectorAll('.sidebar-desktop .clan-btn');
    expect(buttons[0].className).not.toContain('bg-emerald-50');
    expect(buttons[1].className).toContain('bg-emerald-50');
  });

  it('uses lineage-specific dot colors', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    const buttons = el.querySelectorAll('.sidebar-desktop .clan-btn');
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
    const dot = el.querySelector('.sidebar-desktop .clan-btn span')!;
    expect(dot.className).toContain('bg-purple-500');
  });

  it('renders Vietnamese labels by default', async () => {
    const el = await renderSidebar({ clans: makeClans() });
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

  it('shows clan and nav labels when expanded', async () => {
    const el = await renderSidebar({ clans: makeClans(), sidebarOpen: true });
    const desktop = el.querySelector('.sidebar-desktop')!;
    expect(desktop.innerHTML).toContain('Họ Nguyễn');
    expect(desktop.innerHTML).toContain('Cây Phổ Hệ');
    expect(desktop.innerHTML).toContain('Gia Phả');
  });

  it('hides labels when collapsed', async () => {
    const el = await renderSidebar({
      clans: makeClans(),
      sidebarOpen: false,
    });
    const desktop = el.querySelector('.sidebar-desktop')!;
    expect(desktop.innerHTML).not.toContain('Họ Nguyễn');
    expect(desktop.innerHTML).not.toContain('Cây Phổ Hệ');
    expect(desktop.innerHTML).not.toContain('Gia Phả');
    expect(desktop.innerHTML).not.toContain('Dòng Họ');
  });

  it('shows unread count badge on notifications when expanded', async () => {
    const el = await renderSidebar({ unreadCount: 3 });
    const desktop = el.querySelector('.sidebar-desktop')!;
    expect(desktop.innerHTML).toContain('>3</span>');
  });

  it('shows dot badge on notifications when collapsed', async () => {
    const el = await renderSidebar({ unreadCount: 3, sidebarOpen: false });
    const notifications = el.querySelector(
      '.sidebar-desktop [data-page="notifications"]',
    )!;
    expect(
      notifications.querySelector('.bg-red-500.rounded-full'),
    ).not.toBeNull();
    expect(notifications.textContent).not.toContain('3');
  });

  it('shows no unread badge when unreadCount is zero', async () => {
    const el = await renderSidebar({ unreadCount: 0 });
    const desktop = el.querySelector('.sidebar-desktop')!;
    expect(desktop.querySelector('.bg-red-500')).toBeNull();
  });

  it('marks active nav item', async () => {
    const el = await renderSidebar({ currentPage: 'events' });
    const active = el.querySelector('.sidebar-desktop [data-page="events"]');
    const idle = el.querySelector('.sidebar-desktop [data-page="tree"]');
    expect(active!.className).toContain('bg-emerald-50');
    expect(idle!.className).not.toContain('bg-emerald-50');
  });

  it('dispatches clan-select with clan id on clan button click', async () => {
    const el = await renderSidebar({ clans: makeClans() });
    const eventPromise = awaitEvent(el, 'clan-select');
    (
      el.querySelector(
        '.sidebar-desktop .clan-btn[data-clan="c2"]',
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
        '.sidebar-desktop [data-page="calendar"]',
      ) as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ page: 'calendar' });
  });

  it('dispatches toggle-sidebar on sidebar toggle click', async () => {
    const el = await renderSidebar();
    const eventPromise = awaitEvent(el, 'toggle-sidebar');
    (
      el.querySelector('.sidebar-desktop .sidebar-toggle') as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.bubbles).toBe(true);
    expect(event.composed).toBe(true);
  });

  it('dispatches toggle-dark-mode on dark mode button click', async () => {
    const el = await renderSidebar();
    const eventPromise = awaitEvent(el, 'toggle-dark-mode');
    (
      el.querySelector('.sidebar-desktop .dark-mode-btn') as HTMLButtonElement
    ).click();
    await eventPromise;
  });

  it('shows sun icon and Light Mode label when dark mode is on', async () => {
    const el = await renderSidebar({ darkMode: true });
    const desktop = el.querySelector('.sidebar-desktop')!;
    expect(desktop.innerHTML).toContain('☀️');
    expect(desktop.innerHTML).toContain('Light Mode');
  });

  it('shows moon icon and Dark Mode label when dark mode is off', async () => {
    const el = await renderSidebar({ darkMode: false });
    const desktop = el.querySelector('.sidebar-desktop')!;
    expect(desktop.innerHTML).toContain('🌙');
    expect(desktop.innerHTML).toContain('Dark Mode');
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
    expect(vi.innerHTML).toContain('English');
    vi.remove();
    const en = await renderSidebar({ language: 'en' });
    expect(en.innerHTML).toContain('Tiếng Việt');
    expect(en.innerHTML).toContain('Chuyển sang Tiếng Việt');
  });

  it('shows mobile bottom nav with first five pages plus notifications', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ role: 'admin' }),
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

  it('renders drawer closed by default', async () => {
    const el = await renderSidebar();
    const overlay = el.querySelector('.drawer-overlay')!;
    const panel = el.querySelector('.drawer-panel')!;
    expect(overlay.className).toContain('opacity-0');
    expect(panel.className).toContain('-translate-x-full');
  });

  it('opens drawer on menu button click', async () => {
    const el = await renderSidebar();
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
    const el = await renderSidebar();
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
    const el = await renderSidebar();
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
    const el = await renderSidebar();
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
    const el = await renderSidebar({ clans: makeClans() });
    (
      el.querySelector('.sidebar-mobile .menu-btn') as HTMLButtonElement
    ).click();
    await el.updateComplete;
    const eventPromise = awaitEvent(el, 'clan-select');
    (
      el.querySelector(
        '.drawer-panel .clan-btn[data-clan="c1"]',
      ) as HTMLButtonElement
    ).click();
    const event = await eventPromise;
    expect(event.detail).toEqual({ id: 'c1' });
    expect(el.querySelector('.drawer-panel')!.className).toContain(
      '-translate-x-full',
    );
  });

  it('shows current person name and role in drawer header', async () => {
    const el = await renderSidebar({
      currentPerson: makePerson({ role: 'admin' }),
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

  it('shows unread count badge in drawer notifications item', async () => {
    const el = await renderSidebar({ unreadCount: 5 });
    const notifications = el.querySelector(
      '.drawer-panel [data-page="notifications"]',
    )!;
    expect(notifications.textContent).toContain('5');
  });

  it('re-renders when currentPage changes', async () => {
    const el = await renderSidebar({ currentPage: 'tree' });
    el.currentPage = 'funds';
    await el.updateComplete;
    const funds = el.querySelector('.sidebar-desktop [data-page="funds"]');
    expect(funds!.className).toContain('bg-emerald-50');
  });
});
