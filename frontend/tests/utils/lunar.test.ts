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

describe('lunar utils', () => {
  describe('getDaysInMonth', () => {
    it('returns leap-february length', () => {
      expect(getDaysInMonth(2024, 2)).toBe(29);
      expect(getDaysInMonth(2023, 2)).toBe(28);
    });

    it('returns 30/31 for regular months', () => {
      expect(getDaysInMonth(2025, 4)).toBe(30);
      expect(getDaysInMonth(2025, 12)).toBe(31);
    });
  });

  describe('getFirstDayOfMonth', () => {
    it('returns Sunday for 2023-01', () => {
      expect(getFirstDayOfMonth(2023, 1)).toBe(0);
    });

    it('returns Wednesday for 2025-01', () => {
      expect(getFirstDayOfMonth(2025, 1)).toBe(3);
    });
  });

  describe('solarToLunar', () => {
    it('maps Lunar New Year 2025 (2025-01-29) to 1/1', () => {
      expect(solarToLunar(2025, 1, 29)).toEqual({
        year: 2025,
        month: 1,
        day: 1,
        isLeapMonth: false,
      });
    });

    it('increments the lunar day after New Year', () => {
      expect(solarToLunar(2025, 1, 30)).toMatchObject({
        year: 2025,
        month: 1,
        day: 2,
      });
    });

    it('maps the day before Lunar New Year to the previous lunar year', () => {
      const lunar = solarToLunar(2025, 1, 28);
      expect(lunar.year).toBe(2024);
      expect(lunar.month).toBe(12);
      expect(lunar.day).toBe(29);
    });

    it('marks leap months in leap years', () => {
      const lunar = solarToLunar(2025, 5, 27);
      expect(lunar.isLeapMonth).toBe(true);
    });

    it('does not mark leap months in regular years', () => {
      expect(solarToLunar(2024, 3, 10).isLeapMonth).toBe(false);
    });

    it('falls back for dates outside the table', () => {
      expect(solarToLunar(1800, 1, 1)).toEqual({
        year: 1800,
        month: 1,
        day: 1,
        isLeapMonth: false,
      });
    });
  });

  describe('getVietnameseYearName', () => {
    it('returns Ất Tỵ for 2025', () => {
      expect(getVietnameseYearName(2025)).toBe('Ất Tỵ');
    });

    it('returns Giáp Thìn for 2024', () => {
      expect(getVietnameseYearName(2024)).toBe('Giáp Thìn');
    });

    it('returns Tý for branch year 2020', () => {
      expect(getVietnameseYearName(2020)).toBe('Canh Tý');
    });
  });

  describe('formatLunarDateVi', () => {
    it('formats a regular lunar date', () => {
      expect(formatLunarDateVi(2025, 1, 1)).toBe('1/Một/2025');
    });

    it('marks leap months', () => {
      expect(formatLunarDateVi(2025, 6, 15, true)).toContain('Nhường');
    });
  });

  describe('formatLunarDateEn', () => {
    it('formats a regular lunar date', () => {
      expect(formatLunarDateEn(2025, 1, 1)).toBe('1 Month 1 2025 AL');
    });

    it('marks leap months', () => {
      expect(formatLunarDateEn(2025, 6, 15, true)).toBe(
        '15 Leap Month 6 2025 AL',
      );
    });
  });

  describe('name tables', () => {
    it('are 1-indexed for months', () => {
      expect(monthNamesVi[1]).toBe('Tháng 1');
      expect(monthNamesEn[1]).toBe('January');
      expect(monthNamesEn[12]).toBe('December');
      expect(lunarMonthNamesVi[11]).toBe('Mười Một');
    });

    it('start the week on Sunday', () => {
      expect(dayNamesVi[0]).toBe('CN');
      expect(dayNamesEn[0]).toBe('Sun');
      expect(dayNamesVi.length).toBe(7);
      expect(dayNamesEn.length).toBe(7);
    });
  });
});
