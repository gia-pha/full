import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { iconDelete, iconEdit, iconView } from '../../src/icons/index.js';
import type { Person } from '../../src/types/index.js';
import { notify, state } from '../state.js';

export function memberItemSection(person: Person): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;member-item&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="min-h-[200px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <member-item
            .person=${person}
            ?selected=${state.selected}
            .honorific=${state.honorific}
            ?locked=${state.locked}
            .actions=${[
              {
                label: 'View',
                icon: iconView,
                color:
                  'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400',
                onClick: () => alert('View'),
              },
              {
                label: 'Edit',
                icon: iconEdit,
                color:
                  'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400',
                onClick: () => alert('Edit'),
              },
              {
                label: 'Delete',
                icon: iconDelete,
                color:
                  'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400',
                onClick: () => alert('Delete'),
              },
            ]}
          ></member-item>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="selected"
            ?checked=${state.selected}
            @change=${(e: Event) => {
              state.selected = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="selected"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Selected</label
          >
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="locked"
            ?checked=${state.locked}
            @change=${(e: Event) => {
              state.locked = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="locked"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Locked</label
          >
        </div>

        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Honorific</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.honorific}"
            @input=${(e: Event) => {
              state.honorific = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
      </div>
    </section>
  `;
}
