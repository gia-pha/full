import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { memberCardPersons, notify, state } from '../state.js';

const roleOptions: { value: string; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'member', label: 'Member' },
];

export function memberCardSection(): TemplateResult {
  const persons = memberCardPersons();
  const person =
    persons.find((p) => p.id === state.memberCardSelectedId) ?? persons[0];

  const log = (event: string) => {
    state.memberCardEvent = event;
    notify();
  };

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;member-card&gt;
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Role (of selected)</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.memberCardRole}"
            @change=${(e: Event) => {
              state.memberCardRole = (e.target as HTMLSelectElement)
                .value as typeof state.memberCardRole;
              notify();
            }}
          >
            ${roleOptions.map(
              (o) => html`<option value="${o.value}">${o.label}</option>`,
            )}
          </select>
        </div>

        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Honorific</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.memberCardHonorific}"
            @input=${(e: Event) => {
              state.memberCardHonorific = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Notes</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.memberCardNotes}"
            @input=${(e: Event) => {
              state.memberCardNotes = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div class="flex flex-col justify-end gap-1.5">
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              ?checked=${state.memberCardIsCurrent}
              @change=${(e: Event) => {
                state.memberCardIsCurrent = (
                  e.target as HTMLInputElement
                ).checked;
                notify();
              }}
              class="rounded border-gray-300"
            />
            <span class="text-sm text-gray-700 os-dark:text-gray-300"
              >Is current person</span
            >
          </label>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              ?checked=${state.memberCardLocked}
              @change=${(e: Event) => {
                state.memberCardLocked = (e.target as HTMLInputElement).checked;
                notify();
              }}
              class="rounded border-gray-300"
            />
            <span class="text-sm text-gray-700 os-dark:text-gray-300"
              >Locked (limited access)</span
            >
          </label>
          <label class="flex items-center gap-2">
            <input
              type="checkbox"
              ?checked=${state.memberCardDeceased}
              @change=${(e: Event) => {
                state.memberCardDeceased = (
                  e.target as HTMLInputElement
                ).checked;
                notify();
              }}
              class="rounded border-gray-300"
            />
            <span class="text-sm text-gray-700 os-dark:text-gray-300"
              >Deceased</span
            >
          </label>
        </div>
      </div>

      <div class="${state.dark ? 'dark' : ''}">
        <div
          class="h-[480px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 overflow-hidden flex"
        >
          <member-card
            .person=${person}
            .persons=${persons}
            .currentPersonId=${state.memberCardIsCurrent ? 'mc-1' : ''}
            .honorific=${person.id === 'mc-1' ? state.memberCardHonorific : ''}
            ?locked=${state.memberCardLocked}
            @select=${(e: CustomEvent) => {
              state.memberCardSelectedId = e.detail.id as string;
              log(`select → ${e.detail.id}`);
            }}
            @edit=${() => log('edit')}
            @delete=${() => log('delete')}
            @close=${() => log('close')}
          ></member-card>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Click a spouse / parent / child to switch the selected person — the
        card re-renders and bubbles a <code>select</code> event with
        <code>detail.id</code>. The card always fills its container, at any
        viewport size.
      </p>

      <div
        class="rounded-lg bg-gray-50 os-dark:bg-gray-700/50 border border-gray-200 os-dark:border-gray-600 px-4 py-3"
      >
        <p class="text-xs text-gray-400 mb-1">Last event</p>
        <span
          class="font-mono text-sm text-gray-700 os-dark:text-gray-200"
          >${
            state.memberCardEvent ||
            '— click a relation, child, edit, delete, or close'
          }</span
        >
      </div>
    </section>
  `;
}
