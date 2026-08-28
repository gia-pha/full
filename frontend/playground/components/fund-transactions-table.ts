import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { Event, Transaction } from '../../src/types/index.js';
import type { FundSortDir, FundSortKey } from '../../src/utils/fund.js';
import { chartTransactions, demoPersons, notify, state } from '../state.js';
import { getFundTransactionTable } from '../utils/fund.js';

const demoEvents: Event[] = [
  {
    id: 'pg-event-1',
    title: 'Lễ giỗ tổ 2025',
    date: '2025-02-10',
    location: 'Hà Nội',
    description: 'Lễ giỗ tổ hằng năm',
    status: 'past',
  },
];

const PAGE_SIZE = 10;

export function fundTransactionsTableSection(): TemplateResult {
  const persons = demoPersons();
  const events = demoEvents;
  const all: Transaction[] = chartTransactions().map((t, i) => ({
    ...t,
    personId: i % 3 === 0 ? persons[i % persons.length].id : undefined,
    eventId: i === 4 ? 'pg-event-1' : undefined,
  }));
  const { items, total } = getFundTransactionTable(all, {
    query: state.fundQuery,
    sortKey: state.fundSortKey,
    sortDir: state.fundSortDir,
    page: state.fundPage,
    pageSize: PAGE_SIZE,
    persons,
    events,
  });
  const currency = state.chartScenario === 'usd' ? 'USD' : 'VND';

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;app-fund-transactions-table&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4">
          <app-fund-transactions-table
            .transactions=${items}
            .totalCount=${total}
            .persons=${persons}
            .events=${events}
            .query=${state.fundQuery}
            .page=${state.fundPage}
            .pageSize=${PAGE_SIZE}
            .sortKey=${state.fundSortKey}
            .sortDir=${state.fundSortDir}
            .title=${'Giao dịch'}
            .dateLabel=${'Ngày'}
            .descriptionLabel=${'Mô tả'}
            .personLabel=${'Người'}
            .amountLabel=${'Số tiền'}
            .currency=${currency}
            .emptyMessage=${'Chưa có giao dịch'}
            .noResultsMessage=${'Không tìm thấy giao dịch'}
            .searchPlaceholder=${'Tìm theo mô tả, người, sự kiện…'}
            .showingLabel=${'Hiển thị'}
            .pageLabel=${'Trang'}
            .ofLabel=${'trên'}
            @fund-search-change=${(e: CustomEvent<{ query: string }>) => {
              state.fundQuery = e.detail.query;
              state.fundPage = 1;
              notify();
            }}
            @fund-sort-change=${(
              e: CustomEvent<{ sortKey: FundSortKey; sortDir: FundSortDir }>,
            ) => {
              state.fundSortKey = e.detail.sortKey;
              state.fundSortDir = e.detail.sortDir;
              state.fundPage = 1;
              notify();
            }}
            @fund-page-change=${(e: CustomEvent<{ page: number }>) => {
              state.fundPage = e.detail.page;
              notify();
            }}
          ></app-fund-transactions-table>
        </div>
      </div>

      <p class="text-xs text-gray-400 os-dark:text-gray-500">
        ${all.length} transactions total, ${items.length} on this page — the
        table is controlled: search/sort/page state lives here (the “page”),
        later replaced by a backend request. Dataset shared with the
        &lt;app-fund-chart&gt; scenario selector above.
      </p>
    </section>
  `;
}
