import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Event, Person, Transaction } from '../types/index.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import './empty-state.js';

@customElement('app-fund-transactions-table')
export class FundTransactionsTable extends LitElement {
  @property({ type: Array }) transactions: Transaction[] = [];
  @property({ type: Array }) persons: Person[] = [];
  @property({ type: Array }) events: Event[] = [];
  @property({ type: String }) title = '';
  @property({ type: String }) dateLabel = 'Date';
  @property({ type: String }) descriptionLabel = 'Description';
  @property({ type: String }) personLabel = 'Person';
  @property({ type: String }) amountLabel = 'Amount';
  @property({ type: String }) currency = 'VND';
  @property({ type: String }) emptyMessage = 'No data';
  @property({ attribute: false }) sortNewestFirst = true;

  override createRenderRoot() {
    return this;
  }

  private static txTime(tx: Transaction): number {
    const t = new Date(tx.date).getTime();
    return Number.isNaN(t) ? 0 : t;
  }

  private get sortedTransactions(): Transaction[] {
    const txns = [...(this.transactions ?? [])];
    const dir = this.sortNewestFirst ? -1 : 1;
    txns.sort(
      (a, b) =>
        dir *
        (FundTransactionsTable.txTime(a) - FundTransactionsTable.txTime(b)),
    );
    return txns;
  }

  private personName(tx: Transaction): string {
    const p = (this.persons ?? []).find((p) => p.id === tx.personId);
    return p ? `${p.data.firstName} ${p.data.lastName}`.trim() : '';
  }

  private eventName(tx: Transaction): string {
    const e = (this.events ?? []).find((e) => e.id === tx.eventId);
    return e ? e.title : '';
  }

  override render() {
    const title = this.title
      ? html`<h3 class="fund-transactions-title text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">${this.title}</h3>`
      : '';

    if ((this.transactions ?? []).length === 0) {
      return html`
        <div class="app-fund-transactions-table">
          ${title}
          <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <app-empty-state
              icon="📄"
              .message=${this.emptyMessage}
            ></app-empty-state>
          </div>
        </div>
      `;
    }

    return html`
      <div class="app-fund-transactions-table">
        ${title}
        <div
          class="fund-transactions-card border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead
                class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
              >
                <tr>
                  <th
                    class="text-left px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium"
                  >
                    ${this.dateLabel}
                  </th>
                  <th
                    class="text-left px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium"
                  >
                    ${this.descriptionLabel}
                  </th>
                  <th
                    class="text-left px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell"
                  >
                    ${this.personLabel}
                  </th>
                  <th
                    class="text-right px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium"
                  >
                    ${this.amountLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                ${this.sortedTransactions.map((tx) => {
                  const isContribution = tx.type === 'contribution';
                  const badgeClass = isContribution
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
                  const amountClass = isContribution
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400';
                  const eventTitle = this.eventName(tx);
                  return html`<tr
                    class="fund-transactions-row border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td
                      class="px-4 lg:px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap"
                    >
                      ${formatDate(tx.date)}
                    </td>
                    <td class="px-4 lg:px-6 py-4">
                      <span
                        class="fund-transactions-badge inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${badgeClass}"
                        >${isContribution ? '↗' : '↘'}</span
                      >
                      <span
                        class="text-gray-700 dark:text-gray-300"
                        >${tx.description}</span
                      >
                      ${
                        eventTitle
                          ? html`<span
                            class="fund-transactions-event text-xs text-gray-400 dark:text-gray-500"
                            >(${eventTitle})</span
                          >`
                          : ''
                      }
                    </td>
                    <td
                      class="px-4 lg:px-6 py-4 text-gray-600 dark:text-gray-400 hidden sm:table-cell"
                      >${this.personName(tx) || '-'}</td
                    >
                    <td
                      class="fund-transactions-amount px-4 lg:px-6 py-4 text-right font-medium whitespace-nowrap ${amountClass}"
                      >${isContribution ? '+' : '-'}${formatCurrency(tx.amount, this.currency)}</td
                    >
                  </tr>`;
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-fund-transactions-table': FundTransactionsTable;
  }
}
