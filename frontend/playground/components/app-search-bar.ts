import type { TemplateResult } from 'lit';
import { html } from 'lit';
import '../../src/components/app-search-bar.js';
import { notify, state } from '../state.js';

const names = [
  'Nguyễn Văn A',
  'Trần Thị Hương',
  'Lê Văn Thắng',
  'Phạm Thị Mai',
  'Nguyễn Văn Cường',
  'Phạm Thị Lệ',
  'Nguyễn Thị Lan',
  'Lê Văn An',
];

export function appSearchBarSection(): TemplateResult {
  const q = state.searchValue.trim().toLowerCase();
  const results = q ? names.filter((n) => n.toLowerCase().includes(q)) : names;

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-4"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-search-bar&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-4">
          <app-search-bar
            value="${state.searchValue}"
            placeholder="Search members…"
            aria-label="Search members"
            @search=${(e: CustomEvent<{ value: string }>) => {
              state.searchValue = e.detail.value;
              state.lastEvent = `search → "${e.detail.value}"`;
              notify();
            }}
          ></app-search-bar>

          <p class="text-xs text-gray-400">
            ${results.length} of ${names.length} members
          </p>

          <ul class="divide-y divide-gray-100 dark:divide-gray-700">
            ${results.map(
              (name) => html`
                <li class="py-2 text-sm text-gray-700 dark:text-gray-300">
                  ${name}
                </li>
              `,
            )}
            ${
              results.length === 0
                ? html`<li class="py-4 text-center text-sm text-gray-400">
                    No matches
                  </li>`
                : ''
            }
          </ul>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Last event:
        <span class="font-mono"
          >${state.lastEvent || '— type to search, press Enter, or clear'}</span
        >
      </p>
    </section>
  `;
}
