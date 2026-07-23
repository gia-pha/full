import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Event, Person } from '../types/index.js';
import './person-avatar.js';

const eventTypeClass: Record<string, string> = {
  memorial: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  meeting: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  reunion:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  anniversary:
    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

@customElement('event-card')
export class EventCard extends LitElement {
  @property({ type: Object }) declare event: Event;
  @property({ type: Boolean, reflect: true }) canEdit = false;
  @property({ type: Array }) persons: Person[] = [];

  onEdit?: () => void;
  onDelete?: () => void;
  onAddToCalendar?: () => void;

  override createRenderRoot() {
    return this;
  }

  private getAttendeePerson(id: string): Person | undefined {
    return this.persons.find((p) => p.id === id);
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  override render() {
    if (!this.event) return html``;

    const evt = this.event;
    const typeClass = evt.type
      ? eventTypeClass[evt.type] ||
        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
      : undefined;
    const isUpcoming = evt.status === 'upcoming';

    const attendeeAvatars = (evt.attendees || []).slice(0, 5).map((id) => {
      const p = this.getAttendeePerson(id);
      if (!p) return html``;
      return html`
        <div class="border-2 border-white dark:border-gray-800 rounded-full overflow-hidden">
          <person-avatar .person=${p} size="sm"></person-avatar>
        </div>
      `;
    });

    return html`
      <div class="event-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-5 lg:p-6">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                ${
                  typeClass
                    ? html`<span class="px-3 py-1 text-xs rounded-full font-medium ${typeClass}">${evt.type}</span>`
                    : html``
                }
                <span class="px-3 py-1 text-xs rounded-full font-medium ${isUpcoming ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}">
                  ${isUpcoming ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <h3 class="font-bold text-gray-800 dark:text-gray-100 text-lg">${evt.title}</h3>
            </div>
            ${
              this.canEdit
                ? html`
                  <div class="flex gap-2 ml-4 flex-shrink-0">
                    <button
                       class="event-edit p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      title="Edit"
                      @click=${() => this.onEdit?.()}
                    >
                      ✏️
                    </button>
                    <button
                       class="event-delete p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                      @click=${() => this.onDelete?.()}
                    >
                      🗑️
                    </button>
                  </div>
                `
                : html``
            }
          </div>

          <p class="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">${evt.description}</p>

          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div class="flex items-center gap-2">📅 ${this.formatDate(evt.date)}</div>
            ${
              evt.lunarDate
                ? html`<div class="flex items-center gap-2 text-amber-600">🌙 ${evt.lunarDate}</div>`
                : html``
            }
            <div class="flex items-center gap-2">📍 ${evt.location}</div>
          </div>

          ${
            evt.mapUrl
              ? html`
                <div class="flex flex-wrap gap-3 mb-4">
                  <a href="${evt.mapUrl}" target="_blank" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors">🗺️ View Map</a>
                  <button
                    class="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
                    @click=${() => this.onAddToCalendar?.()}
                  >
                    📆 Add to Calendar
                  </button>
                </div>
              `
              : html``
          }

          ${
            evt.images && evt.images.length > 0
              ? html`
                <div class="mb-4">
                  <p class="text-sm text-gray-400 dark:text-gray-500 mb-3">🖼️ Images (${evt.images.length})</p>
                  <div class="flex gap-3 overflow-x-auto pb-2">
                    ${evt.images.map(
                      (img) => html`
                      <div class="w-36 h-24 lg:w-48 lg:h-32 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
                        <img src="${img}" class="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
                      </div>
                    `,
                    )}
                  </div>
                </div>
              `
              : html``
          }

          ${
            evt.attendees && evt.attendees.length > 0
              ? html`
                <div class="flex items-center gap-3">
                  <div class="flex -space-x-2">
                    ${attendeeAvatars}
                  </div>
                  <span class="text-sm text-gray-400 dark:text-gray-500">${evt.attendees.length} attendees</span>
                </div>
              `
              : html``
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'event-card': EventCard;
  }
}
