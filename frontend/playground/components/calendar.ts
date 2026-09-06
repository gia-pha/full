import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { t } from '../../src/i18n.js';
import type { Event as AppEvent } from '../../src/types/index.js';
import { notify, state } from '../state.js';

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200';

const dotColors: Record<string, string> = {
  memorial: 'bg-amber-400',
  meeting: 'bg-blue-400',
  reunion: 'bg-emerald-400',
  anniversary: 'bg-purple-400',
};

const typeTextColors: Record<string, string> = {
  memorial: 'text-amber-600 dark:text-amber-400',
  meeting: 'text-blue-600 dark:text-blue-400',
  reunion: 'text-emerald-600 dark:text-emerald-400',
  anniversary: 'text-purple-600 dark:text-purple-400',
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function inMonth(monthOffset: number, day: number): string {
  const base = new Date();
  const d = new Date(base.getFullYear(), base.getMonth() + monthOffset, day);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function sampleEvents(): AppEvent[] {
  const defs: Array<[string, number, number, string]> = [
    ['Giỗ tổ lần 120', 0, 3, 'memorial'],
    ['Họp họ quý', 0, 15, 'meeting'],
    ['Hội ngộ con cháu', 0, 15, 'reunion'],
    ['Kỷ niệm 50 năm', 0, 15, 'anniversary'],
    ['Lễ cưới', 0, 28, 'reunion'],
    ['Viếng mộ tổ', 1, 10, 'memorial'],
    ['Sơ kết dòng họ', 1, 20, 'meeting'],
  ];
  return defs.map(([title, monthOffset, day, type], i) => ({
    id: `cal-${i}`,
    title,
    date: inMonth(monthOffset, day),
    location: 'Nhà thờ họ',
    description: '',
    status: 'upcoming',
    type,
  }));
}

function formatSelectedDate(date: string, language: 'vi' | 'en'): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function selectedDayPanel(date: string, events: AppEvent[]): TemplateResult {
  const lang = state.calendarLanguage;
  const countLabel =
    lang === 'vi'
      ? `${events.length} sự kiện`
      : `${events.length} ${events.length === 1 ? 'event' : 'events'}`;
  return html`
    <div
      id="cal-selected"
      class="cal-selected-panel mt-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-900/20 dark:via-gray-900 dark:to-emerald-900/20 p-4 space-y-3"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-lg leading-none">📅</span>
          <h3
            class="truncate text-sm font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
          >
            ${formatSelectedDate(date, lang)}
          </h3>
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
                class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColors[evt.type ?? ''] ?? 'bg-gray-400'}"
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
                      class="text-xs font-medium ${typeTextColors[evt.type] ?? 'text-gray-500'}"
                    >
                      ${t(lang, `events.type.${evt.type}`)}
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

export function calendarSection(): TemplateResult {
  const events = state.calendarShowEvents ? sampleEvents() : [];
  const selectedEvents =
    state.calendarSelectedDate !== ''
      ? events.filter((evt) => evt.date === state.calendarSelectedDate)
      : [];

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;app-calendar&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          <app-calendar
            .calendarType=${state.calendarType}
            .language=${state.calendarLanguage}
            .events=${events}
            @calendar-nav=${(e: CustomEvent) => {
              state.calendarSelectedDate = '';
              state.calendarEvent = `calendar-nav: ${JSON.stringify(e.detail)}`;
              notify();
            }}
            @calendar-type-change=${(e: CustomEvent) => {
              state.calendarType = e.detail.type;
              state.calendarEvent = `calendar-type-change: ${e.detail.type}`;
              notify();
            }}
            @day-select=${(e: CustomEvent) => {
              state.calendarSelectedDate = e.detail.date as string;
              state.calendarEvent = `day-select: ${e.detail.date} (${e.detail.events.length} events)`;
              notify();
            }}
          ></app-calendar>
          ${
            selectedEvents.length > 0
              ? selectedDayPanel(state.calendarSelectedDate, selectedEvents)
              : ''
          }
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Language</label
          >
          <select
            class=${inputClass}
            .value=${state.calendarLanguage}
            @change=${(e: Event) => {
              state.calendarLanguage = (e.target as HTMLSelectElement).value as
                | 'vi'
                | 'en';
              notify();
            }}
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Dataset</label
          >
          <select
            class=${inputClass}
            .value=${state.calendarShowEvents ? 'events' : 'empty'}
            @change=${(e: Event) => {
              state.calendarShowEvents =
                (e.target as HTMLSelectElement).value === 'events';
              notify();
            }}
          >
            <option value="events">Sample events (this + next month)</option>
            <option value="empty">No events</option>
          </select>
        </div>
      </div>

      <p class="text-xs text-gray-500 os-dark:text-gray-400">
        Last event:
        <span class="font-mono">${state.calendarEvent || 'none'}</span>
      </p>
    </section>
  `;
}
