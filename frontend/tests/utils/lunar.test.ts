import { describe, expect, it } from 'vitest';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getVietnameseYearName,
  lunarToSolar,
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

    it('marks the real leap month (tháng 6 nhuận of 2025)', () => {
      expect(solarToLunar(2025, 7, 25)).toEqual({
        year: 2025,
        month: 6,
        day: 1,
        isLeapMonth: true,
      });
    });

    it('does not mark regular months in leap years', () => {
      const lunar = solarToLunar(2025, 5, 27);
      expect(lunar).toMatchObject({ year: 2025, month: 5, day: 1 });
      expect(lunar.isLeapMonth).toBe(false);
    });

    it('converts known dates astronomically (Mid-Autumn 2025)', () => {
      expect(solarToLunar(2025, 10, 6)).toMatchObject({
        year: 2025,
        month: 8,
        day: 15,
      });
    });

    it('does not mark leap months in regular years', () => {
      expect(solarToLunar(2024, 3, 10).isLeapMonth).toBe(false);
    });

    it('falls back for dates outside the supported range', () => {
      expect(solarToLunar(1100, 1, 1)).toEqual({
        year: 1100,
        month: 1,
        day: 1,
        isLeapMonth: false,
      });
    });
  });

  describe('lunarToSolar', () => {
    it('maps Lunar New Year 2026 to 2026-02-17', () => {
      expect(lunarToSolar(2026, 1, 1)).toEqual({
        year: 2026,
        month: 2,
        day: 17,
      });
    });

    it('maps a leap-month date (15/6 nhuận 2025) to 2025-08-08', () => {
      expect(lunarToSolar(2025, 6, 15, true)).toEqual({
        year: 2025,
        month: 8,
        day: 8,
      });
    });

    it('round-trips with solarToLunar', () => {
      const lunar = solarToLunar(2025, 10, 6);
      const solar = lunarToSolar(
        lunar.year,
        lunar.month,
        lunar.day,
        lunar.isLeapMonth,
      );
      expect(solar).toEqual({ year: 2025, month: 10, day: 6 });
    });

    it('returns null for invalid lunar dates', () => {
      expect(lunarToSolar(2025, 13, 1)).toBeNull();
      expect(lunarToSolar(2025, 1, 31)).toBeNull();
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
});
