import { describe, expect, it } from 'vitest';
import '../../src/components/calendar.js';
import type {
  AppCalendar,
  CalendarEventType,
  CalendarLanguage,
} from '../../src/components/calendar.js';
import type { Event } from '../../src/types/index.js';
import { getDaysInMonth } from '../../src/utils/lunar.js';

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const currentDay = now.getDate();

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function dateStr(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function makeEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: overrides.id ?? 'e1',
    title: 'Giỗ tổ',
    date: dateStr(currentYear, currentMonth, 15),
    location: '',
    description: '',
    status: 'upcoming',
    ...overrides,
  };
}

async function renderCalendar(
  opts: {
    year?: number;
    month?: number;
    lunar?: boolean;
    events?: Event[];
    eventTypes?: CalendarEventType[];
    language?: CalendarLanguage;
  } = {},
): Promise<AppCalendar> {
  const el = document.createElement('app-calendar');
  if (opts.year !== undefined) el.year = opts.year;
  if (opts.month !== undefined) el.month = opts.month;
  if (opts.lunar !== undefined) el.lunar = opts.lunar;
  if (opts.events !== undefined) el.events = opts.events;
  if (opts.eventTypes !== undefined) el.eventTypes = opts.eventTypes;
  if (opts.language !== undefined) el.language = opts.language;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function awaitEvent(el: AppCalendar, name: string): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener(name, (e) => resolve(e as CustomEvent), { once: true });
  });
}

function dayCells(el: AppCalendar): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('.cal-cell')];
}

