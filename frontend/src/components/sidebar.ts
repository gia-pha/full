import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { defaultRoles } from '../consts/index.js';
import { t } from '../i18n.js';
import type { Clan, Person } from '../types/index.js';
import { getFullName, getGenderSymbol } from '../utils/format.js';

export type SidebarLanguage = 'vi' | 'en';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

@customElement('app-sidebar')
export class Sidebar extends LitElement {
  @property({ type: Array }) clans: Clan[] = [];
  @property({ type: String }) currentClanId = '';
  @property({ type: String }) currentPage = '';
  @property({ type: Boolean }) sidebarOpen = true;
  @property({ type: Number }) unreadCount = 0;
  @property({ type: Boolean }) darkMode = false;
  @property({ type: String }) language: SidebarLanguage = 'vi';
  @property({ type: Object }) currentPerson?: Person;

  @state() private drawerOpen = false;

  override createRenderRoot() {
    return this;
  }

  private getNavItems(): NavItem[] {
    const role = this.currentPerson?.data.role;
    const items: NavItem[] = [
      { id: 'tree', icon: '🌳', label: t(this.language, 'app.sidebar.tree') },
      {
        id: 'members',
        icon: '👥',
        label: t(this.language, 'app.sidebar.members'),
      },
      {
        id: 'clan-info',
        icon: '🏛️',
        label: t(this.language, 'app.sidebar.clanInfo'),
      },
      {
        id: 'events',
        icon: '📅',
        label: t(this.language, 'app.sidebar.events'),
      },
      {
        id: 'calendar',
        icon: '🗓️',
        label: t(this.language, 'app.sidebar.calendar'),
      },
      { id: 'funds', icon: '💰', label: t(this.language, 'app.sidebar.funds') },
    ];
    if (role === 'admin')
      items.push({
        id: 'admin',
        icon: '⚙️',
        label: t(this.language, 'app.sidebar.admin'),
      });
    if (role === 'editor' || role === 'admin')
      items.push({
        id: 'invite',
        icon: '📨',
        label: t(this.language, 'app.sidebar.invite'),
      });
    return items;
  }

  private clanDotClass(clan: Clan): string {
    if (clan.lineage === 'father') return 'bg-blue-500';
    if (clan.lineage === 'mother') return 'bg-pink-500';
    return 'bg-purple-500';
  }

  private handleClanClick = (id: string) => {
    this.dispatchEvent(
      new CustomEvent('clan-select', {
        bubbles: true,
        composed: true,
        detail: { id },
      }),
    );
    this.drawerOpen = false;
  };

  private handlePageClick = (page: string) => {
    this.dispatchEvent(
      new CustomEvent('page-select', {
        bubbles: true,
        composed: true,
        detail: { page },
      }),
    );
    this.drawerOpen = false;
  };

  private dispatchToggle = (name: string) => {
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  };

  private openDrawer = () => {
    this.drawerOpen = true;
  };

  private handleOverlayClick = (e: Event) => {
    if (e.target === e.currentTarget) this.drawerOpen = false;
  };

  private renderNavButton(
    item: NavItem,
    opts: { active?: boolean; showUnread?: boolean } = {},
  ): TemplateResult {
    const active = Boolean(opts.active);
    return html`
      <button
        type="button"
        class="nav-btn relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
          active
            ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
        }"
        data-page=${item.id}
        @click=${() => this.handlePageClick(item.id)}
      >
        <span class="flex-shrink-0 text-base">${item.icon}</span>
        ${
          this.sidebarOpen
            ? html`<span class="truncate">${item.label}</span>`
            : html``
        }
        ${
          opts.showUnread && this.unreadCount > 0
            ? this.sidebarOpen
              ? html`<span
                  class="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs text-white"
                  >${this.unreadCount}</span
                >`
              : html`<span
                  class="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500"
                ></span>`
            : html``
        }
      </button>
    `;
  }

  private renderClanButton(
    clan: Clan,
    variant: 'desktop' | 'drawer',
  ): TemplateResult {
    const active = this.currentClanId === clan.id;
    const activeClass =
      'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    const idleClass =
      'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700';
    const base =
      variant === 'desktop'
        ? 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors'
        : 'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition';
    const dot =
      variant === 'desktop'
        ? 'h-2 w-2 flex-shrink-0 rounded-full'
        : 'h-3 w-3 flex-shrink-0 rounded-full';
    const showLabel = variant === 'drawer' || this.sidebarOpen;
    return html`
      <button
        type="button"
        class="clan-btn ${base} ${active ? activeClass : idleClass}"
        data-clan=${clan.id}
        @click=${() => this.handleClanClick(clan.id)}
      >
        <span class="${dot} ${this.clanDotClass(clan)}"></span>
        ${
          showLabel
            ? html`<span class="truncate">${clan.name}</span>
              ${
                clan.lineage
                  ? html`<span
                    class="ml-auto text-xs text-gray-400"
                    >${t(this.language, `clan.lineage.${clan.lineage}`)}</span
                  >`
                  : html``
              }`
            : html``
        }
      </button>
    `;
  }

