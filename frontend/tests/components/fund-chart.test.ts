import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/fund-chart.js';
import type { FundChart } from '../../src/components/fund-chart.js';
import type { AppEmptyState } from '../../src/components/empty-state.js';
import type { Transaction } from '../../src/types/index.js';
import { formatCurrency } from '../../src/utils/format.js';

function tx(
  id: string,
  date: string,
  type: 'contribution' | 'expense',
  amount: number,
): Transaction {
  return { id, date, type, amount, description: `tx-${id}` };
}

const TXNS: Transaction[] = [
  tx('a', '2025-02-10T12:00:00', 'contribution', 1_000_000),
  tx('b', '2025-01-15T12:00:00', 'contribution', 1_000_000),
  tx('c', '2025-01-20T12:00:00', 'contribution', 1_000_000),
  tx('d', '2025-01-25T12:00:00', 'expense', 500_000),
  tx('e', '2025-02-20T12:00:00', 'expense', 500_000),
  tx('f', '2024-12-05T12:00:00', 'expense', 100_000),
];

async function renderComponent(opts?: {
  transactions?: Transaction[];
  title?: string;
  currency?: string;
  contributionLabel?: string;
  expenseLabel?: string;
  showLegend?: boolean;
  formatLabel?: (key: string) => string;
  emptyMessage?: string;
}): Promise<FundChart> {
  const el = document.createElement('app-fund-chart');
  if (opts?.transactions !== undefined) el.transactions = opts.transactions;
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.currency !== undefined) el.currency = opts.currency;
  if (opts?.contributionLabel !== undefined)
    el.contributionLabel = opts.contributionLabel;
  if (opts?.expenseLabel !== undefined) el.expenseLabel = opts.expenseLabel;
  if (opts?.showLegend !== undefined) el.showLegend = opts.showLegend;
  if (opts?.formatLabel !== undefined) el.formatLabel = opts.formatLabel;
  if (opts?.emptyMessage !== undefined) el.emptyMessage = opts.emptyMessage;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getGroups(el: FundChart): HTMLElement[] {
  return [...el.querySelectorAll('.fund-chart-group')] as HTMLElement[];
}

function getBar(
  group: HTMLElement,
  kind: 'contribution' | 'expense',
): HTMLElement {
  return group.querySelector(`.fund-chart-bar--${kind}`)!;
}

function getTooltips(group: HTMLElement): string[] {
  return [...group.querySelectorAll('.fund-chart-tooltip')].map(
    (t) => t.textContent,
  );
}

function getLabels(el: FundChart): string[] {
  return [...el.querySelectorAll('.fund-chart-label')].map(
    (l) => l.textContent,
  );
}

afterEach(() => {
  document.querySelectorAll('app-fund-chart').forEach((el) => el.remove());
});

describe('FundChart', () => {
  it('shows the empty message when there are no transactions', async () => {
    const el = await renderComponent({ transactions: [] });
    const empty = el.querySelector('app-empty-state') as AppEmptyState;
    expect(empty).not.toBeNull();
    await empty.updateComplete;
    expect(empty.message).toBe('No data');
    expect(el.querySelectorAll('.fund-chart-group')).toHaveLength(0);
  });

  it('supports a custom empty message', async () => {
    const el = await renderComponent({
      transactions: [],
      emptyMessage: 'Chưa có dữ liệu',
    });
    const empty = el.querySelector('app-empty-state') as AppEmptyState;
    expect(empty).not.toBeNull();
    await empty.updateComplete;
    expect(empty.message).toBe('Chưa có dữ liệu');
  });

  it('renders one group per month, sorted ascending', async () => {
    const el = await renderComponent({ transactions: TXNS });
    expect(getGroups(el)).toHaveLength(3);
    expect(getLabels(el)).toEqual(['2024-12', '2025-01', '2025-02']);
  });

  it('sums contributions and expenses per month', async () => {
    const el = await renderComponent({ transactions: TXNS });
    const [dec, jan, feb] = getGroups(el);
    expect(getTooltips(jan)[0]).toBe(formatCurrency(2_000_000));
    expect(getTooltips(jan)[1]).toBe(formatCurrency(500_000));
    expect(getTooltips(feb)[0]).toBe(formatCurrency(1_000_000));
    expect(getTooltips(dec)[0]).toBe(formatCurrency(0));
    expect(getTooltips(dec)[1]).toBe(formatCurrency(100_000));
  });

  it('gives tooltips z-10 so they render above adjacent bars', async () => {
    const el = await renderComponent({ transactions: TXNS });
    const tooltips = el.querySelectorAll('.fund-chart-tooltip');
    expect(tooltips.length).toBeGreaterThan(0);
    for (const t of tooltips) {
      expect(t.classList.contains('z-10')).toBe(true);
    }
  });

  it('scales bar heights against the monthly max (170px)', async () => {
    const el = await renderComponent({ transactions: TXNS });
    const [dec, jan, feb] = getGroups(el);
    expect(getBar(jan, 'contribution').style.height).toBe('170px');
    expect(getBar(feb, 'contribution').style.height).toBe('85px');
    expect(getBar(jan, 'expense').style.height).toBe('42.5px');
    expect(getBar(dec, 'contribution').style.height).toBe('0px');
  });

  it('uses the given currency for tooltips', async () => {
    const el = await renderComponent({
      transactions: [tx('a', '2025-01-15T12:00:00', 'contribution', 100)],
      currency: 'USD',
    });
    expect(getTooltips(getGroups(el)[0])[0]).toBe(formatCurrency(100, 'USD'));
  });

  it('skips transactions with invalid dates', async () => {
    const el = await renderComponent({
      transactions: [
        tx('a', 'not-a-date', 'contribution', 1_000_000),
        tx('b', '2025-03-01T12:00:00', 'expense', 50),
      ],
    });
    expect(getGroups(el)).toHaveLength(1);
    expect(getLabels(el)).toEqual(['2025-03']);
  });

  it('renders the title only when set', async () => {
    const noTitle = await renderComponent({ transactions: TXNS });
    expect(noTitle.querySelector('.fund-chart-title')).toBeNull();

    const withTitle = await renderComponent({
      transactions: TXNS,
      title: 'Biểu đồ theo tháng',
    });
    expect(withTitle.querySelector('.fund-chart-title')!.textContent).toBe(
      'Biểu đồ theo tháng',
    );
  });

  it('renders the legend with default labels', async () => {
    const el = await renderComponent({ transactions: TXNS });
    const legend = el.querySelector('.fund-chart-legend')!;
    expect(legend).not.toBeNull();
    expect(legend.textContent).toContain('Contributions');
    expect(legend.textContent).toContain('Expenses');
  });

  it('supports custom legend labels', async () => {
    const el = await renderComponent({
      transactions: TXNS,
      contributionLabel: 'Đóng góp',
      expenseLabel: 'Chi tiêu',
    });
    const legend = el.querySelector('.fund-chart-legend')!;
    expect(legend.textContent).toContain('Đóng góp');
    expect(legend.textContent).toContain('Chi tiêu');
  });

  it('hides the legend when showLegend is false', async () => {
    const el = await renderComponent({
      transactions: TXNS,
      showLegend: false,
    });
    expect(el.querySelector('.fund-chart-legend')).toBeNull();
  });

  it('applies a custom formatLabel to month keys', async () => {
    const el = await renderComponent({
      transactions: TXNS,
      formatLabel: (key) => key.replaceAll('-', '/'),
    });
    expect(getLabels(el)).toEqual(['2024/12', '2025/01', '2025/02']);
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ transactions: TXNS });
    expect(el.shadowRoot).toBeNull();
  });
});
