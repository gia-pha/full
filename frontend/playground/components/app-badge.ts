import type { TemplateResult } from 'lit';
import { html } from 'lit';

export function appBadgeSection(): TemplateResult {
  return html`
    <section class="bg-white os-dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-badge&gt;
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <app-badge label="Gray" color="gray"></app-badge>
        <app-badge label="Emerald" color="emerald"></app-badge>
        <app-badge label="Amber" color="amber"></app-badge>
        <app-badge label="Blue" color="blue"></app-badge>
        <app-badge label="Purple" color="purple"></app-badge>
        <app-badge label="Red" color="red"></app-badge>
        <app-badge label="sm" size="sm" color="gray"></app-badge>
      </div>
    </section>
  `;
}
