import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { formatCurrency } from '../utils/format.js';

@customElement('app-fund-summary')
export class FundSummary extends LitElement {
  @property({ type: Number }) balance = 0;
  @property({ type: Number }) totalContributions = 0;
  @property({ type: Number }) totalExpenses = 0;
  @property({ type: String }) currency = 'VND';
  @property({ type: String }) balanceLabel = 'Balance';
  @property({ type: String }) contributionLabel = 'Total contributions';
  @property({ type: String }) expenseLabel = 'Total expenses';

  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <div
        class="fund-summary grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"
      >
        <div
          class="fund-summary-card fund-summary-card--balance bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
        >
          <p class="fund-summary-label text-sm opacity-80 mb-2"
            >${this.balanceLabel}</p
          >
          <p class="fund-summary-value text-2xl lg:text-3xl font-bold">${formatCurrency(this.balance, this.currency)}</p>
        </div>
        <div
          class="fund-summary-card fund-summary-card--contributions bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white"
        >
          <p class="fund-summary-label text-sm opacity-80 mb-2"
            >${this.contributionLabel}</p
          >
          <p class="fund-summary-value text-2xl lg:text-3xl font-bold">${formatCurrency(this.totalContributions, this.currency)}</p>
        </div>
        <div
          class="fund-summary-card fund-summary-card--expenses bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white"
        >
          <p class="fund-summary-label text-sm opacity-80 mb-2"
            >${this.expenseLabel}</p
          >
          <p class="fund-summary-value text-2xl lg:text-3xl font-bold">${formatCurrency(this.totalExpenses, this.currency)}</p>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-fund-summary': FundSummary;
  }
}
