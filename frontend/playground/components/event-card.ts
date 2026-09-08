import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { demoPersons, notify, state, updateEvent } from '../state.js';

export function eventCardSection(): TemplateResult {
  const persons = demoPersons();
  const event = updateEvent(persons);

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;event-card&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="min-h-[300px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <event-card
            .event=${event}
            ?canEdit=${state.eventCanEdit}
            .persons=${persons}
            .onEdit=${() => alert('Edit event')}
            .onDelete=${() => alert('Delete event')}
            .onAddToCalendar=${() => alert('Added to calendar')}
          ></event-card>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Title</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventTitle}"
            @input=${(e: Event) => {
              state.eventTitle = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Location</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventLocation}"
            @input=${(e: Event) => {
              state.eventLocation = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Date</label
          >
          <input
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventDate}"
            @input=${(e: Event) => {
              state.eventDate = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Status</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventStatus}"
            @change=${(e: Event) => {
              state.eventStatus = (e.target as HTMLSelectElement).value as
                | 'upcoming'
                | 'past';
              notify();
            }}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Type</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventType}"
            @change=${(e: Event) => {
              state.eventType = (e.target as HTMLSelectElement).value;
              notify();
            }}
          >
            <option value="memorial">Memorial</option>
            <option value="meeting">Meeting</option>
            <option value="reunion">Reunion</option>
            <option value="anniversary">Anniversary</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Lunar Date</label
          >
          <input
            type="date"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventLunarDate}"
            @input=${(e: Event) => {
              state.eventLunarDate = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Map URL</label
          >
          <input
            type="url"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.eventMapUrl}"
            placeholder="—"
            @input=${(e: Event) => {
              state.eventMapUrl = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>
      </div>

      <div>
        <label class="block text-xs text-gray-500 mb-1">Description</label>
        <textarea
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
          rows="3"
          @input=${(e: Event) => {
            state.eventDescription = (e.target as HTMLTextAreaElement).value;
            notify();
          }}
        >${state.eventDescription}</textarea>
      </div>

      <div>
        <label class="block text-xs text-gray-500 mb-1"
          >Images (comma-separated URLs)</label
        >
        <input
          type="text"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
          value="${state.eventImages}"
          placeholder="—"
          @input=${(e: Event) => {
            state.eventImages = (e.target as HTMLInputElement).value;
            notify();
          }}
        />
      </div>

      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="event-can-edit"
          ?checked=${state.eventCanEdit}
          @change=${(e: Event) => {
            state.eventCanEdit = (e.target as HTMLInputElement).checked;
            notify();
          }}
          class="rounded border-gray-300"
        />
        <label
          for="event-can-edit"
          class="text-sm text-gray-700 os-dark:text-gray-300"
          >Can Edit</label
        >
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            Object.assign(state, {
              eventTitle: 'Family Reunion',
              eventDate: '2024-02-10',
              eventLocation: 'Ho Chi Minh City, Vietnam',
              eventDescription:
                'Annual family gathering for the Lunar New Year celebration.',
              eventStatus: 'upcoming' as const,
              eventType: 'reunion',
              eventLunarDate: '2024-01-10',
              eventMapUrl: 'https://maps.google.com/?q=ho+chi+minh+city',
              eventImages:
                'https://picsum.photos/seed/img1/300/200,https://picsum.photos/seed/img2/300/200',
              eventCanEdit: true,
            });
            notify();
          }}
        >
          Reset Event
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 os-dark:bg-gray-700 os-dark:hover:bg-gray-600 text-gray-700 os-dark:text-gray-200 transition-colors"
          @click=${() => {
            Object.assign(state, {
              eventTitle: 'Memorial Ceremony',
              eventDate: '2024-03-15',
              eventDescription: 'Annual memorial ceremony for ancestors.',
              eventStatus: 'past' as const,
              eventType: 'memorial',
              eventLunarDate: '2024-02-20',
              eventMapUrl: '',
              eventImages: '',
              eventCanEdit: false,
            });
            notify();
          }}
        >
          Load Past Memorial Event
        </button>
      </div>
    </section>
  `;
}
