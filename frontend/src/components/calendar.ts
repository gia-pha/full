import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { t } from '../i18n.js';
import type { Event } from '../types/index.js';
import {
  dayNamesEn,
  dayNamesVi,
  getDaysInMonth,
  getFirstDayOfMonth,
  getVietnameseYearName,
  type LunarDate,
  monthNamesEn,
  monthNamesVi,
  solarToLunar,
} from '../utils/lunar.js';

export type CalendarType = 'solar' | 'lunar';
export type CalendarLanguage = 'vi' | 'en';

export interface CalendarNavDetail {
  year: number;
  month: number;
}

export interface CalendarTypeDetail {
  type: CalendarType;
}

export interface DaySelectDetail {
  date: string;
  events: Event[];
}

interface CalendarCell {
  day: number;
  dateStr?: string;
  current: boolean;
  isToday?: boolean;
  events?: Event[];
  lunar?: LunarDate;
}

const dotColors: Record<string, string> = {
  memorial: 'bg-amber-400',
  meeting: 'bg-blue-400',
  reunion: 'bg-emerald-400',
  anniversary: 'bg-purple-400',
};

const textColors: Record<string, string> = {
  memorial: 'text-amber-600',
  meeting: 'text-blue-600',
  reunion: 'text-emerald-600',
  anniversary: 'text-purple-600',
};

