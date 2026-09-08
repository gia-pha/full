import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/fund-summary.js';
import type { FundSummary } from '../../src/components/fund-summary.js';
import type { Locale } from '../../src/i18n/context.js';
import { formatCurrency } from '../../src/utils/format.js';
import { mountWithLocale } from '../utils/i18n.js';

async function renderComponent(opts?: {
  balance?: number;
  totalContributions?: number;
  totalExpenses?: number;
  currency?: string;
  locale?: Locale;
}): Promise<FundSummary> {
  const el = document.createElement('app-fund-summary');
  if (opts?.balance !== undefined) el.balance = opts.balance;
  if (opts?.totalContributions !== undefined)
    el.totalContributions = opts.totalContributions;
  if (opts?.totalExpenses !== undefined) el.totalExpenses = opts.totalExpenses;
  if (opts?.currency !== undefined) el.currency = opts.currency;
  mountWithLocale(el, opts?.locale);
  await el.updateComplete;
  return el;
}

function getCard(
  el: FundSummary,
  kind: 'balance' | 'contributions' | 'expenses',
): HTMLElement {
  return el.querySelector(`.fund-summary-card--${kind}`)!;
}

function getLabel(card: HTMLElement): string {
  return card.querySelector('.fund-summary-label')!.textContent!.trim();
}

function getValue(card: HTMLElement): string {
  return card.querySelector('.fund-summary-value')!.textContent!.trim();
}

afterEach(() => {
  document.querySelectorAll('app-fund-summary').forEach((el) => {
    el.remove();
  });
});

describe('FundSummary', () => {
  it('renders three cards: balance, contributions, expenses', async () => {
    const el = await renderComponent({
      balance: 2_250_000,
      totalContributions: 3_000_000,
      totalExpenses: 750_000,
    });
    expect(el.querySelectorAll('.fund-summary-card')).toHaveLength(3);
    expect(getCard(el, 'balance')).not.toBeNull();
    expect(getCard(el, 'contributions')).not.toBeNull();
    expect(getCard(el, 'expenses')).not.toBeNull();
  });

  it('formats and renders the given values', async () => {
    const el = await renderComponent({
      balance: 2_250_000,
      totalContributions: 3_000_000,
      totalExpenses: 750_000,
    });
    expect(getValue(getCard(el, 'balance'))).toBe(formatCurrency(2_250_000));
    expect(getValue(getCard(el, 'contributions'))).toBe(
      formatCurrency(3_000_000),
    );
    expect(getValue(getCard(el, 'expenses'))).toBe(formatCurrency(750_000));
  });

  it('supports a negative balance', async () => {
    const el = await renderComponent({ balance: -1_000 });
    expect(getValue(getCard(el, 'balance'))).toBe(formatCurrency(-1_000));
  });

  it('shows zero values by default', async () => {
    const el = await renderComponent();
    expect(getValue(getCard(el, 'balance'))).toBe(formatCurrency(0));
    expect(getValue(getCard(el, 'contributions'))).toBe(formatCurrency(0));
    expect(getValue(getCard(el, 'expenses'))).toBe(formatCurrency(0));
  });

  it('uses the given currency', async () => {
    const el = await renderComponent({
      totalContributions: 100,
      currency: 'USD',
    });
    expect(getValue(getCard(el, 'contributions'))).toBe(
      formatCurrency(100, 'USD'),
    );
  });

  it('uses the default Vietnamese labels', async () => {
    const el = await renderComponent();
    expect(getLabel(getCard(el, 'balance'))).toBe('Số dư quỹ');
    expect(getLabel(getCard(el, 'contributions'))).toBe('Tổng đóng góp');
    expect(getLabel(getCard(el, 'expenses'))).toBe('Tổng chi tiêu');
  });

  it('uses English labels when locale is en', async () => {
    const el = await renderComponent({ locale: 'en' });
    expect(getLabel(getCard(el, 'balance'))).toBe('Balance');
    expect(getLabel(getCard(el, 'contributions'))).toBe('Total contributions');
    expect(getLabel(getCard(el, 'expenses'))).toBe('Total expenses');
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ balance: 1 });
    expect(el.shadowRoot).toBeNull();
  });
});
