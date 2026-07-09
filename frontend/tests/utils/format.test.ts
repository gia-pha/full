import { describe, expect, it } from 'vitest';
import type { Person } from '../../src/types/index.js';
import {
  getFullName,
  getGenderSymbol,
  getInitials,
  isDeceased,
} from '../../src/utils/format.js';

const makePerson = (overrides?: Partial<typeof mockPerson.data>): Person => ({
  id: 'test-1',
  data: { ...mockPerson.data, ...overrides },
  rels: { parents: [], spouses: [], children: [] },
});

const mockPerson: Person = {
  id: 'test-1',
  data: { firstName: 'Văn', lastName: 'Nguyễn', gender: 'M', generation: 1 },
  rels: { parents: [], spouses: [], children: [] },
};

describe('getFullName', () => {
  it('returns first and last name joined with space', () => {
    expect(getFullName(mockPerson)).toBe('Văn Nguyễn');
  });

  it('trims when only one name is present', () => {
    const p = makePerson({ firstName: '', lastName: 'Nguyễn' });
    expect(getFullName(p)).toBe('Nguyễn');
  });

  it('returns empty string when both names are empty', () => {
    const p = makePerson({ firstName: '', lastName: '' });
    expect(getFullName(p)).toBe('');
  });
});

describe('isDeceased', () => {
  it('returns true when deathYear is set', () => {
    const p = makePerson({ deathYear: '2020' });
    expect(isDeceased(p)).toBe(true);
  });

  it('returns false when deathYear is undefined', () => {
    expect(isDeceased(mockPerson)).toBe(false);
  });

  it('returns false when deathYear is empty string', () => {
    const p = makePerson({ deathYear: '' });
    expect(isDeceased(p)).toBe(false);
  });
});

describe('getInitials', () => {
  it('returns first char of last name', () => {
    expect(getInitials(mockPerson)).toBe('N');
  });

  it('falls back to first name when last name is empty', () => {
    const p = makePerson({ lastName: '', firstName: 'Văn' });
    expect(getInitials(p)).toBe('V');
  });

  it('returns "?" when both names are empty', () => {
    const p = makePerson({ lastName: '', firstName: '' });
    expect(getInitials(p)).toBe('?');
  });
});

describe('getGenderSymbol', () => {
  it('returns male symbol for gender M', () => {
    expect(getGenderSymbol(mockPerson)).toBe('♂');
  });

  it('returns female symbol for gender F', () => {
    const p = makePerson({ gender: 'F' });
    expect(getGenderSymbol(p)).toBe('♀');
  });
});
