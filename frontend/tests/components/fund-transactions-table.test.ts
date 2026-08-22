import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/fund-transactions-table.js';
import type { AppEmptyState } from '../../src/components/empty-state.js';
import type { FundTransactionsTable } from '../../src/components/fund-transactions-table.js';
import type { Event, Person, Transaction } from '../../src/types/index.js';
import { formatCurrency } from '../../src/utils/format.js';

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
  persons?: Person[];
  events?: Event[];
  title?: string;
  dateLabel?: string;
  descriptionLabel?: string;
  personLabel?: string;
  amountLabel?: string;
  currency?: string;
  emptyMessage?: string;
  sortNewestFirst?: boolean;
}): Promise<FundTransactionsTable> {
  const el = document.createElement('app-fund-transactions-table');
  if (opts?.transactions !== undefined) el.transactions = opts.transactions;
  if (opts?.persons !== undefined) el.persons = opts.persons;
  if (opts?.events !== undefined) el.events = opts.events;
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.dateLabel !== undefined) el.dateLabel = opts.dateLabel;
  if (opts?.descriptionLabel !== undefined)
    el.descriptionLabel = opts.descriptionLabel;
  if (opts?.personLabel !== undefined) el.personLabel = opts.personLabel;
  if (opts?.amountLabel !== undefined) el.amountLabel = opts.amountLabel;
  if (opts?.currency !== undefined) el.currency = opts.currency;
  if (opts?.emptyMessage !== undefined) el.emptyMessage = opts.emptyMessage;
  if (opts?.sortNewestFirst !== undefined)
    el.sortNewestFirst = opts.sortNewestFirst;
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

afterEach(() => {
  document.querySelectorAll('app-fund-transactions-table').forEach((el) => {
    el.remove();
  });
});

