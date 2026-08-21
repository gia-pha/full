import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Transaction } from '../types/index.js';
import { formatCurrency } from '../utils/format.js';
import './empty-state.js';

interface MonthBucket {
  key: string;
  contributions: number;
  expenses: number;
}

@customElement('app-fund-chart')
export class FundChart extends LitElement {
  @property({ type: Array }) transactions: Transaction[] = [];
  @property({ type: String }) title = '';
  @property({ type: String }) currency = 'VND';
  @property({ type: String }) contributionLabel = 'Contributions';
  @property({ type: String }) expenseLabel = 'Expenses';
  @property({ type: Boolean }) showLegend = true;
  @property({ type: String }) emptyMessage = 'No data';
  @property({ attribute: false })
  formatLabel: (key: string) => string = (key) => key;

  override createRenderRoot() {
    return this;
  }

  private get months(): MonthBucket[] {
    const buckets = new Map<string, MonthBucket>();
    for (const tx of this.transactions ?? []) {
      const d = new Date(tx.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = buckets.get(key) ?? { key, contributions: 0, expenses: 0 };
      if (tx.type === 'contribution') bucket.contributions += tx.amount;
      else bucket.expenses += tx.amount;
      buckets.set(key, bucket);
    }
    return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
  }

  override render() {
    const months = this.months;
    if (months.length === 0) {
      return html`
        <div class="app-fund-chart">
          ${
            this.title
              ? html`<h3 class="fund-chart-title text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">${this.title}</h3>`
              : ''
          }
          <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700">
            <app-empty-state
              icon="📊"
              .message=${this.emptyMessage}
            ></app-empty-state>
          </div>
        </div>
      `;
    }

    const maxVal = Math.max(
      ...months.map((m) => Math.max(m.contributions, m.expenses)),
      1,
    );

    return html`
      <div class="app-fund-chart">
        ${
          this.title
            ? html`<h3 class="fund-chart-title text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">${this.title}</h3>`
            : ''
        }
        <div class="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div class="min-w-fit">
            <div class="fund-chart-plot flex items-end gap-3 lg:gap-6" style="height: 200px;">
              ${months.map(
                (m) =>
                  html`<div class="fund-chart-group flex flex-col items-center gap-2 w-[50px] min-w-[50px]">
                    <div class="flex items-end gap-1" style="height: 170px;">
                      <div
                        class="fund-chart-bar fund-chart-bar--contribution bg-emerald-400 hover:bg-emerald-500 rounded-t relative group cursor-pointer transition-colors"
                        style="height: ${(m.contributions / maxVal) * 170}px;width: 22px;"
                      >
                        <div class="fund-chart-tooltip absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${formatCurrency(m.contributions, this.currency)}</div>
                      </div>
                      <div
                        class="fund-chart-bar fund-chart-bar--expense bg-red-400 hover:bg-red-500 rounded-t relative group cursor-pointer transition-colors"
                        style="height: ${(m.expenses / maxVal) * 170}px;width: 22px;"
                      >
                        <div class="fund-chart-tooltip absolute z-10 -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">${formatCurrency(m.expenses, this.currency)}</div>
                      </div>
                    </div>
                    <span class="fund-chart-label text-xs text-gray-500 dark:text-gray-400">${this.formatLabel(m.key)}</span>
                  </div>`,
              )}
            </div>
            ${
              this.showLegend
                ? html`<div class="fund-chart-legend flex items-center gap-6 mt-4 justify-center">
                    <div class="flex items-center gap-2"><div class="w-3 h-3 bg-emerald-400 rounded"></div><span class="text-sm text-gray-500 dark:text-gray-400">${this.contributionLabel}</span></div>
                    <div class="flex items-center gap-2"><div class="w-3 h-3 bg-red-400 rounded"></div><span class="text-sm text-gray-500 dark:text-gray-400">${this.expenseLabel}</span></div>
                  </div>`
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-fund-chart': FundChart;
  }
}
