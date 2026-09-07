import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { CalendarEventType } from '../../src/components/calendar.js';
import type { Event as AppEvent } from '../../src/types/index.js';
import { pad2 } from '../../src/utils/format.js';
import { notify, state } from '../state.js';

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200';

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

const calendarEventTypes: CalendarEventType[] = [
  { type: 'memorial', color: '#f59e0b' },
  { type: 'meeting', color: '#3b82f6' },
  { type: 'reunion', color: '#10b981' },
  { type: 'anniversary', color: '#a855f7' },
];

export function calendarSection(): TemplateResult {
  const events = state.calendarShowEvents ? sampleEvents() : [];

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
            .lunar=${state.calendarLunar}
            .language=${state.language}
            .events=${events}
            .eventTypes=${state.calendarShowTypes ? calendarEventTypes : []}
            @calendar-nav=${(e: CustomEvent) => {
              state.calendarEvent = `calendar-nav: ${JSON.stringify(e.detail)}`;
              notify();
            }}
            @calendar-lunar-toggle=${(e: CustomEvent) => {
              state.calendarLunar = e.detail.lunar;
              state.calendarEvent = `calendar-lunar-toggle: ${e.detail.lunar}`;
              notify();
            }}
            @day-select=${(e: CustomEvent) => {
              state.calendarEvent = `day-select: ${e.detail.date} (${e.detail.events.length} events)`;
              notify();
            }}
          ></app-calendar>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Event types</label
          >
          <select
            class=${inputClass}
            .value=${state.calendarShowTypes ? 'types' : 'none'}
            @change=${(e: Event) => {
              state.calendarShowTypes =
                (e.target as HTMLSelectElement).value === 'types';
              notify();
            }}
          >
            <option value="types">With event types</option>
            <option value="none">No event types</option>
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
