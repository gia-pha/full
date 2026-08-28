import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { FieldType } from '../../src/components/app-input.js';
import { eventTypeOptions, fieldTypeOptions, notify, state } from '../state.js';

export function formControlsSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-input&gt; · &lt;app-select&gt; · &lt;app-textarea&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 min-h-[160px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <app-input
            label="${state.fieldLabel}"
            type="${state.fieldType}"
            value="${state.fieldValue}"
            placeholder="${state.fieldPlaceholder}"
            ?required=${state.fieldRequired}
            ?disabled=${state.fieldDisabled}
            @input=${(e: Event) => {
              state.fieldValue = (e.target as HTMLInputElement).value;
              state.lastEvent = `app-input input → "${state.fieldValue}"`;
              notify();
            }}
            @change=${() => {
              state.lastEvent = 'app-input change event (bubbled to host)';
              notify();
            }}
          ></app-input>
          <app-select
            label="Event type"
            .options=${eventTypeOptions}
            value="${state.selectValue}"
            placeholder=${state.selectShowPlaceholder ? '-- None --' : ''}
            @change=${(e: Event) => {
              state.selectValue = (e.target as HTMLSelectElement).value;
              state.lastEvent = `app-select change → "${state.selectValue}"`;
              notify();
            }}
          ></app-select>
          <app-textarea
            label="Notes"
            value="${state.textareaValue}"
            rows=${state.textareaRows}
            @input=${(e: Event) => {
              state.textareaValue = (e.target as HTMLTextAreaElement).value;
              state.lastEvent = 'app-textarea input (bubbled to host)';
              notify();
            }}
          ></app-textarea>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Field type</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.fieldType}"
            @change=${(e: Event) => {
              state.fieldType = (e.target as HTMLSelectElement)
                .value as FieldType;
              notify();
            }}
          >
            ${fieldTypeOptions.map(
              (t) => html`<option value="${t}">${t}</option>`,
            )}
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Field label</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.fieldLabel}"
            @input=${(e: Event) => {
              state.fieldLabel = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Field placeholder</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.fieldPlaceholder}"
            @input=${(e: Event) => {
              state.fieldPlaceholder = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Textarea rows</label
          >
          <input
            type="number"
            min="1"
            max="10"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.textareaRows}"
            @input=${(e: Event) => {
              state.textareaRows = Math.max(
                1,
                parseInt((e.target as HTMLInputElement).value, 10) || 1,
              );
              notify();
            }}
          />
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="field-required"
            ?checked=${state.fieldRequired}
            @change=${(e: Event) => {
              state.fieldRequired = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="field-required"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Field required</label
          >
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="field-disabled"
            ?checked=${state.fieldDisabled}
            @change=${(e: Event) => {
              state.fieldDisabled = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="field-disabled"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Field disabled</label
          >
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="select-placeholder"
            ?checked=${state.selectShowPlaceholder}
            @change=${(e: Event) => {
              state.selectShowPlaceholder = (
                e.target as HTMLInputElement
              ).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="select-placeholder"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Show empty option</label
          >
        </div>
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            Object.assign(state, {
              fieldLabel: 'Name',
              fieldType: 'text' as const,
              fieldValue: 'Nguyễn Văn A',
              fieldPlaceholder: 'Enter full name',
              fieldRequired: false,
              fieldDisabled: false,
              selectValue: 'reunion',
              selectShowPlaceholder: false,
              textareaValue: 'Annual family gathering for the Lunar New Year.',
              textareaRows: 3,
              lastEvent: '',
            });
            notify();
          }}
        >
          Reset
        </button>
      </div>

      <p class="text-xs text-gray-400">
        Last event:
        <span class="font-mono"
          >${state.lastEvent || '— type in a field, pick an option, or toggle a checkbox'}</span
        >
      </p>
    </section>
  `;
}