describe('AppCalendar', () => {
  it('renders without shadow DOM', async () => {
    const el = await renderCalendar();
    expect(el.shadowRoot).toBeNull();
  });

  it('renders 42 grid cells with exactly the month days clickable', async () => {
    const el = await renderCalendar({ year: 2025, month: 6 });
    const grid = el.querySelectorAll('.grid-cols-7');
    expect(grid.length).toBe(2);
    const cells = dayCells(el);
    expect(cells.length).toBe(42);
    expect(cells.filter((c) => c.dataset.date).length).toBe(
      getDaysInMonth(2025, 6),
    );
    expect(el.querySelectorAll('.cal-day-cell').length).toBe(
      getDaysInMonth(2025, 6),
    );
  });

  it('shows the month and year in the title', async () => {
    const vi = await renderCalendar({ year: 2025, month: 6 });
    expect(vi.querySelector('h3')!.textContent).toContain('Tháng 6');
    expect(vi.querySelector('h3')!.textContent).toContain('2025');
    vi.remove();
    const en = await renderCalendar({
      year: 2025,
      month: 6,
      language: 'en',
    });
    expect(en.querySelector('h3')!.textContent).toContain('June');
  });

  it('shows the zodiac year name only when the lunar toggle is on', async () => {
    const solar = await renderCalendar({ year: 2025, month: 6 });
    expect(solar.querySelector('h3')!.textContent).not.toContain('Ất Tỵ');
    solar.remove();
    const lunar = await renderCalendar({ year: 2025, month: 6, lunar: true });
    expect(lunar.querySelector('h3')!.textContent).toContain('2025 - Ất Tỵ');
  });

  it('highlights today', async () => {
    const el = await renderCalendar();
    const today = dayCells(el).find(
      (c) => c.dataset.date === dateStr(currentYear, currentMonth, currentDay),
    )!;
    expect(today.className).toContain('bg-emerald-50');
  });

  it('navigates to the previous month and dispatches calendar-nav', async () => {
    const el = await renderCalendar({ year: 2025, month: 6 });
    const promise = awaitEvent(el, 'calendar-nav');
    (el.querySelector('.cal-prev') as HTMLButtonElement).click();
    const event = await promise;
    expect(event.detail).toEqual({ year: 2025, month: 5 });
    await el.updateComplete;
    expect(el.querySelector('h3')!.textContent).toContain('Tháng 5');
  });

  it('wraps the year backwards on January prev', async () => {
    const el = await renderCalendar({ year: 2025, month: 1 });
    const promise = awaitEvent(el, 'calendar-nav');
    (el.querySelector('.cal-prev') as HTMLButtonElement).click();
    const event = await promise;
    expect(event.detail).toEqual({ year: 2024, month: 12 });
  });

  it('wraps the year forwards on December next', async () => {
    const el = await renderCalendar({ year: 2025, month: 12 });
    const promise = awaitEvent(el, 'calendar-nav');
    (el.querySelector('.cal-next') as HTMLButtonElement).click();
    const event = await promise;
    expect(event.detail).toEqual({ year: 2026, month: 1 });
  });

  it('returns to the current month on today', async () => {
    const el = await renderCalendar({ year: 2020, month: 3 });
    const promise = awaitEvent(el, 'calendar-nav');
    (el.querySelector('.cal-today') as HTMLButtonElement).click();
    const event = await promise;
    expect(event.detail).toEqual({
      year: currentYear,
      month: currentMonth,
    });
  });

  it('toggles lunar mode on and dispatches calendar-lunar-toggle', async () => {
    const el = await renderCalendar();
    const promise = awaitEvent(el, 'calendar-lunar-toggle');
    (el.querySelector('.cal-lunar-toggle button') as HTMLButtonElement).click();
    const event = await promise;
    expect(event.detail).toEqual({ lunar: true });
    expect(el.lunar).toBe(true);
    expect(el.hasAttribute('lunar')).toBe(true);
  });

  it('toggles lunar mode back off', async () => {
    const el = await renderCalendar({ lunar: true });
    const promise = awaitEvent(el, 'calendar-lunar-toggle');
    (el.querySelector('.cal-lunar-toggle button') as HTMLButtonElement).click();
    const event = await promise;
    expect(event.detail).toEqual({ lunar: false });
    expect(el.lunar).toBe(false);
  });

  it('shows lunar dates on cells when the lunar toggle is on', async () => {
    const el = await renderCalendar({ year: 2025, month: 6, lunar: true });
    const cell = dayCells(el).find((c) => c.dataset.date === '2025-06-01')!;
    expect(cell.textContent).toContain('6/5');
    expect(cell.textContent).not.toContain('6/V');
  });

  it('hides lunar dates when the lunar toggle is off', async () => {
    const el = await renderCalendar({ year: 2025, month: 6 });
    const cell = dayCells(el).find((c) => c.dataset.date === '2025-06-01')!;
    expect(cell.textContent).not.toContain('6/5');
  });

  it('renders event dots and titles on event days', async () => {
    const el = await renderCalendar({
      events: [
        makeEvent({ id: 'e1', title: 'Giỗ tổ', type: 'memorial' }),
        makeEvent({ id: 'e2', title: 'Họp họ', type: 'meeting' }),
      ],
      eventTypes: [
        { type: 'memorial', color: '#f59e0b' },
        { type: 'meeting', color: '#3b82f6' },
      ],
    });
    const cell = dayCells(el).find(
      (c) => c.dataset.date === dateStr(currentYear, currentMonth, 15),
    )!;
    const memorialDot = cell.querySelector('span[title="Giỗ tổ"]')!;
    const meetingDot = cell.querySelector('span[title="Họp họ"]')!;
    expect(memorialDot.getAttribute('style')).toContain(
      'background-color: #f59e0b',
    );
    expect(meetingDot.getAttribute('style')).toContain(
      'background-color: #3b82f6',
    );
    expect(cell.textContent).toContain('Giỗ tổ');
    expect(cell.textContent).toContain('Họp họ');
  });

  it('uses event types and colors passed from outside', async () => {
    const el = await renderCalendar({
      events: [makeEvent({ id: 'e1', title: 'Lễ cưới', type: 'wedding' })],
      eventTypes: [{ type: 'wedding', label: 'Wedding', color: '#ec4899' }],
    });
    const cell = dayCells(el).find(
      (c) => c.dataset.date === dateStr(currentYear, currentMonth, 15),
    )!;
    const dot = cell.querySelector('span[title="Lễ cưới"]')!;
    expect(dot.getAttribute('style')).toContain('background-color: #ec4899');
    const title = cell.querySelector('.truncate')!;
    expect(title.getAttribute('style')).toContain('color: #ec4899');
    expect(el.textContent).toContain('Wedding');
    expect(el.textContent).not.toContain('Memorial Ceremony');
  });

  it('falls back to gray for events whose type is not provided', async () => {
    const el = await renderCalendar({
      events: [makeEvent({ id: 'e1', title: 'No type', type: 'unknown' })],
      eventTypes: [{ type: 'wedding', color: '#ec4899' }],
    });
    const cell = dayCells(el).find(
      (c) => c.dataset.date === dateStr(currentYear, currentMonth, 15),
    )!;
    const dot = cell.querySelector('span[title="No type"]')!;
    expect(dot.getAttribute('style')).toContain('background-color: #6b7280');
  });

  it('lists at most two events and shows an overflow count', async () => {
    const el = await renderCalendar({
      events: [
        makeEvent({ id: 'e1', title: 'Event one' }),
        makeEvent({ id: 'e2', title: 'Event two' }),
        makeEvent({ id: 'e3', title: 'Event three' }),
      ],
    });
    const cell = dayCells(el).find(
      (c) => c.dataset.date === dateStr(currentYear, currentMonth, 15),
    )!;
    expect(cell.textContent).toContain('Event one');
    expect(cell.textContent).toContain('Event two');
    expect(cell.textContent).not.toContain('Event three');
    expect(cell.textContent).toContain('+1');
    expect(cell.querySelectorAll('span[title]').length).toBe(3);
  });

  it('dispatches day-select with the clicked date and events', async () => {
    const event = makeEvent({ id: 'e1', title: 'Giỗ tổ' });
    const el = await renderCalendar({ events: [event] });
    const promise = awaitEvent(el, 'day-select');
    (
      dayCells(el).find(
        (c) => c.dataset.date === dateStr(currentYear, currentMonth, 15),
      ) as HTMLElement
    ).click();
    const detail = await promise;
    expect(detail.detail).toEqual({
      date: dateStr(currentYear, currentMonth, 15),
      events: [event],
    });
  });

  it('includes lunar date and year name in day-select when lunar is on', async () => {
    const el = await renderCalendar({
      year: 2025,
      month: 6,
      lunar: true,
      events: [makeEvent({ id: 'e1', title: 'Giỗ tổ' })],
    });
    const promise = awaitEvent(el, 'day-select');
    (
      dayCells(el).find((c) => c.dataset.date === '2025-06-01') as HTMLElement
    ).click();
    const detail = await promise;
    expect(detail.detail.date).toBe('2025-06-01');
    expect(detail.detail.lunarDate).toBeDefined();
    expect(detail.detail.lunarYearName).toBe('Ất Tỵ');
  });

  it('renders the selected-day panel on day click', async () => {
    const el = await renderCalendar({
      events: [
        makeEvent({
          id: 'e1',
          title: 'Giỗ tổ',
          type: 'memorial',
          location: 'Nhà thờ họ',
        }),
      ],
    });
    expect(el.querySelector('.cal-selected-panel')).toBeNull();
    (
      dayCells(el).find(
        (c) => c.dataset.date === dateStr(currentYear, currentMonth, 15),
      ) as HTMLElement
    ).click();
    await el.updateComplete;
    expect(el.selectedDate).toBe(dateStr(currentYear, currentMonth, 15));
    const panel = el.querySelector('.cal-selected-panel');
    expect(panel).not.toBeNull();
    expect(panel!.textContent).toContain('Giỗ tổ');
    expect(panel!.textContent).toContain('Nhà thờ họ');
    expect(panel!.querySelector('.cal-selected-lunar')).toBeNull();
  });

  it('does not render the selected-day panel for event-less days', async () => {
    const el = await renderCalendar({
      events: [makeEvent({ id: 'e1', title: 'Giỗ tổ' })],
    });
    (
      dayCells(el).find(
        (c) => c.dataset.date === dateStr(currentYear, currentMonth, 1),
      ) as HTMLElement
    ).click();
    await el.updateComplete;
    expect(el.selectedDate).toBe(dateStr(currentYear, currentMonth, 1));
    expect(el.querySelector('.cal-selected-panel')).toBeNull();
  });

  it('shows lunar date and year name in the selected panel when lunar is on', async () => {
    const el = await renderCalendar({
      year: 2025,
      month: 6,
      lunar: true,
      events: [makeEvent({ id: 'e1', date: '2025-06-01' })],
    });
    (
      dayCells(el).find((c) => c.dataset.date === '2025-06-01') as HTMLElement
    ).click();
    await el.updateComplete;
    const lunar = el.querySelector('.cal-selected-lunar');
    expect(lunar).not.toBeNull();
    expect(lunar!.textContent).toContain('Ất Tỵ');
  });

  it('clears the selection when navigating months', async () => {
    const el = await renderCalendar({
      year: 2025,
      month: 6,
      events: [makeEvent({ id: 'e1', date: '2025-06-15' })],
    });
    (
      dayCells(el).find((c) => c.dataset.date === '2025-06-15') as HTMLElement
    ).click();
    await el.updateComplete;
    expect(el.querySelector('.cal-selected-panel')).not.toBeNull();
    (el.querySelector('.cal-prev') as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.selectedDate).toBe('');
    expect(el.querySelector('.cal-selected-panel')).toBeNull();
  });

  it('does not dispatch day-select for adjacent-month cells', async () => {
    const el = await renderCalendar({ year: 2025, month: 6 });
    let dispatched = false;
    el.addEventListener('day-select', () => {
      dispatched = true;
    });
    const adjacent = dayCells(el).find((c) => !c.dataset.date)!;
    adjacent.click();
    expect(dispatched).toBe(false);
  });

  it('renders localized day names and legend', async () => {
    const eventTypes = [{ type: 'memorial', color: '#f59e0b' }];
    const vi = await renderCalendar({ language: 'vi', eventTypes });
    expect(vi.innerHTML).toContain('CN');
    expect(vi.querySelector('.cal-legend')!.textContent).toContain('Lễ giỗ tổ');
    vi.remove();
    const en = await renderCalendar({ language: 'en', eventTypes });
    expect(en.innerHTML).toContain('Sun');
    expect(en.querySelector('.cal-legend')!.textContent).toContain(
      'Memorial Ceremony',
    );
    expect(en.innerHTML).not.toContain('Lễ giỗ tổ');
  });

  it('renders no legend when no event types are provided', async () => {
    const el = await renderCalendar();
    expect(el.querySelector('.cal-legend')).toBeNull();
    expect(el.eventTypes).toEqual([]);
  });

  it('re-renders when month changes', async () => {
    const el = await renderCalendar({ year: 2025, month: 6 });
    el.month = 7;
    await el.updateComplete;
    expect(el.querySelector('h3')!.textContent).toContain('Tháng 7');
    expect(dayCells(el).filter((c) => c.dataset.date).length).toBe(31);
  });
});
