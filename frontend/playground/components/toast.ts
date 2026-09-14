import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { ToastVariant } from '../../src/components/toast.js';
import { toast } from '../../src/components/toast.js';
import { notify, state } from '../state.js';

export function toastSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-toast&gt;
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div class="col-span-2 sm:col-span-2">
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Message</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.toastMessage}"
            @input=${(e: Event) => {
              state.toastMessage = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Variant</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            .value=${state.toastVariant}
            @change=${(e: Event) => {
              state.toastVariant = (e.target as HTMLSelectElement)
                .value as ToastVariant;
              notify();
            }}
          >
            <option value="success">success</option>
            <option value="error">error</option>
            <option value="warning">warning</option>
            <option value="info">info</option>
          </select>
        </div>

        <div>
          <label
            class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Duration (ms, 0 = sticky)</label
          >
          <input
            type="number"
            min="0"
            step="500"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.toastDuration}"
            @input=${(e: Event) => {
              state.toastDuration = Number(
                (e.target as HTMLInputElement).value || 0,
              );
              notify();
            }}
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            toast(state.toastMessage, {
              variant: state.toastVariant,
              duration: state.toastDuration,
            });
          }}
        >
          toast()
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 os-dark:bg-blue-900 os-dark:hover:bg-blue-800 text-blue-700 os-dark:text-blue-300 transition-colors"
          @click=${async () => {
            await toast(state.toastMessage, {
              variant: state.toastVariant,
              duration: state.toastDuration,
            });
            state.toastResult =
              '✅ toast() promise resolved on dismiss/timeout';
            notify();
          }}
        >
          toast() await (promise)
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 os-dark:bg-gray-700 os-dark:hover:bg-gray-600 text-gray-700 os-dark:text-gray-200 transition-colors"
          @click=${() => {
            for (let i = 0; i < 3; i++)
              toast(`Stacked #${i + 1}: ${state.toastMessage}`, {
                variant: state.toastVariant,
                duration: state.toastDuration,
              });
          }}
        >
          Stack 3
        </button>
        <span
          class="text-sm text-gray-600 os-dark:text-gray-300 min-h-6 empty:hidden"
        >
          ${state.toastResult}
        </span>
      </div>

      <p class="text-xs text-gray-400">
        Toasts render at the top — full-width on mobile, top-right on desktop —
        in a shared <code>#app-toast-stack</code>,
        auto-dismiss after <code>duration</code> (0 = sticky until closed via ✕),
        and emit a <code>dismiss</code> event. The <code>toast()</code> helper
        returns a promise that resolves when the toast is removed; the stack
        container cleans itself up when empty.
      </p>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="flex justify-center">
          <app-toast
            message="${state.toastMessage}"
            variant="${state.toastVariant}"
            duration="0"
          ></app-toast>
        </div>
      </div>
    </section>
  `;
}
