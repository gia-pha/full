import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { confirmDialog } from '../../src/components/confirm-dialog.js';
import { notify, state } from '../state.js';

export function confirmDialogSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-confirm-dialog&gt;
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div class="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="confirm-danger"
            ?checked=${state.confirmDanger}
            @change=${(e: Event) => {
              state.confirmDanger = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="confirm-danger"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Danger</label
          >
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Title</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.confirmTitle}"
            @input=${(e: Event) => {
              state.confirmTitle = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div class="col-span-2 sm:col-span-3 lg:col-span-2">
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Message</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.confirmMessage}"
            @input=${(e: Event) => {
              state.confirmMessage = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Confirm label (empty = default)</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.confirmOkLabel}"
            @input=${(e: Event) => {
              state.confirmOkLabel = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Cancel label (empty = default)</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.confirmCancelLabel}"
            @input=${(e: Event) => {
              state.confirmCancelLabel = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            state.confirmOpen = true;
            notify();
          }}
        >
          Open (declarative)
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 os-dark:bg-blue-900 os-dark:hover:bg-blue-800 text-blue-700 os-dark:text-blue-300 transition-colors"
          @click=${async () => {
            const ok = await confirmDialog({
              title: state.confirmTitle,
              message: state.confirmMessage,
              confirmLabel: state.confirmOkLabel,
              cancelLabel: state.confirmCancelLabel,
              danger: state.confirmDanger,
            });
            state.confirmResult = ok
              ? '✅ confirmDialog() resolved true'
              : '❌ confirmDialog() resolved false';
            notify();
          }}
        >
          Open via confirmDialog() promise
        </button>
        <span
          class="text-sm text-gray-600 os-dark:text-gray-300 min-h-6 empty:hidden"
        >
          ${state.confirmResult}
        </span>
      </div>

      <p class="text-xs text-gray-400">
        Declarative usage emits <code>confirm</code>/<code>cancel</code> events;
        closing via ✕, overlay click, or Escape counts as cancel. The promise
        helper appends its own element to <code>document.body</code> and removes
        itself on resolve.
      </p>

      <div class="${state.dark ? 'dark' : ''}">
        <app-confirm-dialog
          ?open=${state.confirmOpen}
          title="${state.confirmTitle}"
          message="${state.confirmMessage}"
          confirmLabel="${state.confirmOkLabel}"
          cancelLabel="${state.confirmCancelLabel}"
          ?danger=${state.confirmDanger}
          @confirm=${() => {
            state.confirmOpen = false;
            state.confirmResult = '✅ confirm event';
            notify();
          }}
          @cancel=${() => {
            state.confirmOpen = false;
            state.confirmResult = '❌ cancel event';
            notify();
          }}
        ></app-confirm-dialog>
      </div>
    </section>
  `;
}
