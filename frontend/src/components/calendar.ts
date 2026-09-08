import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Locale } from '../i18n/context.js';
import { I18nMixin } from '../i18n/i18n-mixin.js';
import type { Event } from '../types/index.js';
import { pad2 } from '../utils/format.js';
import './toggle.js';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getVietnameseYearName,
  type LunarDate,
  solarToLunar,
} from '../utils/lunar.js';
import type { ToggleDetail } from './toggle.js';

export interface CalendarNavDetail {
  year: number;
  month: number;
}

export interface CalendarLunarDetail {
  lunar: boolean;
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

export interface CalendarEventType {
  type: string;
  label?: string;
  color: string;
}

const fallbackColor = '#6b7280';

const formatSelectedDate = (date: string, language: Locale): string => {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

@customElement('app-calendar')
export class AppCalendar extends I18nMixin(LitElement) {
  @property({ type: Number }) year = new Date().getFullYear();
  @property({ type: Number }) month = new Date().getMonth() + 1;
  @property({ type: Boolean, reflect: true }) lunar = false;
  @property({ type: Array }) events: Event[] = [];
  @property({ type: Array }) eventTypes: CalendarEventType[] = [];
  @property({ type: String }) selectedDate = '';

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
    this.selectedDate = '';
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
    this.selectedDate = '';
    this.dispatchEvent(
      new CustomEvent<CalendarNavDetail>('calendar-nav', {
        bubbles: true,
        composed: true,
        detail: { year: this.year, month: this.month },
      }),
    );
  }

  private handleLunarChange(e: CustomEvent<ToggleDetail>) {
    e.stopPropagation();
    this.lunar = e.detail.checked;
    this.dispatchEvent(
      new CustomEvent<CalendarLunarDetail>('calendar-lunar-toggle', {
        bubbles: true,
        composed: true,
        detail: { lunar: this.lunar },
      }),
    );
  }

  private formatLunarDate(lunar: LunarDate): string {
    const monthLong = this.t(`calendar.months.${lunar.month}`);
    const label = this.t('calendar.lunarLabel');
    const leap = lunar.isLeapMonth
      ? `, ${this.t('calendar.lunarLeapLabel')}`
      : '';
    return `${lunar.day}/${monthLong}/${lunar.year} (${label}${leap})`;
  }

  private handleDayClick(cell: CalendarCell) {
    if (!cell.current || !cell.dateStr) return;
    this.selectedDate = cell.dateStr;
    const detail: DaySelectDetail = {
      date: cell.dateStr,
      events: cell.events ?? [],
    };
    this.dispatchEvent(
      new CustomEvent<DaySelectDetail>('day-select', {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  private renderLunarToggle(): TemplateResult {
    return html`
      <app-toggle
        class="cal-lunar-toggle"
        .checked=${this.lunar}
        .label=${`🌙 ${this.t('events.lunar')}`}
        @change=${this.handleLunarChange}
      ></app-toggle>
    `;
  }

  private typeColor(type?: string): string | undefined {
    return this.eventTypes.find((et) => et.type === type)?.color;
  }

  private typeLabel(type: string): string {
    return (
      this.eventTypes.find((et) => et.type === type)?.label ??
      this.t(`events.type.${type}`)
    );
  }

  private renderLegend(): TemplateResult | '' {
    if (this.eventTypes.length === 0) return '';
    return html`
      <div class="cal-legend flex items-center gap-2 text-sm text-gray-500">
        ${this.eventTypes.map(
          (et, i) => html`
            <span
              class="w-2 h-2 rounded-full ${i > 0 ? 'ml-2' : ''}"
              style="background-color: ${et.color}"
            ></span>
            <span>${this.typeLabel(et.type)}</span>
          `,
        )}
      </div>
    `;
  }

  private renderLunarDisplay(lunar: LunarDate): TemplateResult {
    const leap = lunar.isLeapMonth
      ? ` ${this.t('calendar.lunarLeapMark')}`
      : '';
    return html`
      <div class="text-[9px] text-amber-500 mt-0.5">
        ${lunar.day}/${lunar.month}${leap}
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
          ${this.lunar && cell.lunar ? this.renderLunarDisplay(cell.lunar) : ''}
        </div>
        ${
          cellEvents.length > 0
            ? html`
              <div class="flex gap-0.5 mb-1">
                ${cellEvents.map(
                  (evt) => html`
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      style="background-color: ${
                        this.typeColor(evt.type) ?? fallbackColor
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
                        class="text-[10px] truncate"
                        style="color: ${
                          this.typeColor(evt.type) ?? fallbackColor
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
            `
            : ''
        }
      </div>
    `;
  }

  private renderSelectedPanel(): TemplateResult | '' {
    if (!this.selectedDate) return '';
    const events = this.events.filter((evt) => evt.date === this.selectedDate);
    if (events.length === 0) return '';
    const countLabel = this.t('events.eventCount', {
      count: events.length,
    });
    const [y, m, d] = this.selectedDate.split('-').map(Number);
    const lunar = solarToLunar(y, m, d);
    return html`
      <div
        id="cal-selected"
        class="cal-selected-panel mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-900/20 dark:via-gray-900 dark:to-emerald-900/20 p-4 space-y-3"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-lg leading-none">📅</span>
            <div class="min-w-0">
              <h3
                class="cal-selected-date truncate text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
              >
                ${formatSelectedDate(this.selectedDate, this.locale)}
              </h3>
              ${
                this.lunar
                  ? html`<p
                      class="cal-selected-lunar mt-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
                    >
                      🌙 ${this.formatLunarDate(lunar)} -
                      ${getVietnameseYearName(lunar.year)}
                    </p>`
                  : ''
              }
            </div>
          </div>
          <span
            class="shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
            >${countLabel}</span
          >
        </div>
        <ul class="space-y-2">
          ${events.map(
            (evt) => html`
              <li
                class="flex items-start gap-3 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 px-3 py-2.5 shadow-sm"
              >
                <span
                  class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                  style="background-color: ${
                    this.typeColor(evt.type) ?? fallbackColor
                  }"
                ></span>
                <div class="min-w-0">
                  <p
                    class="truncate text-sm font-semibold text-gray-800 dark:text-gray-100"
                  >
                    ${evt.title}
                  </p>
                  ${
                    evt.type
                      ? html`<p
                        class="text-xs font-medium"
                        style="color: ${
                          this.typeColor(evt.type) ?? fallbackColor
                        }"
                      >
                        ${this.typeLabel(evt.type)}
                      </p>`
                      : ''
                  }
                  ${
                    evt.location
                      ? html`<p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        📍 ${evt.location}
                      </p>`
                      : ''
                  }
                </div>
              </li>
            `,
          )}
        </ul>
      </div>
    `;
  }

  override render() {
    const { year, month } = this;
    const monthLabel = this.t(`calendar.months.${month}`);
    const dayNames = Array.from({ length: 7 }, (_, i) =>
      this.t(`calendar.weekdays.${i + 1}`),
    );
    const lunarYearName = this.lunar ? getVietnameseYearName(year) : '';
    const cells = this.buildCells();

    return html`
      <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          ${this.t('events.calendarView')}
        </h2>
        <div class="flex items-center gap-2">
          ${this.renderLunarToggle()}
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
              ${this.t('events.today')}
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
            ${monthLabel} ${year}${lunarYearName ? ` - ${lunarYearName}` : ''}
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
        ${this.renderSelectedPanel()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-calendar': AppCalendar;
  }
}
