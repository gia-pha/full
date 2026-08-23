import { describe, expect, it } from 'vitest';
import type { Event, Person } from '../../src/types/index.js';
import { getEventTitle, getPersonName } from '../../src/utils/fund.js';

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

const PERSONS = [person('p-1', 'Ann', 'Z'), person('p-2', 'Bob', 'A')];
const EVENTS = [event('e-1', 'Lễ giỗ tổ 2025')];

describe('getPersonName', () => {
  it('returns the full name for a known personId', () => {
    expect(getPersonName(PERSONS, 'p-2')).toBe('Bob A');
  });

  it('returns an empty string for unknown or missing personId', () => {
    expect(getPersonName(PERSONS, 'nope')).toBe('');
    expect(getPersonName(PERSONS, undefined)).toBe('');
    expect(getPersonName(undefined, 'p-1')).toBe('');
  });
});

describe('getEventTitle', () => {
  it('returns the title for a known eventId', () => {
    expect(getEventTitle(EVENTS, 'e-1')).toBe('Lễ giỗ tổ 2025');
  });

  it('returns an empty string for unknown or missing eventId', () => {
    expect(getEventTitle(EVENTS, 'nope')).toBe('');
    expect(getEventTitle(EVENTS, undefined)).toBe('');
    expect(getEventTitle(undefined, 'e-1')).toBe('');
  });
});
