import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { ButtonVariant } from '../../src/components/app-button.js';
import { notify, state } from '../state.js';

export const buttonVariantOptions: ButtonVariant[] = [
  'primary',
  'secondary',
  'danger',
  'soft-danger',
];

export function appButtonSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-button&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="flex flex-wrap items-center gap-4 min-h-[120px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <app-button
            class=${state.buttonFullWidth ? 'w-full' : ''}
            variant=${state.buttonVariant}
            icon=${state.buttonIcon}
            label=${state.buttonLabel}
            ?disabled=${state.buttonDisabled}
            @click=${() => {
              state.lastEvent = `app-button clicked (${state.buttonVariant})`;
              notify();
            }}
          ></app-button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Icon (empty to hide)</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.buttonIcon}
            @input=${(e: Event) => {
              state.buttonIcon = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Label</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.buttonLabel}
            @input=${(e: Event) => {
              state.buttonLabel = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Variant</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value=${state.buttonVariant}
            @change=${(e: Event) => {
              state.buttonVariant = (e.target as HTMLSelectElement)
                .value as ButtonVariant;
              notify();
            }}
          >
            ${buttonVariantOptions.map(
              (v) =>
                html`<option value=${v} ?selected=${v === state.buttonVariant}>${v}</option>`,
            )}
          </select>
        </div>

        <div>
          <label class="flex items-center gap-2 text-xs text-gray-500 os-dark:text-gray-400 py-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 os-dark:border-gray-600"
              ?checked=${state.buttonFullWidth}
              @change=${(e: Event) => {
                state.buttonFullWidth = (e.target as HTMLInputElement).checked;
                notify();
              }}
            />
            Full width
          </label>
        </div>

        <div>
          <label class="flex items-center gap-2 text-xs text-gray-500 os-dark:text-gray-400 py-2 cursor-pointer">
            <input
              type="checkbox"
              class="rounded border-gray-300 os-dark:border-gray-600"
              ?checked=${state.buttonDisabled}
              @change=${(e: Event) => {
                state.buttonDisabled = (e.target as HTMLInputElement).checked;
                notify();
              }}
            />
            Disabled
          </label>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Last event:
        <span class="font-mono">${state.lastEvent || '— click a button'}</span>
      </p>
    </section>
  `;
}
