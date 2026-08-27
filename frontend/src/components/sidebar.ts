import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { t } from '../i18n.js';
import type { Clan, Person } from '../types/index.js';
import { getFullName, getGenderSymbol } from '../utils/format.js';

export type SidebarLanguage = 'vi' | 'en';

export interface NavItem {
  id: string;
  icon: string;
  labelKey: string;
  unreadBadge?: boolean;
}

@customElement('app-sidebar')
export class Sidebar extends LitElement {
  @property({ type: Array }) clans: Clan[] = [];
  @property({ type: Array }) navItems: NavItem[] = [];
  @property({ type: Array }) mobileNavItems: NavItem[] = [];
  @property({ type: String }) currentClanId = '';
  @property({ type: String }) currentPage = '';
  @property({ type: Boolean }) sidebarOpen = true;
  @property({ type: Number }) unreadCount = 0;
  @property({ type: String }) language: SidebarLanguage = 'vi';
  @property({ type: Object }) currentPerson?: Person;
  @property({ type: String }) roleLabel = '';

  @state() private drawerOpen = false;

  override createRenderRoot() {
    return this;
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('sidebarOpen')) {
      this.drawerOpen = this.sidebarOpen;
    }
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

  private renderClanButton(clan: Clan): TemplateResult {
    const active = this.currentClanId === clan.id;
    return html`
      <button
        type="button"
        class="clan-btn flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
          active
            ? 'bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
            : 'text-gray-600 active:bg-gray-50 dark:text-gray-300 dark:active:bg-gray-700'
        }"
        data-clan=${clan.id}
        @click=${() => this.handleClanClick(clan.id)}
      >
        <span
          class="h-3 w-3 flex-shrink-0 rounded-full ${this.clanDotClass(clan)}"
        ></span>
        <span class="flex-1 truncate">${clan.name}</span>
        ${
          clan.lineage
            ? html`<span
              class="text-xs text-gray-400"
              >${t(this.language, `clan.lineage.${clan.lineage}`)}</span
            >`
            : html``
        }
      </button>
    `;
  }

  private renderNavButton(item: NavItem): TemplateResult {
    const active = this.currentPage === item.id;
    const showUnread = item.unreadBadge && this.unreadCount > 0;
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
        <span class="flex-1 text-left"
          >${t(this.language, item.labelKey)}</span
        >
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

  private renderPanelContent(): TemplateResult {
    const person = this.currentPerson;
    return html`
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
                  <div class="text-sm opacity-80">${this.roleLabel}</div>
                </div>
              </div>
            </div>
          `
          : html``
      }
      <div class="flex-shrink-0 border-b p-4 dark:border-gray-700">
        <p
          class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
        >
          ${t(this.language, 'app.sidebar.clans')}
        </p>
        <div class="space-y-2">
          ${this.clans.map((c) => this.renderClanButton(c))}
        </div>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto p-4">
        ${this.navItems.map((item) => this.renderNavButton(item))}
      </nav>
      <div class="flex-shrink-0 border-t p-4 dark:border-gray-700">
        <button
          type="button"
          class="lang-btn-full flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm text-gray-600 active:bg-gray-50 dark:text-gray-300 dark:active:bg-gray-700"
          @click=${() => this.dispatchToggle('toggle-language')}
        >
          <span class="text-lg">🌍</span>
          <span>${t(this.language, 'app.sidebar.switchLanguage')}</span>
        </button>
      </div>
    `;
  }

  private renderDesktop(): TemplateResult {
    const open = this.sidebarOpen;
    return html`
      <div
        class="sidebar-panel hidden h-full flex-shrink-0 overflow-hidden transition-[width] duration-300 lg:block ${
          open ? 'w-80 max-w-full' : 'w-0'
        }"
      >
        <aside
          class="flex h-full w-80 flex-col overflow-y-auto border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
        >
          ${this.renderPanelContent()}
        </aside>
      </div>
    `;
  }

  private renderMobile(): TemplateResult {
    const currentClan = this.clans.find((c) => c.id === this.currentClanId);
    return html`
      <div class="sidebar-mobile absolute inset-0 lg:hidden">
        <header
          class="absolute left-0 right-0 top-0 z-40 h-[60px] border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95"
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
          class="absolute bottom-0 left-0 right-0 z-40 h-[70px] border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95"
        >
          <div class="flex h-full items-stretch">
            ${this.mobileNavItems.map((item) => {
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
                  <span class="relative mt-1 text-xl"
                    >${item.icon}${
                      item.unreadBadge && this.unreadCount > 0
                        ? html`<span
                          class="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-red-500"
                        ></span>`
                        : html``
                    }</span
                  >
                  <span class="truncate text-[11px] font-medium"
                    >${t(this.language, item.labelKey)}</span
                  >
                </button>
              `;
            })}
          </div>
        </nav>

        <div
          class="drawer-overlay absolute inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
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
              ${this.renderPanelContent()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    return html`${this.renderDesktop()} ${this.renderMobile()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-sidebar': Sidebar;
  }
}
