import { describe, expect, it } from 'vitest';
import {
  dayNamesEn,
  dayNamesVi,
  formatLunarDateEn,
  formatLunarDateVi,
  getDaysInMonth,
  getFirstDayOfMonth,
  getVietnameseYearName,
  lunarMonthNamesVi,
  monthNamesEn,
  monthNamesVi,
  solarToLunar,
} from '../../src/utils/lunar.js';

describe('solarToLunar', () => {
  it('converts Lunar New Year 2025 (2025-01-29) to 1/1/2025', () => {
    expect(solarToLunar(2025, 1, 29)).toEqual({
      year: 2025,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
  });

  it('converts Lunar New Year 2020 (2020-01-25) to 1/1/2020', () => {
    expect(solarToLunar(2020, 1, 25)).toEqual({
      year: 2020,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
  });

  it('converts the day after LNY to day 2', () => {
    expect(solarToLunar(2025, 1, 30)).toEqual({
      year: 2025,
      month: 1,
      day: 2,
      isLeapMonth: false,
    });
  });

  it('does not flag the first month as a leap month in common years', () => {
    // Regression: leapMonth sentinel is 0, so month index 0 must not
    // be mistaken for a leap month in years without one.
    for (const [y, m, d] of [
      [2025, 1, 29],
      [2025, 2, 10],
      [2021, 6, 15],
      [2021, 12, 10],
    ] as const) {
      expect(solarToLunar(y, m, d).isLeapMonth).toBe(false);
    }
  });

  it('keeps month numbers within 1-12', () => {
    for (let m = 1; m <= 12; m++) {
      const lunar = solarToLunar(2025, m, 15);
      expect(lunar.month).toBeGreaterThanOrEqual(1);
      expect(lunar.month).toBeLessThanOrEqual(12);
    }
  });

  it('falls back to 1/1 of the given year before the supported range', () => {
    expect(solarToLunar(1900, 6, 15)).toEqual({
      year: 1900,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
  });

  it('falls back to 1/1 of the given year after the supported range', () => {
    expect(solarToLunar(2100, 6, 15)).toEqual({
      year: 2100,
      month: 1,
      day: 1,
      isLeapMonth: false,
    });
  });
});

describe('getVietnameseYearName', () => {
  it('returns the correct stem-branch pairs', () => {
    expect(getVietnameseYearName(2024)).toBe('Giáp Thìn');
    expect(getVietnameseYearName(2025)).toBe('Ất Tỵ');
    expect(getVietnameseYearName(2036)).toBe('Bính Thìn');
  });
});

describe('formatLunarDateVi', () => {
  it('formats a common date with the traditional month name', () => {
    expect(formatLunarDateVi(2025, 1, 1)).toBe('1/Giêng/2025');
    expect(formatLunarDateVi(1990, 5, 21)).toBe('21/Năm/1990');
  });

  it('prefixes leap months with Nhuận', () => {
    expect(formatLunarDateVi(2025, 2, 15, true)).toBe('15/Nhuận Hai/2025');
  });

  it('falls back to the number for unknown months', () => {
    expect(formatLunarDateVi(2025, 13, 5)).toBe('5/13/2025');
  });
});

describe('formatLunarDateEn', () => {
  it('formats a common date', () => {
    expect(formatLunarDateEn(2025, 1, 1)).toBe('1 Month 1 2025 AL');
  });

  it('prefixes leap months with Leap', () => {
    expect(formatLunarDateEn(2025, 2, 15, true)).toBe(
      '15 Leap Month 2 2025 AL',
    );
  });
});

describe('month and day names', () => {
  it('lunarMonthNamesVi has 13 entries with the traditional names', () => {
    expect(lunarMonthNamesVi).toHaveLength(13);
    expect(lunarMonthNamesVi[1]).toBe('Giêng');
    expect(lunarMonthNamesVi[4]).toBe('Tư');
    expect(lunarMonthNamesVi[10]).toBe('Mười');
    expect(lunarMonthNamesVi[12]).toBe('Mười Hai');
  });

  it('solar month names have 13 entries', () => {
    expect(monthNamesVi[0]).toBe('');
    expect(monthNamesVi[12]).toBe('Tháng 12');
    expect(monthNamesEn[0]).toBe('');
    expect(monthNamesEn[12]).toBe('December');
  });

  it('day names start on Sunday', () => {
    expect(dayNamesVi[0]).toBe('CN');
    expect(dayNamesEn).toEqual([
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ]);
  });
});

describe('calendar helpers', () => {
  it('getDaysInMonth returns the number of days in a solar month', () => {
    expect(getDaysInMonth(2024, 2)).toBe(29);
    expect(getDaysInMonth(2025, 2)).toBe(28);
    expect(getDaysInMonth(2025, 7)).toBe(31);
  });

  it('getFirstDayOfMonth returns the weekday of the 1st (0 = Sunday)', () => {
    expect(getFirstDayOfMonth(2025, 1)).toBe(3);
    expect(getFirstDayOfMonth(2024, 3)).toBe(5);
  });
});
