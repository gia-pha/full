import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { notify, state, updateTransaction } from '../state.js';

export function transactionItemSection(): TemplateResult {
  const transaction = updateTransaction();

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;transaction-item&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="min-h-[80px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <div class="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center px-4 lg:px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              <div>Date</div>
              <div>Description</div>
              <div class="hidden sm:block">Person</div>
              <div class="text-right">Amount</div>
            </div>
            <transaction-item
              .transaction=${transaction}
              .personName=${state.txnPersonName}
              .eventName=${state.txnEventName}
              .currency=${state.txnCurrency}
            ></transaction-item>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Type</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.txnType}"
            @change=${(e: Event) => {
              state.txnType = (e.target as HTMLSelectElement).value as
                | 'contribution'
                | 'expense';
              notify();
            }}
          >
            <option value="contribution">Contribution</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Amount</label
          >
          <input
            type="number"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.txnAmount}"
            min="0"
            step="100000"
            @input=${(e: Event) => {
              state.txnAmount =
                parseInt((e.target as HTMLInputElement).value, 10) || 0;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Date</label
          >
          <input
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.txnDate}"
            @input=${(e: Event) => {
              state.txnDate = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Currency</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.txnCurrency}"
            @change=${(e: Event) => {
              state.txnCurrency = (e.target as HTMLSelectElement).value;
              notify();
            }}
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Person Name</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.txnPersonName}"
            placeholder="—"
            @input=${(e: Event) => {
              state.txnPersonName = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Event Name</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.txnEventName}"
            placeholder="—"
            @input=${(e: Event) => {
              state.txnEventName = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
      </div>

      <div>
        <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
          >Description</label
        >
        <input
          type="text"
          class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
          value="${state.txnDescription}"
          @input=${(e: Event) => {
            state.txnDescription = (e.target as HTMLInputElement).value;
            notify();
          }}
        />
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            Object.assign(state, {
              txnType: 'contribution' as const,
              txnAmount: 5000000,
              txnDate: '2025-01-15',
              txnDescription: 'Đóng góp quỹ họ tộc',
              txnPersonName: 'Nguyễn Văn A',
              txnEventName: '',
              txnCurrency: 'VND',
            });
            notify();
          }}
        >
          Reset Contribution
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 os-dark:bg-gray-700 os-dark:hover:bg-gray-600 text-gray-700 os-dark:text-gray-200 transition-colors"
          @click=${() => {
            Object.assign(state, {
              txnType: 'expense' as const,
              txnAmount: 25000000,
              txnDate: '2025-02-15',
              txnDescription: 'Chi phí lễ giỗ tổ',
              txnPersonName: 'Nguyễn Văn Phúc',
              txnEventName: 'Lễ giỗ tổ 2025',
              txnCurrency: 'VND',
            });
            notify();
          }}
        >
          Load Expense with Event
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 os-dark:bg-blue-900 os-dark:hover:bg-blue-800 text-blue-700 os-dark:text-blue-300 transition-colors"
          @click=${() => {
            Object.assign(state, {
              txnType: 'contribution' as const,
              txnAmount: 500,
              txnDate: '2025-06-01',
              txnDescription: 'Family fund contribution',
              txnPersonName: 'John Smith',
              txnEventName: '',
              txnCurrency: 'USD',
            });
            notify();
          }}
        >
          Load USD Example
        </button>
      </div>
    </section>
  `;
}
