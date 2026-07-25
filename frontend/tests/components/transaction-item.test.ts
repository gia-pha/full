import { describe, expect, it } from 'vitest';
import '../../src/components/transaction-item.js';
import type { TransactionItem } from '../../src/components/transaction-item.js';
import type { Transaction } from '../../src/types/index.js';

const makeTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: 'txn-1',
  date: '2025-01-15',
  type: 'contribution',
  amount: 5000000,
  description: 'Test transaction',
  ...overrides,
});

async function renderComponent(
  transaction: Transaction,
  opts?: {
    personName?: string;
    eventName?: string;
    currency?: string;
  },
): Promise<TransactionItem> {
  const el = document.createElement('transaction-item');
  el.transaction = transaction;
  if (opts?.personName) el.personName = opts.personName;
  if (opts?.eventName) el.eventName = opts.eventName;
  if (opts?.currency) el.currency = opts.currency;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getContent(el: TransactionItem): string {
  return el.innerHTML;
}

describe('TransactionItem', () => {
  describe('basic rendering', () => {
    it('renders transaction description', async () => {
      const el = await renderComponent(
        makeTransaction({ description: 'Đóng góp quỹ họ tộc' }),
      );
      expect(getContent(el)).toContain('Đóng góp quỹ họ tộc');
    });

    it('renders formatted date', async () => {
      const el = await renderComponent(makeTransaction({ date: '2025-01-15' }));
      const rendered = getContent(el);
      expect(rendered).toContain('15/01/2025');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent(makeTransaction());
      expect(el.shadowRoot).toBeNull();
    });

    it('renders nothing when transaction is not set', async () => {
      const el = document.createElement('transaction-item');
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.querySelector('.transaction-item')).toBeNull();
    });
  });

  describe('contribution type', () => {
    it('shows upward arrow badge with emerald colors', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'contribution' }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('↗');
      expect(rendered).toContain('bg-emerald-100');
      expect(rendered).toContain('text-emerald-700');
    });

    it('shows positive amount with green color', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'contribution', amount: 10000000 }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('+');
      expect(rendered).toContain('text-emerald-600');
    });

    it('formats VND currency correctly for contribution', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'contribution', amount: 5000000 }),
      );
      expect(el.textContent).toMatch(/\+5\.000\.000\s*₫/);
    });
  });

  describe('expense type', () => {
    it('shows downward arrow badge with red colors', async () => {
      const el = await renderComponent(makeTransaction({ type: 'expense' }));
      const rendered = getContent(el);
      expect(rendered).toContain('↘');
      expect(rendered).toContain('bg-red-100');
      expect(rendered).toContain('text-red-700');
    });

    it('shows negative amount with red color', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'expense', amount: 25000000 }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('-');
      expect(rendered).toContain('text-red-600');
    });

    it('formats VND currency correctly for expense', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'expense', amount: 25000000 }),
      );
      expect(el.textContent).toMatch(/-25\.000\.000\s*₫/);
    });
  });

  describe('person name', () => {
    it('shows person name when provided', async () => {
      const el = await renderComponent(makeTransaction(), {
        personName: 'Nguyễn Văn A',
      });
      const rendered = getContent(el);
      expect(rendered).toContain('Nguyễn Văn A');
    });

    it('shows dash when person name is not provided', async () => {
      const el = await renderComponent(makeTransaction());
      const rendered = getContent(el);
      const cells = rendered.match(/hidden sm:block/g);
      expect(cells).not.toBeNull();
    });
  });

  describe('event name', () => {
    it('shows event name in parentheses when both eventId and eventName are provided', async () => {
      const el = await renderComponent(
        makeTransaction({
          eventId: 'event-001',
          description: 'Chi phí lễ giỗ tổ',
        }),
        { eventName: 'Lễ giỗ tổ 2025' },
      );
      expect(el.textContent).toContain('(Lễ giỗ tổ 2025)');
    });

    it('does not show event name when eventId is set but eventName is empty', async () => {
      const el = await renderComponent(
        makeTransaction({ eventId: 'event-001', description: 'Chi phí' }),
      );
      const rendered = getContent(el);
      expect(rendered).not.toContain('(');
    });

    it('does not show event name when eventId is not set', async () => {
      const el = await renderComponent(
        makeTransaction({ eventId: undefined, description: 'Đóng góp' }),
        { eventName: 'Some Event' },
      );
      const rendered = getContent(el);
      expect(rendered).not.toContain('Some Event');
    });
  });

  describe('currency', () => {
    it('uses VND currency by default', async () => {
      const el = await renderComponent(makeTransaction({ amount: 1000000 }));
      const rendered = getContent(el);
      expect(rendered).toContain('₫');
    });

    it('uses custom currency when provided', async () => {
      const el = await renderComponent(makeTransaction({ amount: 100 }), {
        currency: 'USD',
      });
      const rendered = getContent(el);
      expect(rendered).toContain('$');
    });
  });

  describe('styling', () => {
    it('has grid layout classes', async () => {
      const el = await renderComponent(makeTransaction());
      const rendered = getContent(el);
      expect(rendered).toContain('grid');
      expect(rendered).toContain('grid-cols-2');
    });

    it('has hover and transition classes', async () => {
      const el = await renderComponent(makeTransaction());
      const rendered = getContent(el);
      expect(rendered).toContain('hover:bg-gray-50');
      expect(rendered).toContain('transition-colors');
    });

    it('has border classes', async () => {
      const el = await renderComponent(makeTransaction());
      const rendered = getContent(el);
      expect(rendered).toContain('border-b');
      expect(rendered).toContain('border-gray-100');
    });

    it('has dark mode classes', async () => {
      const el = await renderComponent(makeTransaction());
      const rendered = getContent(el);
      expect(rendered).toContain('dark:');
    });

    it('hides person column on mobile', async () => {
      const el = await renderComponent(makeTransaction());
      const rendered = getContent(el);
      expect(rendered).toContain('hidden sm:block');
    });
  });

  describe('dark mode', () => {
    it('shows dark mode badge colors for contribution', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'contribution' }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('dark:bg-emerald-900');
      expect(rendered).toContain('dark:text-emerald-300');
    });

    it('shows dark mode badge colors for expense', async () => {
      const el = await renderComponent(makeTransaction({ type: 'expense' }));
      const rendered = getContent(el);
      expect(rendered).toContain('dark:bg-red-900');
      expect(rendered).toContain('dark:text-red-300');
    });

    it('shows dark mode amount colors for contribution', async () => {
      const el = await renderComponent(
        makeTransaction({ type: 'contribution' }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('dark:text-emerald-400');
    });

    it('shows dark mode amount colors for expense', async () => {
      const el = await renderComponent(makeTransaction({ type: 'expense' }));
      const rendered = getContent(el);
      expect(rendered).toContain('dark:text-red-400');
    });
  });

  describe('edge cases', () => {
    it('handles zero amount', async () => {
      const el = await renderComponent(makeTransaction({ amount: 0 }));
      const rendered = getContent(el);
      expect(rendered).toContain('0');
    });

    it('handles large amount', async () => {
      const el = await renderComponent(makeTransaction({ amount: 1000000000 }));
      expect(el.textContent).toMatch(/1\.000\.000\.000\s*₫/);
    });

    it('handles long description', async () => {
      const longDesc = 'A'.repeat(100);
      const el = await renderComponent(
        makeTransaction({ description: longDesc }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('truncate');
    });
  });
});
