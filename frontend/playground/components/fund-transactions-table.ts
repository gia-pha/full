import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { Event, Transaction } from '../../src/types/index.js';
import { chartTransactions, demoPersons, state } from '../state.js';

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

export function fundTransactionsTableSection(): TemplateResult {
  const persons = demoPersons();
  const transactions: Transaction[] = chartTransactions().map((t, i) => ({
    ...t,
    personId: i % 3 === 0 ? persons[i % persons.length].id : undefined,
    eventId: i === 4 ? 'pg-event-1' : undefined,
  }));
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
        <div class="max-h-[480px] overflow-y-auto bg-white dark:bg-gray-900 rounded-xl p-4">
          <app-fund-transactions-table
            .transactions=${transactions}
            .persons=${persons}
            .events=${demoEvents}
            .title=${'Giao dịch'}
            .dateLabel=${'Ngày'}
            .descriptionLabel=${'Mô tả'}
            .personLabel=${'Người'}
            .amountLabel=${'Số tiền'}
            .currency=${currency}
            .emptyMessage=${'Chưa có giao dịch'}
          ></app-fund-transactions-table>
        </div>
      </div>

      <p class="text-xs text-gray-400 os-dark:text-gray-500">
        ${transactions.length} transactions — dataset shared with the
        &lt;app-fund-chart&gt; scenario selector above.
      </p>
    </section>
  `;
}
