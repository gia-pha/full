// Vietnamese lunar calendar backed by `lunar-date-vn`, an implementation of
// Ho Ngoc Duc's Lunar Algorithm (astronomically exact for the Vietnam time
// zone, valid for years 1200-2199). This module keeps the app-facing API
// (plain objects + conversions) on top of the library's class-based API.
// Localized display strings live in `src/i18n/translations.json`.

import { LunarDate as LunarDateLib, SolarDate } from 'lunar-date-vn';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
}

export interface SolarDay {
  year: number;
  month: number;
  day: number;
}

export function solarToLunar(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
): LunarDate {
  try {
    const lunar = new SolarDate({
      day: solarDay,
      month: solarMonth,
      year: solarYear,
      yearIndex: solarYear,
      hour: 0,
    }).toLunarDate();
    if (!lunar) throw new Error('lunar conversion failed');
    const { year, month, day, leap_month: isLeapMonth } = lunar.get();
    return { year, month, day, isLeapMonth: Boolean(isLeapMonth) };
  } catch {
    return { year: solarYear, month: 1, day: 1, isLeapMonth: false };
  }
}

export function lunarToSolar(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth = false,
): SolarDay | null {
  try {
    const lunar = new LunarDateLib({
      day: lunarDay,
      month: lunarMonth,
      year: lunarYear,
      yearIndex: lunarYear,
      hour: 0,
      leap_month: isLeapMonth,
    });
    lunar.init();
    const solar = lunar.toSolarDate();
    if (!solar) return null;
    const { year, month, day } = solar.get();
    return { year, month, day };
  } catch {
    return null;
  }
}

export function getVietnameseYearName(year: number): string {
  return new LunarDateLib({
    year,
    yearIndex: year,
    month: 1,
    day: 1,
    hour: 0,
  }).getYearName();
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}