describe('FundTransactionsTable', () => {
  it('renders one row per transaction', async () => {
    const el = await renderComponent({
      transactions: [tx({ id: 'a' }), tx({ id: 'b' }), tx({ id: 'c' })],
    });
    expect(getRows(el)).toHaveLength(3);
  });

  it('sorts newest first by default', async () => {
    const el = await renderComponent({
      transactions: [
        tx({ id: 'a', date: '2025-01-01' }),
        tx({ id: 'b', date: '2025-03-01' }),
        tx({ id: 'c', date: '2025-02-01' }),
      ],
    });
    const rows = getRows(el);
    expect(rows[0].textContent).toContain('01/03/2025');
    expect(rows[1].textContent).toContain('01/02/2025');
    expect(rows[2].textContent).toContain('01/01/2025');
  });

  it('sorts oldest first when sortNewestFirst is false', async () => {
    const el = await renderComponent({
      transactions: [
        tx({ id: 'a', date: '2025-03-01' }),
        tx({ id: 'b', date: '2025-01-01' }),
      ],
      sortNewestFirst: false,
    });
    const rows = getRows(el);
    expect(rows[0].textContent).toContain('01/01/2025');
    expect(rows[1].textContent).toContain('01/03/2025');
  });

  it('does not mutate the input transactions array', async () => {
    const transactions = [
      tx({ id: 'a', date: '2025-01-01' }),
      tx({ id: 'b', date: '2025-03-01' }),
    ];
    const el = await renderComponent({ transactions });
    await el.updateComplete;
    expect(transactions.map((t) => t.id)).toEqual(['a', 'b']);
  });

  it('renders header labels with defaults', async () => {
    const el = await renderComponent({ transactions: [tx()] });
    const headers = [...el.querySelectorAll('thead th')].map((th) =>
      th.textContent!.trim(),
    );
    expect(headers).toEqual(['Date', 'Description', 'Person', 'Amount']);
  });

  it('renders custom header labels', async () => {
    const el = await renderComponent({
      transactions: [tx()],
      dateLabel: 'Ngày',
      descriptionLabel: 'Mô tả',
      personLabel: 'Người',
      amountLabel: 'Số tiền',
    });
    const headers = [...el.querySelectorAll('thead th')].map((th) =>
      th.textContent!.trim(),
    );
    expect(headers).toEqual(['Ngày', 'Mô tả', 'Người', 'Số tiền']);
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

  describe('contribution rows', () => {
    it('shows upward arrow badge with emerald colors', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'contribution' })],
      });
      const badge = getRows(el)[0].querySelector('.fund-transactions-badge')!;
      expect(badge.textContent).toBe('↗');
      expect(badge.className).toContain('bg-emerald-100');
      expect(badge.className).toContain('text-emerald-700');
    });

    it('shows positive amount with green color', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'contribution', amount: 5_000_000 })],
      });
      const row = getRows(el)[0];
      expect(rowAmount(row)).toBe(`+${formatCurrency(5_000_000)}`);
      expect(
        row.querySelector('.fund-transactions-amount')!.className,
      ).toContain('text-emerald-600');
    });
  });

  describe('expense rows', () => {
    it('shows downward arrow badge with red colors', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'expense' })],
      });
      const badge = getRows(el)[0].querySelector('.fund-transactions-badge')!;
      expect(badge.textContent).toBe('↘');
      expect(badge.className).toContain('bg-red-100');
      expect(badge.className).toContain('text-red-700');
    });

    it('shows negative amount with red color', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'expense', amount: 2_500_000 })],
      });
      const row = getRows(el)[0];
      expect(rowAmount(row)).toBe(`-${formatCurrency(2_500_000)}`);
      expect(
        row.querySelector('.fund-transactions-amount')!.className,
      ).toContain('text-red-600');
    });
  });

  describe('person column', () => {
    it('resolves the person name from personId', async () => {
      const el = await renderComponent({
        transactions: [tx({ personId: 'p-2' })],
        persons: PERSONS,
      });
      expect(rowPerson(getRows(el)[0])).toBe('Trần Thị B');
    });

    it('shows a dash when the person is not found', async () => {
      const el = await renderComponent({
        transactions: [tx({ personId: 'unknown' })],
        persons: PERSONS,
      });
      expect(rowPerson(getRows(el)[0])).toBe('-');
    });

    it('shows a dash when personId is not set', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        persons: PERSONS,
      });
      expect(rowPerson(getRows(el)[0])).toBe('-');
    });

    it('hides the person column cells on mobile', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      const cells = getRows(el)[0].querySelectorAll('td:nth-child(3)');
      for (const cell of cells) {
        expect(cell.className).toContain('hidden sm:table-cell');
      }
    });
  });

  describe('event annotation', () => {
    it('shows the event title in parentheses when both eventId and events are provided', async () => {
      const el = await renderComponent({
        transactions: [tx({ eventId: 'e-1' })],
        events: EVENTS,
      });
      expect(rowDescription(getRows(el)[0])).toContain('(Lễ giỗ tổ 2025)');
    });

    it('does not show the event title when eventId is set but events is empty', async () => {
      const el = await renderComponent({
        transactions: [tx({ eventId: 'e-1' })],
        events: [],
      });
      expect(rowDescription(getRows(el)[0])).not.toContain('(');
    });

    it('does not show the event title when eventId is not set', async () => {
      const el = await renderComponent({
        transactions: [tx()],
        events: EVENTS,
      });
      expect(rowDescription(getRows(el)[0])).not.toContain('Lễ giỗ tổ 2025');
    });
  });

  describe('currency', () => {
    it('uses VND currency by default', async () => {
      const el = await renderComponent({
        transactions: [tx({ amount: 1_000_000 })],
      });
      expect(rowAmount(getRows(el)[0])).toContain('₫');
    });

    it('uses a custom currency when provided', async () => {
      const el = await renderComponent({
        transactions: [tx({ amount: 100 })],
        currency: 'USD',
      });
      expect(rowAmount(getRows(el)[0])).toBe(`+${formatCurrency(100, 'USD')}`);
    });
  });

  describe('empty state', () => {
    it('shows the empty message when there are no transactions', async () => {
      const el = await renderComponent({ transactions: [] });
      const empty = el.querySelector('app-empty-state') as AppEmptyState;
      expect(empty).not.toBeNull();
      await empty.updateComplete;
      expect(empty.message).toBe('No data');
      expect(el.querySelectorAll('tbody tr')).toHaveLength(0);
      expect(el.querySelector('table')).toBeNull();
    });

    it('supports a custom empty message', async () => {
      const el = await renderComponent({
        transactions: [],
        emptyMessage: 'Chưa có giao dịch',
      });
      const empty = el.querySelector('app-empty-state') as AppEmptyState;
      expect(empty).not.toBeNull();
      await empty.updateComplete;
      expect(empty.message).toBe('Chưa có giao dịch');
    });

    it('still renders the title with an empty table', async () => {
      const el = await renderComponent({
        transactions: [],
        title: 'Giao dịch',
      });
      expect(el.querySelector('.fund-transactions-title')!.textContent).toBe(
        'Giao dịch',
      );
    });
  });

  describe('styling', () => {
    it('has hover and transition classes on rows', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      const row = getRows(el)[0];
      expect(row.className).toContain('hover:bg-gray-50');
      expect(row.className).toContain('transition-colors');
    });

    it('has dark mode classes', async () => {
      const el = await renderComponent({
        transactions: [tx({ type: 'contribution' }), tx({ type: 'expense' })],
      });
      const rendered = el.innerHTML;
      expect(rendered).toContain('dark:bg-emerald-900');
      expect(rendered).toContain('dark:text-red-300');
      expect(rendered).toContain('dark:bg-gray-800');
    });

    it('renders the table inside a rounded card', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      expect(el.querySelector('.fund-transactions-card')).not.toBeNull();
      expect(el.querySelector('.fund-transactions-card')!.className).toContain(
        'rounded-2xl',
      );
    });
  });

  describe('edge cases', () => {
    it('handles zero amount', async () => {
      const el = await renderComponent({ transactions: [tx({ amount: 0 })] });
      expect(rowAmount(getRows(el)[0])).toBe(`+${formatCurrency(0)}`);
    });

    it('handles large amounts', async () => {
      const el = await renderComponent({
        transactions: [tx({ amount: 1_000_000_000 })],
      });
      expect(rowAmount(getRows(el)[0])).toBe(
        `+${formatCurrency(1_000_000_000)}`,
      );
    });

    it('places transactions with invalid dates last when sorting newest first', async () => {
      const el = await renderComponent({
        transactions: [
          tx({ id: 'a', date: '2025-03-01' }),
          tx({ id: 'b', date: 'not-a-date' }),
        ],
      });
      const dates = getRows(el).map((row) =>
        row.querySelector('td')!.textContent!.trim(),
      );
      expect(dates[0]).toBe('01/03/2025');
      expect(dates[1]).toBe('-');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ transactions: [tx()] });
      expect(el.shadowRoot).toBeNull();
    });
  });
});
