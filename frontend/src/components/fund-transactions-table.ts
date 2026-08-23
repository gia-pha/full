import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Event, Person, Transaction } from '../types/index.js';
import { formatCurrency, formatDate } from '../utils/format.js';
import type { FundSortDir, FundSortKey } from '../utils/fund.js';
import { getEventTitle, getPersonName } from '../utils/fund.js';
import './empty-state.js';

@customElement('app-fund-transactions-table')
export class FundTransactionsTable extends LitElement {
  @property({ type: Array }) transactions: Transaction[] = [];
  @property({ type: Number }) totalCount = 0;
  @property({ type: Array }) persons: Person[] = [];
  @property({ type: Array }) events: Event[] = [];
  @property({ type: String }) query = '';
  @property({ type: String }) title = '';
  @property({ type: String }) dateLabel = 'Date';
  @property({ type: String }) descriptionLabel = 'Description';
  @property({ type: String }) personLabel = 'Person';
  @property({ type: String }) amountLabel = 'Amount';
  @property({ type: String }) currency = 'VND';
  @property({ type: String }) emptyMessage = 'No data';
  @property({ type: String }) noResultsMessage = 'No results';
  @property({ type: String }) searchPlaceholder = 'Search…';
  @property({ type: String }) showingLabel = 'Showing';
  @property({ type: String }) pageLabel = 'Page';
  @property({ type: String }) ofLabel = 'of';
  @property({ type: Number }) page = 1;
  @property({ type: Number }) pageSize = 10;
  @property({ type: String }) sortKey: FundSortKey = 'date';
  @property({ type: String }) sortDir: FundSortDir = 'desc';

  override createRenderRoot() {
    return this;
  }

  private sortIndicator(key: FundSortKey): string {
    if (this.sortKey !== key) return '↕';
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  private indicatorClass(key: FundSortKey): string {
    return this.sortKey === key
      ? 'text-gray-700 dark:text-gray-200'
      : 'text-gray-400 dark:text-gray-500';
  }

  private onSortClick(key: FundSortKey): void {
    const sortDir: FundSortDir =
      this.sortKey === key ? (this.sortDir === 'asc' ? 'desc' : 'asc') : 'desc';
    this.dispatchEvent(
      new CustomEvent('fund-sort-change', {
        detail: { sortKey: key, sortDir },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onSearch(e: globalThis.Event): void {
    this.dispatchEvent(
      new CustomEvent('fund-search-change', {
        detail: { query: (e.target as HTMLInputElement).value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onPage(page: number): void {
    this.dispatchEvent(
      new CustomEvent('fund-page-change', {
        detail: { page },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private toolbar() {
    return html`<div
      class="fund-transactions-toolbar px-4 lg:px-6 py-3 border-b border-gray-100 dark:border-gray-700"
    >
      <div class="relative">
        <input
          type="search"
          class="fund-transactions-search w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder=${this.searchPlaceholder}
          .value=${this.query}
          @input=${this.onSearch}
        />
        <span
          class="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500"
          >🔍</span
        >
      </div>
    </div>`;
  }

  private sortHeader(key: FundSortKey, label: string) {
    return html`<button
      type="button"
      class="fund-transactions-sort fund-transactions-sort--${key} inline-flex items-center gap-1 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      @click=${() => this.onSortClick(key)}
    >
      ${label}<span
        class=${this.indicatorClass(key)}
        >${this.sortIndicator(key)}</span
      >
    </button>`;
  }

  override render() {
    const rows = this.transactions ?? [];
    const title = this.title
      ? html`<h3 class="fund-transactions-title text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">${this.title}</h3>`
      : '';
    const searching = this.query.trim() !== '';
    const showToolbar = rows.length > 0 || this.totalCount > 0 || searching;

    const total = Math.max(0, this.totalCount);
    const pageSize =
      Number.isInteger(this.pageSize) && this.pageSize > 0 ? this.pageSize : 10;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(Math.max(1, this.page || 1), pageCount);
    const paginate = rows.length > 0 && total > pageSize;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);

    return html`
      <div class="app-fund-transactions-table">
        ${title}
        <div
          class="fund-transactions-card border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
        >
          ${showToolbar ? this.toolbar() : ''}
          ${
            rows.length > 0
              ? html`
                  ${this.table(rows)}
                  ${paginate ? this.footer(start, end, total, page, pageCount) : ''}
                `
              : html`<app-empty-state
                  icon=${searching ? '🔍' : '📄'}
                  .message=${searching ? this.noResultsMessage : this.emptyMessage}
                ></app-empty-state>`
          }
        </div>
      </div>
    `;
  }

  private table(rows: Transaction[]) {
    return html`
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead
            class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <tr>
              <th
                class="text-left px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium"
              >
                ${this.sortHeader('date', this.dateLabel)}
              </th>
              <th
                class="text-left px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium"
              >
                ${this.sortHeader('description', this.descriptionLabel)}
              </th>
              <th
                class="text-left px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell"
              >
                ${this.sortHeader('person', this.personLabel)}
              </th>
              <th
                class="text-right px-4 lg:px-6 py-3 text-gray-500 dark:text-gray-400 font-medium"
              >
                ${this.sortHeader('amount', this.amountLabel)}
              </th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((tx) => {
              const isContribution = tx.type === 'contribution';
              const badgeClass = isContribution
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
              const amountClass = isContribution
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400';
              const eventTitle = getEventTitle(this.events, tx.eventId);
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
                  >${getPersonName(this.persons, tx.personId) || '-'}</td
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
    `;
  }

  private footer(
    start: number,
    end: number,
    total: number,
    page: number,
    pageCount: number,
  ) {
    return html`<div
      class="fund-transactions-footer flex flex-col sm:flex-row items-center justify-between gap-2 px-4 lg:px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400"
    >
      <span class="fund-transactions-count"
        >${this.showingLabel} ${start}–${end} ${this.ofLabel} ${total}</span
      >
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="fund-transactions-prev px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          ?disabled=${page <= 1}
          @click=${() => this.onPage(page - 1)}
          >←</button
        >
        <span class="fund-transactions-page-info"
          >${this.pageLabel} ${page} ${this.ofLabel} ${pageCount}</span
        >
        <button
          type="button"
          class="fund-transactions-next px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          ?disabled=${page >= pageCount}
          @click=${() => this.onPage(page + 1)}
          >→</button
        >
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementEventMap {
    'fund-search-change': CustomEvent<{ query: string }>;
    'fund-sort-change': CustomEvent<{
      sortKey: FundSortKey;
      sortDir: FundSortDir;
    }>;
    'fund-page-change': CustomEvent<{ page: number }>;
  }

  interface HTMLElementTagNameMap {
    'app-fund-transactions-table': FundTransactionsTable;
  }
}
