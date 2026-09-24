import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { linkTabOptions, notify, state } from '../state.js';

export function appLinkTabsSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-link-tabs&gt;
      </h2>

      <div
        @click=${(e: Event) => {
          const anchor = (e.target as HTMLElement).closest('a');
          if (!anchor) return;
          e.preventDefault();
          state.linkTabsActive = anchor.getAttribute('href') ?? '';
          state.lastEvent = `app-link-tabs active → "${state.linkTabsActive}"`;
          notify();
        }}
      >
        <app-link-tabs
          .tabs=${linkTabOptions}
          active=${state.linkTabsActive}
        ></app-link-tabs>
      </div>

      <p class="text-xs text-gray-400">
        Active: <span class="font-mono">${state.linkTabsActive || '—'}</span> ·
        Labels use i18n keys (try the 🌐 toggle); the last tab is a plain label.
      </p>
    </section>
  `;
}
