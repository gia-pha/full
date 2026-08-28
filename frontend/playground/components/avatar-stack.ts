import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { demoPersons, notify, state } from '../state.js';

export function avatarStackSection(): TemplateResult {
  const persons = demoPersons();
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-avatar-stack&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="flex items-center justify-center min-h-[200px] bg-white dark:bg-gray-900 rounded-xl">
          <app-avatar-stack
            .people=${persons}
            max=${state.stackMax}
            size="sm"
            label=${state.stackLabel}
            .showOverflow=${state.stackShowOverflow}
          ></app-avatar-stack>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Max avatars</label
          >
          <input
            type="number"
            min="1"
            max="10"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.stackMax}
            @change=${(e: Event) => {
              state.stackMax = Number((e.target as HTMLInputElement).value);
              notify();
            }}
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Label (empty to hide)</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.stackLabel}
            @change=${(e: Event) => {
              state.stackLabel = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
        <div>
          <label class="flex items-center gap-2 text-xs text-gray-500 os-dark:text-gray-400 py-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 os-dark:border-gray-600"
              ?checked=${state.stackShowOverflow}
              @change=${(e: Event) => {
                state.stackShowOverflow = (
                  e.target as HTMLInputElement
                ).checked;
                notify();
              }}
            />
            Show +N overflow badge
          </label>
        </div>
      </div>
    </section>
  `;
}
