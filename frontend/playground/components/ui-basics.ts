import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { TabsDetail } from '../../src/components/tabs.js';
import { notify, state, tabOptions } from '../state.js';

export function uiBasicsSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-toggle&gt; · &lt;app-tabs&gt; · &lt;app-empty-state&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-6">
          <div class="space-y-3">
            <app-toggle
              label="Fund changes"
              ?checked=${state.toggleChecked}
              @change=${(e: CustomEvent) => {
                state.toggleChecked = e.detail.checked;
                state.lastEvent = `app-toggle change → ${state.toggleChecked}`;
                notify();
              }}
            ></app-toggle>
          </div>

          <app-tabs
            .tabs=${tabOptions}
            value=${state.tabsValue}
            @change=${(e: CustomEvent<TabsDetail>) => {
              state.tabsValue = e.detail.id;
              state.lastEvent = `app-tabs change → "${e.detail.id}"`;
              notify();
            }}
          ></app-tabs>

          ${
            state.emptyVisible
              ? html`<app-empty-state
                icon=${state.emptyIcon}
                message=${state.emptyMessage}
              ></app-empty-state>`
              : html``
          }
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Empty-state icon</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.emptyIcon}"
            @input=${(e: Event) => {
              state.emptyIcon = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Empty-state message</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.emptyMessage}"
            @input=${(e: Event) => {
              state.emptyMessage = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div class="flex items-end">
          <input
            type="checkbox"
            id="empty-visible"
            ?checked=${state.emptyVisible}
            @change=${(e: Event) => {
              state.emptyVisible = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="empty-visible"
            class="ml-2 text-sm text-gray-700 os-dark:text-gray-300"
            >Show empty-state</label
          >
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Last event:
        <span class="font-mono"
          >${state.lastEvent || '— toggle a switch or pick a tab'}</span
        >
      </p>
    </section>
  `;
}
