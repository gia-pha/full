import type { Event, Person, Transaction } from '../../src/types/index.js';
import type { FundSortDir, FundSortKey } from '../../src/utils/fund.js';
import { getEventTitle, getPersonName } from '../../src/utils/fund.js';

export interface FundTableOptions {
  query?: string;
  sortKey: FundSortKey;
  sortDir: FundSortDir;
  page: number;
  pageSize: number;
  persons?: Person[];
  events?: Event[];
}

export interface FundTablePage {
  items: Transaction[];
  total: number;
  pageCount: number;
}

export const DEFAULT_FUND_PAGE_SIZE = 10;

function matchesQuery(
  tx: Transaction,
  query: string,
  persons?: Person[],
  events?: Event[],
): boolean {
  return (
    tx.description.toLowerCase().includes(query) ||
    getPersonName(persons, tx.personId).toLowerCase().includes(query) ||
    getEventTitle(events, tx.eventId).toLowerCase().includes(query)
  );
}

export function transactionSortValue(
  tx: Transaction,
  key: FundSortKey,
  persons?: Person[],
): string | number {
  switch (key) {
    case 'date': {
      const t = new Date(tx.date).getTime();
      return Number.isNaN(t) ? 0 : t;
    }
    case 'amount':
      return tx.amount;
    case 'description':
      return tx.description;
    case 'person':
      return getPersonName(persons, tx.personId);
  }
}

export function getFundTransactionTable(
  transactions: Transaction[],
  options: FundTableOptions,
): FundTablePage {
  const pageSize =
    Number.isInteger(options.pageSize) && options.pageSize > 0
      ? options.pageSize
      : DEFAULT_FUND_PAGE_SIZE;
  const query = options.query?.trim().toLowerCase() ?? '';

  const filtered = query
    ? transactions.filter((tx) =>
        matchesQuery(tx, query, options.persons, options.events),
      )
    : transactions;

  const dir = options.sortDir === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort((a, b) => {
    const va = transactionSortValue(a, options.sortKey, options.persons);
    const vb = transactionSortValue(b, options.sortKey, options.persons);
    if (typeof va === 'string' && typeof vb === 'string') {
      return dir * va.localeCompare(vb);
    }
    return dir * ((va as number) - (vb as number));
  });

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Math.trunc(options.page) || 1), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: sorted.slice(start, start + pageSize),
    total,
    pageCount,
  };
}
