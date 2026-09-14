import { describe, expect, it } from 'vitest';
import { Gender, type Person } from '../../src/types/index.js';
import { toFamilyChartData } from '../../src/utils/tree.js';

const makePerson = (data: Partial<Person['data']>): Person => ({
  id: 'p1',
  data: {
    firstName: 'A',
    lastName: 'B',
    gender: Gender.Male,
    generation: 1,
    ...data,
  },
  rels: { parents: [], spouses: [], children: [] },
});

const yearsOf = (data: Partial<Person['data']>) =>
  toFamilyChartData([makePerson(data)])[0].data.years;

describe('toFamilyChartData lifespan', () => {
  it('formats birth and death years with a dash', () => {
    expect(yearsOf({ birthYear: '1920', deathYear: '1998' })).toBe(
      '1920 - 1998',
    );
  });

  it('shows only the birth year for living people', () => {
    expect(yearsOf({ birthYear: '1953' })).toBe('1953');
  });

  it('shows only the death year when birth is unknown', () => {
    expect(yearsOf({ deathYear: '1998' })).toBe('1998');
  });

  it('is undefined when no years are known', () => {
    expect(yearsOf({})).toBeUndefined();
  });
});