  private renderDrawerNavButton(item: NavItem): TemplateResult {
    const active = this.currentPage === item.id;
    const showUnread = item.id === 'notifications' && this.unreadCount > 0;
    return html`
      <button
        type="button"
        class="nav-btn flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm transition ${
          active
            ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'text-gray-600 active:bg-gray-50 dark:text-gray-300 dark:active:bg-gray-700'
        }"
        data-page=${item.id}
        @click=${() => this.handlePageClick(item.id)}
      >
        <span class="text-lg">${item.icon}</span>
        <span class="flex-1 text-left">${item.label}</span>
        ${
          showUnread
            ? html`<span
              class="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white"
              >${this.unreadCount}</span
            >`
            : html``
        }
      </button>
    `;
  }

  private renderDesktop(navItems: NavItem[]): TemplateResult {
    const open = this.sidebarOpen;
    return html`
      <div
        class="sidebar-desktop hidden h-full flex-col transition-[width] duration-200 lg:flex ${
          open ? 'w-64' : 'w-16'
        }"
      >
        <aside
          class="flex h-full flex-shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          <div
            class="border-b border-gray-200 p-4 dark:border-gray-700"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white"
              >
                GP
              </div>
              ${
                open
                  ? html`<h1
                    class="truncate text-lg font-bold text-gray-800 dark:text-gray-100"
                    >Gia Phả</h1
                  >`
                  : html``
              }
            </div>
          </div>

          <div
            class="border-b border-gray-200 p-3 dark:border-gray-700"
          >
            ${
              open
                ? html`<div
                  class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >${t(this.language, 'app.sidebar.clans')}</div
                >`
                : html``
            }
            <div
              class="${open ? 'space-y-1' : 'flex flex-col items-center gap-1'}"
            >
              ${this.clans.map((c) => this.renderClanButton(c, 'desktop'))}
            </div>
          </div>

          <nav class="flex-1 space-y-1 overflow-y-auto p-3">
            ${navItems.map((item) =>
              this.renderNavButton(item, {
                active: this.currentPage === item.id,
              }),
            )}
            <div
              class="my-3 border-t border-gray-200 dark:border-gray-700"
            ></div>
            ${this.renderNavButton(
              {
                id: 'notifications',
                icon: '🔔',
                label: t(this.language, 'app.sidebar.notifications'),
              },
              {
                active: this.currentPage === 'notifications',
                showUnread: true,
              },
            )}
            ${this.renderNavButton({
              id: 'profile',
              icon: '👤',
              label: t(this.language, 'app.sidebar.profile'),
            })}
            ${this.renderNavButton({
              id: 'public-page',
              icon: '🌐',
              label: t(this.language, 'app.sidebar.publicPage'),
            })}
          </nav>

          <div
            class="space-y-2 border-t border-gray-200 p-3 dark:border-gray-700"
          >
            <button
              type="button"
              class="dark-mode-btn flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              @click=${() => this.dispatchToggle('toggle-dark-mode')}
            >
              <span class="flex-shrink-0 text-base"
                >${this.darkMode ? '☀️' : '🌙'}</span
              >
              ${
                open
                  ? html`<span
                    >${this.darkMode ? 'Light Mode' : 'Dark Mode'}</span
                  >`
                  : html``
              }
            </button>
            <button
              type="button"
              class="lang-btn flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              @click=${() => this.dispatchToggle('toggle-language')}
            >
              <span class="flex-shrink-0 text-base">🌍</span>
              ${
                open
                  ? html`<span
                    >${this.language === 'vi' ? 'English' : 'Tiếng Việt'}</span
                  >`
                  : html``
              }
            </button>
            <button
              type="button"
              class="sidebar-toggle flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              @click=${() => this.dispatchToggle('toggle-sidebar')}
            >
              <span class="flex-shrink-0 text-base"
                >${open ? '◀' : '▶'}</span
              >
            </button>
          </div>
        </aside>
      </div>
    `;
  }

