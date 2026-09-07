import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/fund-transactions-table.js';
import type { AppEmptyState } from '../../src/components/empty-state.js';
import type { FundTransactionsTable } from '../../src/components/fund-transactions-table.js';
import type { Event, Person, Transaction } from '../../src/types/index.js';
import { formatCurrency } from '../../src/utils/format.js';
import type { FundSortDir, FundSortKey } from '../../src/utils/fund.js';

function tx(overrides?: Partial<Transaction>): Transaction {
  return {
    id: 'tx-1',
    date: '2025-01-15T12:00:00',
    type: 'contribution',
    amount: 1_000_000,
    description: 'Đóng góp quỹ họ tộc',
    ...overrides,
  };
}

function person(id: string, first: string, last: string): Person {
  return {
    id,
    data: { firstName: first, lastName: last, gender: 'M', generation: 5 },
    rels: { parents: [], spouses: [], children: [] },
  };
}

function event(id: string, title: string): Event {
  return {
    id,
    title,
    date: '2025-02-01',
    location: 'Hà Nội',
    description: '',
    status: 'past',
  };
}

const PERSONS = [
  person('p-1', 'Nguyễn', 'Văn A'),
  person('p-2', 'Trần', 'Thị B'),
];
const EVENTS = [event('e-1', 'Lễ giỗ tổ 2025')];

async function renderComponent(opts?: {
  transactions?: Transaction[];
  totalCount?: number;
  persons?: Person[];
  events?: Event[];
  query?: string;
  title?: string;
  currency?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  page?: number;
  pageSize?: number;
  sortKey?: FundSortKey;
  sortDir?: FundSortDir;
  locale?: string;
}): Promise<FundTransactionsTable> {
  const el = document.createElement('app-fund-transactions-table');
  el.locale = 'en';
  if (opts?.locale !== undefined) el.locale = opts.locale;
  if (opts?.transactions !== undefined) el.transactions = opts.transactions;
  if (opts?.totalCount !== undefined) el.totalCount = opts.totalCount;
  if (opts?.persons !== undefined) el.persons = opts.persons;
  if (opts?.events !== undefined) el.events = opts.events;
  if (opts?.query !== undefined) el.query = opts.query;
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.currency !== undefined) el.currency = opts.currency;
  if (opts?.emptyMessage !== undefined) el.emptyMessage = opts.emptyMessage;
  if (opts?.noResultsMessage !== undefined)
    el.noResultsMessage = opts.noResultsMessage;
  if (opts?.page !== undefined) el.page = opts.page;
  if (opts?.pageSize !== undefined) el.pageSize = opts.pageSize;
  if (opts?.sortKey !== undefined) el.sortKey = opts.sortKey;
  if (opts?.sortDir !== undefined) el.sortDir = opts.sortDir;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getRows(el: FundTransactionsTable): HTMLElement[] {
  return [...el.querySelectorAll('tbody tr')] as HTMLElement[];
}

function rowAmount(row: HTMLElement): string {
  return row.querySelector('.fund-transactions-amount')!.textContent!.trim();
}

function rowDescription(row: HTMLElement): string {
  return row
    .querySelector('td:nth-child(2)')!
    .textContent!.replace(/\s+/g, ' ')
    .trim();
}

function rowPerson(row: HTMLElement): string {
  return row.querySelector('td:nth-child(3)')!.textContent!.trim();
}

function getSearchInput(el: FundTransactionsTable): HTMLInputElement {
  return el.querySelector('.fund-transactions-search')! as HTMLInputElement;
}

function typeSearch(el: FundTransactionsTable, value: string): void {
  const input = getSearchInput(el);
  input.value = value;
  input.dispatchEvent(new globalThis.Event('input', { bubbles: true }));
}

function getSortButton(
  el: FundTransactionsTable,
  key: FundSortKey,
): HTMLButtonElement {
  return el.querySelector(
    `.fund-transactions-sort--${key}`,
  )! as HTMLButtonElement;
}

function sortIndicator(el: FundTransactionsTable, key: FundSortKey): string {
  return getSortButton(el, key).querySelector('span')!.textContent!.trim();
}

function capture<T>(el: FundTransactionsTable, name: string): T[] {
  const events: T[] = [];
  el.addEventListener(name, (e) => events.push(e as unknown as T));
  return events;
}

function pageInfo(el: FundTransactionsTable): string {
  return el
    .querySelector('.fund-transactions-page-info')!
    .textContent!.replace(/\s+/g, ' ')
    .trim();
}

function countLabel(el: FundTransactionsTable): string {
  return el
    .querySelector('.fund-transactions-count')!
    .textContent!.replace(/\s+/g, ' ')
    .trim();
}

afterEach(() => {
  document.querySelectorAll('app-fund-transactions-table').forEach((el) => {
    el.remove();
  });
});

