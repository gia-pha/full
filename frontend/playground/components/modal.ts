import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { notify, state } from '../state.js';

export function modalSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-modal&gt;
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="modal-open"
            ?checked=${state.modalOpen}
            @change=${(e: Event) => {
              state.modalOpen = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="modal-open"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Open</label
          >
        </div>

        <div class="col-span-2">
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Title</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.modalTitle}"
            @input=${(e: Event) => {
              state.modalTitle = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            state.modalOpen = true;
            notify();
          }}
        >
          Open Modal
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 os-dark:bg-blue-900 os-dark:hover:bg-blue-800 text-blue-700 os-dark:text-blue-300 transition-colors"
          @click=${() => {
            state.modalTitle = 'Add fund transaction';
            state.modalOpen = true;
            notify();
          }}
        >
          Open With Custom Title
        </button>
      </div>

      <p class="text-xs text-gray-400">
        Close via the ✕ button, an overlay click, the Escape key, or Save/Cancel
        inside the body.
      </p>

      <div class="${state.dark ? 'dark' : ''}">
        <app-modal
          ?open=${state.modalOpen}
          title="${state.modalTitle}"
          .body=${html`
            <div class="space-y-3">
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-300"
                  >Name</label
                >
                <input
                  type="text"
                  class="mt-1 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value="${state.modalName}"
                  @input=${(e: Event) => {
                    state.modalName = (e.target as HTMLInputElement).value;
                    notify();
                  }}
                />
              </div>
              <div>
                <label class="text-sm text-gray-600 dark:text-gray-300"
                  >Birth Year</label
                >
                <input
                  type="number"
                  class="mt-1 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value="${state.modalBirthYear}"
                  @input=${(e: Event) => {
                    state.modalBirthYear = (e.target as HTMLInputElement).value;
                    notify();
                  }}
                />
              </div>
              <div class="flex gap-2 pt-2">
                <button
                  class="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  @click=${() => {
                    state.modalOpen = false;
                    notify();
                  }}
                >
                  Save
                </button>
                <button
                  class="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  @click=${() => {
                    state.modalOpen = false;
                    notify();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          `}
          @close=${() => {
            state.modalOpen = false;
            notify();
          }}
        ></app-modal>
      </div>
    </section>
  `;
}
