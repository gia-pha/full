import { describe, expect, it } from 'vitest';
import { translate } from '../../src/i18n/translate.js';

const formatLunarDate = (
  locale: string,
  lunarMonth: number,
  lunarDay: number,
  lunarYear: number,
  isLeapMonth = false,
): string => {
  const monthLong = translate(locale, `calendar.months.${lunarMonth}`);
  const label = translate(locale, 'calendar.lunarLabel');
  const leap = isLeapMonth
    ? `, ${translate(locale, 'calendar.lunarLeapLabel')}`
    : '';
  return `${lunarDay}/${monthLong}/${lunarYear} (${label}${leap})`;
};

describe('translate', () => {
  it('interpolates params', () => {
    expect(translate('vi', 'events.eventCount', { count: 3 })).toBe(
      '3 sự kiện',
    );
    expect(translate('en', 'events.eventCount', { count: 3 })).toBe(
      '3 event(s)',
    );
  });

  it('returns the key when the entry is missing or not a string', () => {
    expect(translate('vi', 'does.not.exist')).toBe('does.not.exist');
    expect(translate('xx', 'common.close')).toBe('common.close');
    expect(translate('vi', 'calendar.weekdays')).toBe('calendar.weekdays');
  });
});

describe('calendar translations', () => {
  it('exposes 1-indexed month names', () => {
    expect(translate('vi', 'calendar.months.1')).toBe('Tháng 1');
    expect(translate('en', 'calendar.months.1')).toBe('January');
    expect(translate('en', 'calendar.months.12')).toBe('December');
  });

  it('exposes 1-indexed weekday names starting on Sunday', () => {
    expect(translate('vi', 'calendar.weekdays.1')).toBe('CN');
    expect(translate('en', 'calendar.weekdays.1')).toBe('Sun');
    expect(translate('vi', 'calendar.weekdays.7')).toBe('T7');
    expect(translate('en', 'calendar.weekdays.7')).toBe('Sat');
  });
});

describe('lunar calendar translations', () => {
  it('formats a regular lunar date per locale', () => {
    expect(formatLunarDate('vi', 1, 1, 2025)).toBe('1/Tháng 1/2025 (âm lịch)');
    expect(formatLunarDate('en', 1, 1, 2025)).toBe('1/January/2025 (lunar)');
  });

  it('marks leap months per locale', () => {
    expect(formatLunarDate('vi', 6, 15, 2025, true)).toBe(
      '15/Tháng 6/2025 (âm lịch, tháng nhuận)',
    );
    expect(formatLunarDate('en', 6, 15, 2025, true)).toBe(
      '15/June/2025 (lunar, leap month)',
    );
  });
});