  private renderMobile(navItems: NavItem[]): TemplateResult {
    const currentClan = this.clans.find((c) => c.id === this.currentClanId);
    return html`
      <div class="sidebar-mobile lg:hidden">
        <header
          class="fixed left-0 right-0 top-0 z-40 h-[60px] border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95"
        >
          <div class="flex h-full items-center justify-between px-4">
            <button
              type="button"
              class="menu-btn -ml-2 rounded-xl p-2 text-gray-600 active:bg-gray-100 dark:text-gray-300 dark:active:bg-gray-700"
              aria-label="Menu"
              @click=${this.openDrawer}
            >
              <svg
                class="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div class="flex items-center gap-2.5">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white"
              >
                GP
              </div>
              <span
                class="text-base font-semibold text-gray-800 dark:text-gray-100"
                >${currentClan?.name ?? ''}</span
              >
            </div>
            <button
              type="button"
              class="lang-btn -mr-2 rounded-xl p-2 text-sm font-bold text-gray-600 active:bg-gray-100 dark:text-gray-300 dark:active:bg-gray-700"
              @click=${() => this.dispatchToggle('toggle-language')}
            >
              ${this.language === 'vi' ? 'EN' : 'VI'}
            </button>
          </div>
        </header>

        <nav
          class="fixed bottom-0 left-0 right-0 z-40 h-[70px] border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95"
        >
          <div class="flex h-full items-stretch">
            ${navItems.slice(0, 5).map((item) => {
              const active = this.currentPage === item.id;
              return html`
                <button
                  type="button"
                  class="nav-btn relative flex flex-1 flex-col items-center justify-center gap-0.5 active:bg-gray-100 dark:active:bg-gray-700 ${
                    active
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-400'
                  }"
                  data-page=${item.id}
                  @click=${() => this.handlePageClick(item.id)}
                >
                  ${
                    active
                      ? html`<div
                        class="absolute inset-x-0 top-0 mx-4 h-0.5 rounded-full bg-emerald-600"
                      ></div>`
                      : html``
                  }
                  <span class="mt-1 text-xl">${item.icon}</span>
                  <span class="truncate text-[11px] font-medium"
                    >${item.label}</span
                  >
                </button>
              `;
            })}
            <button
              type="button"
              class="nav-btn relative flex flex-1 flex-col items-center justify-center gap-0.5 text-gray-400 active:bg-gray-100 dark:active:bg-gray-700"
              data-page="notifications"
              @click=${() => this.handlePageClick('notifications')}
            >
              <span class="relative mt-1 text-xl"
                >🔔${
                  this.unreadCount > 0
                    ? html`<span
                      class="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500"
                    ></span>`
                    : html``
                }</span
              >
              <span class="text-[11px] font-medium"
                >${t(this.language, 'app.sidebar.notifications')}</span
              >
            </button>
          </div>
        </nav>
      </div>
    `;
  }

  private renderDrawer(navItems: NavItem[]): TemplateResult {
    const person = this.currentPerson;
    const roleLabel = person
      ? (defaultRoles.find((r) => r.name === person.data.role)?.label ?? '')
      : '';
    return html`
      <div
        class="drawer-overlay fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          this.drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }"
        @click=${this.handleOverlayClick}
      >
        <div
          class="drawer-panel absolute bottom-0 left-0 top-0 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-800 ${
            this.drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }"
        >
          <div class="flex h-full flex-col overflow-y-auto">
            ${
              person
                ? html`
                  <div
                    class="flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white"
                  >
                    <div class="flex items-center gap-4">
                      <div
                        class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl"
                      >
                        ${getGenderSymbol(person)}
                      </div>
                      <div>
                        <div class="text-lg font-bold">
                          ${getFullName(person)}
                        </div>
                        <div class="text-sm opacity-80">${roleLabel}</div>
                      </div>
                    </div>
                  </div>
                `
                : html``
            }
            <div
              class="flex-shrink-0 border-b p-4 dark:border-gray-700"
            >
              <p
                class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
              >
                ${t(this.language, 'app.sidebar.clans')}
              </p>
              <div class="space-y-2">
                ${this.clans.map((c) => this.renderClanButton(c, 'drawer'))}
              </div>
            </div>
            <nav class="flex-1 space-y-1 overflow-y-auto p-4">
              ${navItems.map((item) => this.renderDrawerNavButton(item))}
              <div class="my-3 border-t dark:border-gray-700"></div>
              ${this.renderDrawerNavButton({
                id: 'notifications',
                icon: '🔔',
                label: t(this.language, 'app.sidebar.notifications'),
              })}
              ${this.renderDrawerNavButton({
                id: 'profile',
                icon: '👤',
                label: t(this.language, 'app.sidebar.profile'),
              })}
              ${this.renderDrawerNavButton({
                id: 'public-page',
                icon: '🌐',
                label: t(this.language, 'app.sidebar.publicPage'),
              })}
            </nav>
            <div class="flex-shrink-0 border-t p-4 dark:border-gray-700">
              <button
                type="button"
                class="lang-btn-full flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm text-gray-600 active:bg-gray-50 dark:text-gray-300 dark:active:bg-gray-700"
                @click=${() => this.dispatchToggle('toggle-language')}
              >
                <span class="text-lg">🌍</span>
                <span
                  >${
                    this.language === 'vi'
                      ? 'Switch to English'
                      : 'Chuyển sang Tiếng Việt'
                  }</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    const navItems = this.getNavItems();
    return html`
      ${this.renderDesktop(navItems)} ${this.renderMobile(navItems)}
      ${this.renderDrawer(navItems)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-sidebar': Sidebar;
  }
}
