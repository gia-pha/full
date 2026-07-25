import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Transaction } from '../types/index.js';
import { formatCurrency, formatDate } from '../utils/format.js';

@customElement('transaction-item')
export class TransactionItem extends LitElement {
  @property({ type: Object }) declare transaction: Transaction;
  @property({ type: String }) personName = '';
  @property({ type: String }) eventName = '';
  @property({ type: String }) currency = 'VND';

  override createRenderRoot() {
    return this;
  }

  private get isContribution(): boolean {
    return this.transaction?.type === 'contribution';
  }

  override render() {
    if (!this.transaction) return html``;

    const tx = this.transaction;
    const typeLabel = this.isContribution ? '↗' : '↘';
    const typeBadgeClass = this.isContribution
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    const amountClass = this.isContribution
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';
    const sign = this.isContribution ? '+' : '-';

    return html`
      <div class="transaction-item grid grid-cols-2 sm:grid-cols-4 gap-4 items-center px-4 lg:px-6 py-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
        <div class="text-gray-500 dark:text-gray-400 whitespace-nowrap">${formatDate(tx.date)}</div>
        <div class="min-w-0">
          <span class="inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${typeBadgeClass}">${typeLabel}</span>
          <span class="text-gray-700 dark:text-gray-300 truncate">${tx.description}</span>
          ${tx.eventId && this.eventName ? html`<span class="text-xs text-gray-400 dark:text-gray-500 ml-1">(${this.eventName})</span>` : ''}
        </div>
        <div class="hidden sm:block text-gray-600 dark:text-gray-400 truncate">${this.personName || '-'}</div>
        <div class="text-right font-medium whitespace-nowrap ${amountClass}">${sign}${formatCurrency(tx.amount, this.currency)}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'transaction-item': TransactionItem;
  }
}
