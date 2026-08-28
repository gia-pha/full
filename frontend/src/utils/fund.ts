import type { Event, Person } from '../types/index.js';

export type FundSortKey = 'date' | 'description' | 'person' | 'amount';
export type FundSortDir = 'asc' | 'desc';

export function getPersonName(
  persons: Person[] | undefined,
  personId?: string,
): string {
  if (!personId) return '';
  const p = (persons ?? []).find((p) => p.id === personId);
  return p ? `${p.data.firstName} ${p.data.lastName}`.trim() : '';
}

export function getEventTitle(
  events: Event[] | undefined,
  eventId?: string,
): string {
  if (!eventId) return '';
  return (events ?? []).find((e) => e.id === eventId)?.title ?? '';
}
