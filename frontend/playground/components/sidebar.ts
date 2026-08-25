import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { notify, sidebarClans, state } from '../state.js';

const pageOptions = [
  'tree',
  'members',
  'clan-info',
  'events',
  'calendar',
  'funds',
  'notifications',
  'profile',
  'public-page',
];

const controlClass =
  'w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200';

const labelClass = 'block text-xs text-gray-500 os-dark:text-gray-400 mb-1';

export function sidebarSection(): TemplateResult {
  const clans = sidebarClans();
  const person = {
    id: 'sb-p1',
    data: {
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      gender: 'M' as const,
      generation: 5,
      role: state.sidebarRole,
    },
    rels: { parents: [], spouses: [], children: [] },
  };

  const log = (event: string) => {
    state.sidebarEvent = event;
    notify();
  };

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-sidebar&gt;
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label class=${labelClass}>Role (of current person)</label>
          <select
            class=${controlClass}
            value=${state.sidebarRole}
            @change=${(e: Event) => {
              state.sidebarRole = (e.target as HTMLSelectElement)
                .value as typeof state.sidebarRole;
              notify();
            }}
          >
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="member">Member</option>
          </select>
        </div>

        <div>
          <label class=${labelClass}>Current page</label>
          <select
            class=${controlClass}
            value=${state.sidebarPage}
            @change=${(e: Event) => {
              state.sidebarPage = (e.target as HTMLSelectElement).value;
              notify();
            }}
          >
            ${pageOptions.map((p) => html`<option value=${p}>${p}</option>`)}
          </select>
        </div>

        <div>
          <label class=${labelClass}>Current clan</label>
          <select
            class=${controlClass}
            value=${state.sidebarClanId}
            @change=${(e: Event) => {
              state.sidebarClanId = (e.target as HTMLSelectElement).value;
              notify();
            }}
          >
            ${clans.map((c) => html`<option value=${c.id}>${c.name}</option>`)}
          </select>
        </div>

        <div>
          <label class=${labelClass}>Language</label>
          <select
            class=${controlClass}
            value=${state.sidebarLanguage}
            @change=${(e: Event) => {
              state.sidebarLanguage = (e.target as HTMLSelectElement)
                .value as typeof state.sidebarLanguage;
              notify();
            }}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label class=${labelClass}>Unread count</label>
          <input
            type="number"
            min="0"
            class=${controlClass}
            value=${String(state.sidebarUnread)}
            @input=${(e: Event) => {
              state.sidebarUnread = Math.max(
                0,
                Number((e.target as HTMLInputElement).value) || 0,
              );
              notify();
            }}
          />
        </div>

        <div class="flex flex-col justify-end gap-1.5">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              ?checked=${state.sidebarOpen}
              @change=${(e: Event) => {
                state.sidebarOpen = (e.target as HTMLInputElement).checked;
                notify();
              }}
              class="rounded border-gray-300"
            />
            <span class="text-sm text-gray-700 os-dark:text-gray-300"
              >Expanded</span
            >
          </label>
        </div>
      </div>

      <div class="${state.dark ? 'dark' : ''}">
        <div
          class="h-[520px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden flex"
        >
          <app-sidebar
            .clans=${clans}
            .currentClanId=${state.sidebarClanId}
            .currentPage=${state.sidebarPage}
            ?sidebarOpen=${state.sidebarOpen}
            .unreadCount=${state.sidebarUnread}
            ?darkMode=${state.dark}
            .language=${state.sidebarLanguage}
            .currentPerson=${person}
            @clan-select=${(e: CustomEvent) => {
              state.sidebarClanId = e.detail.id as string;
              log(`clan-select → ${e.detail.id}`);
            }}
            @page-select=${(e: CustomEvent) => {
              state.sidebarPage = e.detail.page as string;
              log(`page-select → ${e.detail.page}`);
            }}
            @toggle-sidebar=${() => {
              state.sidebarOpen = !state.sidebarOpen;
              log('toggle-sidebar');
            }}
            @toggle-dark-mode=${() => {
              state.dark = !state.dark;
              log('toggle-dark-mode');
            }}
            @toggle-language=${() => {
              state.sidebarLanguage =
                state.sidebarLanguage === 'vi' ? 'en' : 'vi';
              log('toggle-language');
            }}
          ></app-sidebar>
          <div
            class="flex-1 m-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6"
          >
            <p class="text-sm text-gray-400 dark:text-gray-500">
              Current page
            </p>
            <h3
              class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1"
            >
              ${state.sidebarPage}
            </h3>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Role gates the Admin / Invite nav items. Use the collapse button (◀) in
        the footer to shrink the desktop sidebar, and the unread count drives
        the notification badge.
      </p>

      <div
        class="rounded-lg bg-gray-50 os-dark:bg-gray-700/50 border border-gray-200 os-dark:border-gray-600 px-4 py-3"
      >
        <p class="text-xs text-gray-400 mb-1">Last event</p>
        <span
          class="font-mono text-sm text-gray-700 os-dark:text-gray-200"
          >${
            state.sidebarEvent || '— click a clan, page, or footer button'
          }</span
        >
      </div>
    </section>
  `;
}
