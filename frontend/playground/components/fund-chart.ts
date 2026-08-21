import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { chartTransactions, notify, state } from '../state.js';

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200';

export function fundChartSection(): TemplateResult {
  const transactions = chartTransactions();
  const currency = state.chartScenario === 'usd' ? 'USD' : 'VND';

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;app-fund-chart&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="min-h-[80px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <app-fund-chart
            .transactions=${transactions}
            .title=${state.chartTitle}
            .currency=${currency}
            .contributionLabel=${'Đóng góp'}
            .expenseLabel=${'Chi tiêu'}
            .showLegend=${state.chartShowLegend}
            .emptyMessage=${'Chưa có dữ liệu'}
            .formatLabel=${(key: string) =>
              state.chartSlashedLabels ? key.replaceAll('-', '/') : key}
          ></app-fund-chart>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Dataset</label
          >
          <select
            class=${inputClass}
            value="${state.chartScenario}"
            @change=${(e: Event) => {
              state.chartScenario = (e.target as HTMLSelectElement).value as
                | 'sample'
                | 'usd'
                | 'big'
                | 'empty';
              notify();
            }}
          >
            <option value="sample">Clan fund — 2 years (VND)</option>
            <option value="usd">Small fund — 1 year (USD)</option>
            <option value="big">Big data — 10 years, 361 txns (VND)</option>
            <option value="empty">Empty (no transactions)</option>
          </select>
          <p class="mt-1 text-xs text-gray-400 os-dark:text-gray-500">
            ${transactions.length} transactions
          </p>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Title</label
          >
          <input
            type="text"
            class=${inputClass}
            value="${state.chartTitle}"
            placeholder="—"
            @input=${(e: Event) => {
              state.chartTitle = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-6">
        <label class="flex items-center gap-2 text-sm text-gray-700 os-dark:text-gray-200">
          <input
            type="checkbox"
            class="rounded"
            .checked=${state.chartShowLegend}
            @change=${(e: Event) => {
              state.chartShowLegend = (e.target as HTMLInputElement).checked;
              notify();
            }}
          />
          Show legend (Đóng góp / Chi tiêu)
        </label>
        <label class="flex items-center gap-2 text-sm text-gray-700 os-dark:text-gray-200">
          <input
            type="checkbox"
            class="rounded"
            .checked=${state.chartSlashedLabels}
            @change=${(e: Event) => {
              state.chartSlashedLabels = (e.target as HTMLInputElement).checked;
              notify();
            }}
          />
          Format month labels (2025/01)
        </label>
      </div>
    </section>
  `;
}
