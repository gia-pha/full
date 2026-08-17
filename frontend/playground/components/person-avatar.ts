import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { AvatarSize } from '../../src/components/person-avatar.js';
import type { Person } from '../../src/types/index.js';
import { notify, sizes, state } from '../state.js';

export function personAvatarSection(person: Person): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;person-avatar&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="flex items-center justify-center min-h-[200px] bg-white dark:bg-gray-900 rounded-xl">
          <person-avatar .person=${person} size="${state.avatarSize}"></person-avatar>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Size</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.avatarSize}"
            @change=${(e: Event) => {
              state.avatarSize = (e.target as HTMLSelectElement)
                .value as AvatarSize;
              notify();
            }}
          >
            ${sizes.map((s) => html`<option value="${s}">${s}</option>`)}
          </select>
        </div>
      </div>
    </section>
  `;
}