const lunarMonthRoman = [
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

const pad2 = (n: number): string => String(n).padStart(2, '0');

@customElement('app-calendar')
export class AppCalendar extends LitElement {
  @property({ type: Number }) year = new Date().getFullYear();
  @property({ type: Number }) month = new Date().getMonth() + 1;
  @property({ type: String, reflect: true }) calendarType: CalendarType =
    'solar';
  @property({ type: Array }) events: Event[] = [];
  @property({ type: String }) language: CalendarLanguage = 'vi';

  override createRenderRoot() {
    return this;
  }

  private buildCells(): CalendarCell[] {
    const { year, month } = this;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const eventsMap = new Map<string, Event[]>();
    for (const evt of this.events) {
      const list = eventsMap.get(evt.date);
      if (list) list.push(evt);
      else eventsMap.set(evt.date, [evt]);
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

    const cells: CalendarCell[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad2(month)}-${pad2(d)}`;
      cells.push({
        day: d,
        dateStr,
        current: true,
        isToday: dateStr === todayStr,
        events: eventsMap.get(dateStr) ?? [],
        lunar: solarToLunar(year, month, d),
      });
    }
    const nextStart = 1;
    for (let d = 0; cells.length < 42; d++) {
      cells.push({ day: nextStart + d, current: false });
    }
    return cells;
  }

  private navigate(delta: number) {
    let month = this.month + delta;
    let year = this.year;
    if (month < 1) {
      month = 12;
      year -= 1;
    } else if (month > 12) {
      month = 1;
      year += 1;
    }
    this.year = year;
    this.month = month;
    this.dispatchEvent(
      new CustomEvent<CalendarNavDetail>('calendar-nav', {
        bubbles: true,
        composed: true,
        detail: { year, month },
      }),
    );
  }

  private goToday() {
    const now = new Date();
    this.year = now.getFullYear();
    this.month = now.getMonth() + 1;
    this.dispatchEvent(
      new CustomEvent<CalendarNavDetail>('calendar-nav', {
        bubbles: true,
        composed: true,
        detail: { year: this.year, month: this.month },
      }),
    );
  }

  private setType(type: CalendarType) {
    if (type === this.calendarType) return;
    this.calendarType = type;
    this.dispatchEvent(
      new CustomEvent<CalendarTypeDetail>('calendar-type-change', {
        bubbles: true,
        composed: true,
        detail: { type },
      }),
    );
  }

  private handleDayClick(cell: CalendarCell) {
    if (!cell.current || !cell.dateStr) return;
    this.dispatchEvent(
      new CustomEvent<DaySelectDetail>('day-select', {
        bubbles: true,
        composed: true,
        detail: { date: cell.dateStr, events: cell.events ?? [] },
      }),
    );
  }

  private renderTypeButton(type: CalendarType): TemplateResult {
    const active = this.calendarType === type;
    const activeClass =
      type === 'solar'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    return html`
      <button
        type="button"
        class="cal-type-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          active
            ? activeClass
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }"
        data-type=${type}
        aria-pressed=${active}
        @click=${() => this.setType(type)}
      >
        ${t(this.language, `events.${type}`)}
      </button>
    `;
  }

  private renderLegend(): TemplateResult {
    const types: CalendarType[] | string[] = [
      'memorial',
      'meeting',
      'reunion',
      'anniversary',
    ];
    return html`
      <div class="flex items-center gap-2 text-sm text-gray-500">
        ${types.map(
          (type, i) => html`
            <span
              class="w-2 h-2 rounded-full ${dotColors[type]} ${
                i > 0 ? 'ml-2' : ''
              }"
            ></span>
            <span>${t(this.language, `events.type.${type}`)}</span>
          `,
        )}
      </div>
    `;
  }

  private renderLunarDisplay(lunar: LunarDate): TemplateResult {
    return html`
      <div class="text-[9px] text-amber-500 mt-0.5">
        ${lunar.day}/${lunarMonthRoman[lunar.month] ?? lunar.month}
      </div>
    `;
  }

  private renderCell(cell: CalendarCell): TemplateResult {
    if (!cell.current) {
      return html`
        <div
          class="cal-cell min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <span class="text-xs text-gray-300 dark:text-gray-600"
            >${cell.day}</span
          >
        </div>
      `;
    }

    const cellEvents = cell.events ?? [];
    const todayClass = cell.isToday
      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/30'
      : 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700';
    const dayClass = cell.isToday
      ? 'bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center'
      : '';

    return html`
      <div
        class="cal-cell cal-day-cell min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-gray-100 dark:border-gray-700 ${todayClass} transition-colors cursor-pointer"
        data-date=${cell.dateStr}
        @click=${() => this.handleDayClick(cell)}
      >
        <div class="flex items-start justify-between mb-1">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-200 ${dayClass}"
            >${cell.day}</span
          >
          ${
            this.calendarType === 'lunar' && cell.lunar
              ? this.renderLunarDisplay(cell.lunar)
              : ''
          }
        </div>
        ${
          cellEvents.length > 0
            ? html`
              <div class="flex gap-0.5 mb-1">
                ${cellEvents.map(
                  (evt) => html`
                    <span
                      class="w-1.5 h-1.5 rounded-full ${
                        dotColors[evt.type ?? ''] ?? 'bg-gray-400'
                      }"
                      title=${evt.title}
                    ></span>
                  `,
                )}
              </div>
              <div class="space-y-0.5">
                ${cellEvents.slice(0, 2).map(
                  (evt) => html`
                      <div
                        class="text-[10px] truncate ${
                          textColors[evt.type ?? ''] ?? 'text-gray-600'
                        }"
                      >
                        ${evt.title}
                      </div>
                    `,
                )}
                ${
                  cellEvents.length > 2
                    ? html`<div class="text-[10px] text-gray-400">
                      +${cellEvents.length - 2}
                    </div>`
                    : ''
                }
              </div>
              ${
                this.calendarType === 'solar' && cell.lunar
                  ? this.renderLunarDisplay(cell.lunar)
                  : ''
              }
            `
            : ''
        }
      </div>
    `;
  }

  override render() {
    const { year, month, calendarType } = this;
    const monthNames = this.language === 'vi' ? monthNamesVi : monthNamesEn;
    const dayNames = this.language === 'vi' ? dayNamesVi : dayNamesEn;
    const lunarYearName =
      calendarType === 'lunar' ? getVietnameseYearName(year) : '';
    const cells = this.buildCells();

    return html`
      <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          ${t(this.language, 'events.calendarView')}
        </h2>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >${t(this.language, 'events.calendarType')}:</span
          >
          ${this.renderTypeButton('solar')} ${this.renderTypeButton('lunar')}
        </div>
      </div>
      <div class="p-4 sm:p-6 lg:p-8">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="cal-prev px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Previous month"
              @click=${() => this.navigate(-1)}
            >
              ◀
            </button>
            <button
              type="button"
              class="cal-today px-3 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium transition-colors"
              @click=${this.goToday}
            >
              ${t(this.language, 'events.today')}
            </button>
            <button
              type="button"
              class="cal-next px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Next month"
              @click=${() => this.navigate(1)}
            >
              ▶
            </button>
          </div>
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100">
            ${monthNames[month]} ${year}${
              lunarYearName ? ` - ${lunarYearName}` : ''
            }
          </h3>
          ${this.renderLegend()}
        </div>

        <div
          class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden"
        >
          <div
            class="grid grid-cols-7 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
          >
            ${dayNames.map(
              (dayName) => html`
                <div
                  class="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase"
                >
                  ${dayName}
                </div>
              `,
            )}
          </div>
          <div class="grid grid-cols-7">
            ${cells.map((cell) => this.renderCell(cell))}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-calendar': AppCalendar;
  }
}
