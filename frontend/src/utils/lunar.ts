// Vietnamese lunar calendar backed by `lunar-date-vn`, an implementation of
// Ho Ngoc Duc's Lunar Algorithm (astronomically exact for the Vietnam time
// zone, valid for years 1200-2199). This module keeps the app-facing API
// (plain objects + formatters) on top of the library's class-based API.

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

export function getVietnameseDayName(
  solarYear: number,
  solarMonth: number,
  solarDay: number,
): string | null {
  try {
    const lunar = new SolarDate({
      day: solarDay,
      month: solarMonth,
      year: solarYear,
      yearIndex: solarYear,
      hour: 0,
    }).toLunarDate();
    return lunar ? lunar.getDayName() : null;
  } catch {
    return null;
  }
}

export const lunarMonthNamesVi = [
  '',
  'Một',
  'Hai',
  'Ba',
  'Bốn',
  'Năm',
  'Sáu',
  'Bảy',
  'Tám',
  'Chín',
  'Mười',
  'Mười Một',
  'Chạp',
];

export function formatLunarDateVi(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth = false,
): string {
  const prefix = isLeapMonth ? 'Nhuận ' : '';
  return `${lunarDay}/${prefix}${lunarMonthNamesVi[lunarMonth] ?? lunarMonth}/${lunarYear}`;
}

export function formatLunarDateEn(
  lunarYear: number,
  lunarMonth: number,
  lunarDay: number,
  isLeapMonth = false,
): string {
  const prefix = isLeapMonth ? 'Leap ' : '';
  return `${lunarDay} ${prefix}Month ${lunarMonth} ${lunarYear} AL`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export const monthNamesVi = [
  '',
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12',
];

export const monthNamesEn = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const dayNamesVi = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