describe('FundTransactionsTable', () => {
  describe('controlled rendering', () => {
    it('renders the given rows in the given order (no internal sorting)', async () => {
      const el = await renderComponent({
        transactions: [
          tx({ id: 'a', date: '2025-01-01' }),
          tx({ id: 'b', date: '2025-03-01' }),
          tx({ id: 'c', date: '2025-02-01' }),
        ],
        totalCount: 3,
      });
      const dates = getRows(el).map((row) =>
        row.querySelector('td')!.textContent!.trim(),
      );
      expect(dates).toEqual(['01/01/2025', '01/03/2025', '01/02/2025']);
    });

    it('renders every given row (no internal paging)', async () => {
      const transactions = Array.from({ length: 15 }, (_, i) =>
        tx({ id: `t${i}`, description: `Giao dịch ${i}` }),
      );
      const el = await renderComponent({
        transactions,
        totalCount: 15,
        pageSize: 10,
      });
      expect(getRows(el)).toHaveLength(15);
      // footer visibility is driven by totalCount, not by the rendered rows
      expect(countLabel(el)).toBe('Showing 1–10 of 15');
    });

    it('renders header labels on all four columns', async () => {
      const el = await renderComponent({
        transactions: [tx()],
      });
      const ths = [...el.querySelectorAll('thead th')];
      expect(ths).toHaveLength(4);
      expect(ths[0].textContent).toContain('Date');
      expect(ths[1].textContent).toContain('Description');
      expect(ths[2].textContent).toContain('Person');
      expect(ths[3].textContent).toContain('Amount');
    });

    it('renders translated header labels when locale is vi', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        locale: 'vi',
      });
      const ths = [...el.querySelectorAll('thead th')];
      expect(ths[0].textContent).toContain('Ngày');
      expect(ths[1].textContent).toContain('Mô tả');
      expect(ths[2].textContent).toContain('Người');
      expect(ths[3].textContent).toContain('Số tiền');
    });

    it('renders the title only when set', async () => {
      const noTitle = await renderComponent({ transactions: [tx()] });
      expect(noTitle.querySelector('.fund-transactions-title')).toBeNull();

      const withTitle = await renderComponent({
        transactions: [tx()],
        title: 'Giao dịch',
      });
      expect(
        withTitle.querySelector('.fund-transactions-title')!.textContent,
      ).toBe('Giao dịch');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('row display', () => {
    it('shows contribution badge and positive green amount', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'contribution', amount: 5_000_000 })],
      });
      const row = getRows(el)[0];
      const badge = row.querySelector('.fund-transactions-badge')!;
      expect(badge.textContent).toBe('↗');
      expect(badge.className).toContain('bg-emerald-100');
      expect(rowAmount(row)).toBe(`+${formatCurrency(5_000_000)}`);
      expect(
        row.querySelector('.fund-transactions-amount')!.className,
      ).toContain('text-emerald-600');
    });

    it('shows expense badge and negative red amount', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'expense', amount: 2_500_000 })],
      });
      const row = getRows(el)[0];
      const badge = row.querySelector('.fund-transactions-badge')!;
      expect(badge.textContent).toBe('↘');
      expect(badge.className).toContain('bg-red-100');
      expect(rowAmount(row)).toBe(`-${formatCurrency(2_500_000)}`);
      expect(
        row.querySelector('.fund-transactions-amount')!.className,
      ).toContain('text-red-600');
    });

    it('resolves the person name from personId', async () => {
      const el = await renderComponent({
        transactions: [tx({ personId: 'p-2' })],
        persons: PERSONS,
      });
      expect(rowPerson(getRows(el)[0])).toBe('Trần Thị B');
    });

    it('shows a dash when the person is not found or not set', async () => {
      const el = await renderComponent({
        transactions: [tx({ personId: 'unknown' }), tx()],
        persons: PERSONS,
      });
      expect(rowPerson(getRows(el)[0])).toBe('-');
      expect(rowPerson(getRows(el)[1])).toBe('-');
    });

    it('shows the event title in parentheses when resolvable', async () => {
      const el = await renderComponent({
        transactions: [tx({ eventId: 'e-1' })],
        events: EVENTS,
      });
      expect(rowDescription(getRows(el)[0])).toContain('(Lễ giỗ tổ 2025)');
    });

    it('does not show the event title when eventId is unset or unresolvable', async () => {
      const el = await renderComponent({
        transactions: [tx({ eventId: 'missing' }), tx()],
        events: EVENTS,
      });
      expect(rowDescription(getRows(el)[0])).not.toContain('(');
      expect(rowDescription(getRows(el)[1])).not.toContain('(');
    });

    it('formats amounts with the given currency', async () => {
      const el = await renderComponent({
        transactions: [tx({ amount: 100 })],
        currency: 'USD',
      });
      expect(rowAmount(getRows(el)[0])).toBe(`+${formatCurrency(100, 'USD')}`);
    });

    it('handles zero and large amounts', async () => {
      const el = await renderComponent({
        transactions: [tx({ amount: 0 }), tx({ amount: 1_000_000_000 })],
      });
      expect(rowAmount(getRows(el)[0])).toBe(`+${formatCurrency(0)}`);
      expect(rowAmount(getRows(el)[1])).toBe(
        `+${formatCurrency(1_000_000_000)}`,
      );
    });

    it('has hover, border and dark mode classes', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'contribution' }), tx({ type: 'expense' })],
      });
      const rendered = el.innerHTML;
      expect(rendered).toContain('hover:bg-gray-50');
      expect(rendered).toContain('transition-colors');
      expect(rendered).toContain('dark:bg-emerald-900');
      expect(rendered).toContain('dark:text-red-300');
    });

    it('hides the person column on mobile', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      const th = el.querySelectorAll('thead th')[2];
      expect(th.className).toContain('hidden sm:table-cell');
      expect(
        getRows(el)[0].querySelector('td:nth-child(3)')!.className,
      ).toContain('hidden sm:table-cell');
    });
  });

  describe('sort headers', () => {
    it('renders a sortable button on all four columns', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      for (const key of ['date', 'description', 'person', 'amount'] as const) {
        expect(getSortButton(el, key)).not.toBeNull();
      }
    });

    it('shows the active indicator on the sorted column only', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        sortKey: 'amount',
        sortDir: 'asc',
      });
      expect(sortIndicator(el, 'amount')).toBe('▲');
      expect(sortIndicator(el, 'date')).toBe('↕');
      expect(sortIndicator(el, 'description')).toBe('↕');
      expect(sortIndicator(el, 'person')).toBe('↕');
    });

    it('shows the descending indicator when sortDir is desc', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        sortKey: 'date',
        sortDir: 'desc',
      });
      expect(sortIndicator(el, 'date')).toBe('▼');
    });

    it('clicking an inactive column requests that column sorted desc', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        sortKey: 'date',
        sortDir: 'desc',
      });
      const events = capture<CustomEvent<FundSortDetail>>(
        el,
        'fund-sort-change',
      );
      getSortButton(el, 'person').click();
      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({ sortKey: 'person', sortDir: 'desc' });
    });

    it('clicking the active column requests the opposite direction', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        sortKey: 'amount',
        sortDir: 'desc',
      });
      const events = capture<CustomEvent<FundSortDetail>>(
        el,
        'fund-sort-change',
      );
      getSortButton(el, 'amount').click();
      expect(events[0].detail).toEqual({ sortKey: 'amount', sortDir: 'asc' });

      // the parent updates the props; a further click toggles again
      el.sortDir = 'asc';
      await el.updateComplete;
      getSortButton(el, 'amount').click();
      expect(events[1].detail).toEqual({ sortKey: 'amount', sortDir: 'desc' });
    });
  });

  describe('search', () => {
    it('renders the search input with the query value and placeholder', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        query: 'nhà thờ',
      });
      const input = getSearchInput(el);
      expect(input.value).toBe('nhà thờ');
      expect(input.placeholder).toBe('Search…');
    });

    it('dispatches fund-search-change with the typed value', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      const events = capture<CustomEvent<SearchDetail>>(
        el,
        'fund-search-change',
      );
      typeSearch(el, 'đóng góp');
      expect(events).toHaveLength(1);
      expect(events[0].detail).toEqual({ query: 'đóng góp' });
    });

    it('dispatches fund-search-change when cleared', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        query: 'abc',
      });
      const events = capture<CustomEvent<SearchDetail>>(
        el,
        'fund-search-change',
      );
      typeSearch(el, '');
      expect(events[0].detail).toEqual({ query: '' });
    });
  });

  describe('pagination footer', () => {
    it('is hidden when totalCount fits on one page', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        totalCount: 5,
        pageSize: 10,
      });
      expect(el.querySelector('.fund-transactions-footer')).toBeNull();
    });

    it('shows the count and page info labels', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        totalCount: 25,
        page: 2,
        pageSize: 10,
      });
      expect(countLabel(el)).toBe('Showing 11–20 of 25');
      expect(pageInfo(el)).toBe('Page 2 of 3');
    });

    it('supports Vietnamese footer labels when locale is vi', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        totalCount: 25,
        page: 2,
        pageSize: 10,
        locale: 'vi',
      });
      expect(countLabel(el)).toBe('Hiển thị 11–20 trên 25');
      expect(pageInfo(el)).toBe('Trang 2 trên 3');
    });

    it('dispatches fund-page-change for next and prev', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        totalCount: 25,
        page: 2,
        pageSize: 10,
      });
      const events = capture<CustomEvent<PageDetail>>(el, 'fund-page-change');
      (
        el.querySelector('.fund-transactions-next') as HTMLButtonElement
      ).click();
      expect(events[0].detail).toEqual({ page: 3 });
      (
        el.querySelector('.fund-transactions-prev') as HTMLButtonElement
      ).click();
      expect(events[1].detail).toEqual({ page: 1 });
    });

    it('disables prev on the first page and next on the last page', async () => {
      const first = await renderComponent({
        transactions: [tx()],
        totalCount: 25,
        page: 1,
        pageSize: 10,
      });
      expect(
        (first.querySelector('.fund-transactions-prev') as HTMLButtonElement)
          .disabled,
      ).toBe(true);
      expect(
        (first.querySelector('.fund-transactions-next') as HTMLButtonElement)
          .disabled,
      ).toBe(false);

      const last = await renderComponent({
        transactions: [tx()],
        totalCount: 25,
        page: 3,
        pageSize: 10,
      });
      expect(
        (last.querySelector('.fund-transactions-prev') as HTMLButtonElement)
          .disabled,
      ).toBe(false);
      expect(
        (last.querySelector('.fund-transactions-next') as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });

    it('clamps the displayed page when it exceeds the page count', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        totalCount: 25,
        page: 99,
        pageSize: 10,
      });
      expect(pageInfo(el)).toBe('Page 3 of 3');
      expect(
        (el.querySelector('.fund-transactions-next') as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
  });

  describe('empty state', () => {
    it('shows the empty message when there are no rows and no query', async () => {
      const el = await renderComponent({
        transactions: [],
        emptyMessage: 'Chưa có giao dịch',
      });
      const empty = el.querySelector('app-empty-state') as AppEmptyState;
      expect(empty).not.toBeNull();
      await empty.updateComplete;
      expect(empty.message).toBe('Chưa có giao dịch');
      expect(empty.icon).toBe('📄');
      expect(el.querySelector('table')).toBeNull();
      expect(el.querySelector('.fund-transactions-toolbar')).toBeNull();
    });

    it('shows the no-results message when there are no rows but a query is set', async () => {
      const el = await renderComponent({
        transactions: [],
        query: 'không có',
        noResultsMessage: 'Không tìm thấy giao dịch',
      });
      const empty = el.querySelector('app-empty-state') as AppEmptyState;
      expect(empty).not.toBeNull();
      await empty.updateComplete;
      expect(empty.message).toBe('Không tìm thấy giao dịch');
      expect(empty.icon).toBe('🔍');
    });

    it('falls back to translated messages when no override is given', async () => {
      const empty = await renderComponent({ transactions: [], locale: 'vi' });
      const emptyState = empty.querySelector(
        'app-empty-state',
      ) as AppEmptyState;
      await emptyState.updateComplete;
      expect(emptyState.message).toBe('Chưa có dữ liệu');

      const noResults = await renderComponent({
        transactions: [],
        query: 'zzz',
        locale: 'vi',
      });
      const noResultsState = noResults.querySelector(
        'app-empty-state',
      ) as AppEmptyState;
      await noResultsState.updateComplete;
      expect(noResultsState.message).toBe('Không tìm thấy kết quả');
    });

    it('keeps the search input available when the result is empty so the query can be changed', async () => {
      const el = await renderComponent({
        transactions: [],
        totalCount: 25,
        query: 'không có',
      });
      const input = getSearchInput(el);
      expect(input).not.toBeNull();
      expect(input.value).toBe('không có');

      const events = capture<CustomEvent<SearchDetail>>(
        el,
        'fund-search-change',
      );
      typeSearch(el, 'đóng góp');
      expect(events[0].detail).toEqual({ query: 'đóng góp' });
    });

    it('keeps focus on the search input when results appear and disappear', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        totalCount: 1,
        query: '',
      });
      const input = getSearchInput(el);
      input.focus();
      expect(document.activeElement).toBe(input);

      // typing a query that matches nothing swaps the table for the empty state
      el.query = 'zzz';
      el.transactions = [];
      await el.updateComplete;
      expect(el.querySelector('.fund-transactions-search')).toBe(input);
      expect(document.activeElement).toBe(input);

      // typing a query that matches again swaps back to the table
      el.query = 'a';
      el.transactions = [tx()];
      await el.updateComplete;
      expect(el.querySelector('.fund-transactions-search')).toBe(input);
      expect(document.activeElement).toBe(input);
    });
  });
});

type SearchDetail = { query: string };
type PageDetail = { page: number };
type FundSortDetail = { sortKey: FundSortKey; sortDir: FundSortDir };
