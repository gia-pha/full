import { html, render } from 'lit';
import './styles/main.css';
import './components/person-avatar.js';
import './components/member-item.js';
import './components/event-card.js';
import type { AvatarSize } from './components/person-avatar.js';
import { iconDelete, iconEdit, iconView } from './icons/index.js';
import type { Event as CalendarEvent, Person } from './types/index.js';

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

interface PlaygroundState {
  dark: boolean;
  avatarSize: AvatarSize;
  selected: boolean;
  honorific: string;
  locked: boolean;
  personGender: 'M' | 'F';
  firstName: string;
  lastName: string;
  birthYear: string;
  deathYear: string;
  role: string;
  avatarUrl: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventDescription: string;
  eventStatus: 'upcoming' | 'past';
  eventType: string;
  eventLunarDate: string;
  eventMapUrl: string;
  eventImages: string;
  eventCanEdit: boolean;
}

const state: PlaygroundState = {
  dark: false,
  avatarSize: 'md',
  selected: false,
  honorific: 'Bố',
  locked: false,
  personGender: 'M',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  birthYear: '1985',
  deathYear: '',
  role: 'admin',
  avatarUrl: '',
  eventTitle: 'Family Reunion',
  eventDate: '2024-02-10',
  eventLocation: 'Ho Chi Minh City, Vietnam',
  eventDescription:
    'Annual family gathering for the Lunar New Year celebration.',
  eventStatus: 'upcoming',
  eventType: 'reunion',
  eventLunarDate: '2024-01-10',
  eventMapUrl: 'https://maps.google.com/?q=ho+chi+minh+city',
  eventImages:
    'https://picsum.photos/seed/img1/300/200,https://picsum.photos/seed/img2/300/200',
  eventCanEdit: true,
};

function updatePerson(): Person {
  return {
    id: 'playground',
    data: {
      firstName: state.firstName,
      lastName: state.lastName,
      gender: state.personGender,
      birthYear: state.birthYear,
      deathYear: state.deathYear || undefined,
      generation: 5,
      role: state.role || undefined,
      avatar: state.avatarUrl || undefined,
    },
    rels: { parents: [], spouses: [], children: [] },
  };
}

function updateEvent(persons: Person[]): CalendarEvent {
  return {
    id: 'playground-event',
    title: state.eventTitle,
    date: state.eventDate,
    location: state.eventLocation,
    description: state.eventDescription,
    status: state.eventStatus,
    type: state.eventType || undefined,
    lunarDate: state.eventLunarDate || undefined,
    mapUrl: state.eventMapUrl || undefined,
    images: state.eventImages
      ? state.eventImages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    attendees: persons.map((p) => p.id),
  };
}

function renderPlayground() {
  const person = updatePerson();
  const demoPersons: Person[] = [
    person,
    {
      id: 'attendee-1',
      data: {
        firstName: 'Hương',
        lastName: 'Trần',
        gender: 'F',
        generation: 5,
      },
      rels: { parents: [], spouses: [], children: [] },
    },
    {
      id: 'attendee-2',
      data: {
        firstName: 'Thắng',
        lastName: 'Lê',
        gender: 'M',
        generation: 6,
      },
      rels: { parents: [], spouses: [], children: [] },
    },
    {
      id: 'attendee-3',
      data: {
        firstName: 'Mai',
        lastName: 'Phạm',
        gender: 'F',
        generation: 6,
        avatar: 'https://picsum.photos/seed/mai/32/32',
      },
      rels: { parents: [], spouses: [], children: [] },
    },
  ];
  const event = updateEvent(demoPersons);

  render(
    html`
      <div class="min-h-screen">
        <header class="bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
          <div class="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-800 dark:text-gray-100">Component Playground</h1>
            <button
              class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
              @click=${() => {
                state.dark = !state.dark;
                renderPlayground();
              }}
            >
              ${state.dark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <div class="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Person Avatar Section -->
          <section class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              &lt;person-avatar&gt;
            </h2>

            <div class="flex items-center justify-center min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-xl">
              <person-avatar
                .person=${person}
                size="${state.avatarSize}"
              ></person-avatar>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Size</label>
                <select
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.avatarSize}"
                  @change=${(e: Event) => {
                    state.avatarSize = (e.target as HTMLSelectElement)
                      .value as AvatarSize;
                    renderPlayground();
                  }}
                >
                  ${sizes.map((s) => html`<option value="${s}">${s}</option>`)}
                </select>
              </div>

            </div>
          </section>

          <!-- Member Item Section -->
          <section class="bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              &lt;member-item&gt;
            </h2>

            <div class="min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <member-item
                .person=${person}
                ?selected=${state.selected}
                .honorific=${state.honorific}
                ?locked=${state.locked}
                .actions=${[
                  {
                    label: 'View',
                    icon: iconView,
                    color:
                      'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400',
                    onClick: () => alert('View'),
                  },
                  {
                    label: 'Edit',
                    icon: iconEdit,
                    color:
                      'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400',
                    onClick: () => alert('Edit'),
                  },
                  {
                    label: 'Delete',
                    icon: iconDelete,
                    color:
                      'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400',
                    onClick: () => alert('Delete'),
                  },
                ]}
              ></member-item>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selected"
                  ?checked=${state.selected}
                  @change=${(e: Event) => {
                    state.selected = (e.target as HTMLInputElement).checked;
                    renderPlayground();
                  }}
                  class="rounded border-gray-300"
                />
                <label for="selected" class="text-sm text-gray-700 dark:text-gray-300">Selected</label>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="locked"
                  ?checked=${state.locked}
                  @change=${(e: Event) => {
                    state.locked = (e.target as HTMLInputElement).checked;
                    renderPlayground();
                  }}
                  class="rounded border-gray-300"
                />
                <label for="locked" class="text-sm text-gray-700 dark:text-gray-300">Locked</label>
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Honorific</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.honorific}"
                  @input=${(e: Event) => {
                    state.honorific = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>
            </div>
          </section>

          <!-- Event Card Section -->
          <section class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              &lt;event-card&gt;
            </h2>

            <div class="min-h-[300px] bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <event-card
                .event=${event}
                ?canEdit=${state.eventCanEdit}
                .persons=${demoPersons}
                .onEdit=${() => alert('Edit event')}
                .onDelete=${() => alert('Delete event')}
                .onAddToCalendar=${() => alert('Added to calendar')}
              ></event-card>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventTitle}"
                  @input=${(e: Event) => {
                    state.eventTitle = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventLocation}"
                  @input=${(e: Event) => {
                    state.eventLocation = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
                <input
                  type="date"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventDate}"
                  @input=${(e: Event) => {
                    state.eventDate = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
                <select
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventStatus}"
                  @change=${(e: Event) => {
                    state.eventStatus = (e.target as HTMLSelectElement).value as
                      | 'upcoming'
                      | 'past';
                    renderPlayground();
                  }}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Type</label>
                <select
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventType}"
                  @change=${(e: Event) => {
                    state.eventType = (e.target as HTMLSelectElement).value;
                    renderPlayground();
                  }}
                >
                  <option value="memorial">Memorial</option>
                  <option value="meeting">Meeting</option>
                  <option value="reunion">Reunion</option>
                  <option value="anniversary">Anniversary</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Lunar Date</label>
                <input
                  type="date"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventLunarDate}"
                  @input=${(e: Event) => {
                    state.eventLunarDate = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Map URL</label>
                <input
                  type="url"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.eventMapUrl}"
                  placeholder="—"
                  @input=${(e: Event) => {
                    state.eventMapUrl = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>
            </div>

            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <textarea
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                rows="3"
                @input=${(e: Event) => {
                  state.eventDescription = (
                    e.target as HTMLTextAreaElement
                  ).value;
                  renderPlayground();
                }}
              >${state.eventDescription}</textarea>
            </div>

            <div>
              <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Images (comma-separated URLs)</label>
              <input
                type="text"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value="${state.eventImages}"
                placeholder="—"
                @input=${(e: Event) => {
                  state.eventImages = (e.target as HTMLInputElement).value;
                  renderPlayground();
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
                  renderPlayground();
                }}
                class="rounded border-gray-300"
              />
              <label for="event-can-edit" class="text-sm text-gray-700 dark:text-gray-300">Can Edit</label>
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
                  renderPlayground();
                }}
              >
                Reset Event
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
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
                  renderPlayground();
                }}
              >
                Load Past Memorial Event
              </button>
            </div>
          </section>

          <!-- Person Data Editor -->
          <section class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6 space-y-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
              Person Data
            </h2>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.firstName}"
                  @input=${(e: Event) => {
                    state.firstName = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.lastName}"
                  @input=${(e: Event) => {
                    state.lastName = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Gender</label>
                <select
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.personGender}"
                  @change=${(e: Event) => {
                    state.personGender = (e.target as HTMLSelectElement)
                      .value as 'M' | 'F';
                    renderPlayground();
                  }}
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Birth Year</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.birthYear}"
                  @input=${(e: Event) => {
                    state.birthYear = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Death Year</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.deathYear}"
                  placeholder="—"
                  @input=${(e: Event) => {
                    state.deathYear = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Role</label>
                <select
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.role}"
                  @change=${(e: Event) => {
                    state.role = (e.target as HTMLSelectElement).value;
                    renderPlayground();
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Avatar URL</label>
                <input
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.avatarUrl}"
                  placeholder="—"
                  @input=${(e: Event) => {
                    state.avatarUrl = (e.target as HTMLInputElement).value;
                    renderPlayground();
                  }}
                />
              </div>
            </div>

            <div class="flex flex-wrap gap-3 pt-2">
              <button
                class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                @click=${() => {
                  Object.assign(state, {
                    firstName: 'Nguyễn',
                    lastName: 'Văn A',
                    personGender: 'M',
                    birthYear: '1985',
                    deathYear: '',
                    role: 'admin',
                    avatarUrl: '',
                  });
                  renderPlayground();
                }}
              >
                Reset to Living Male
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                @click=${() => {
                  Object.assign(state, {
                    firstName: 'Trần',
                    lastName: 'Thị B',
                    personGender: 'F',
                    birthYear: '1950',
                    deathYear: '2020',
                    role: 'editor',
                    avatarUrl: '',
                  });
                  renderPlayground();
                }}
              >
                Load Deceased Female
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 transition-colors"
                @click=${() => {
                  state.avatarUrl =
                    state.personGender === 'M'
                      ? 'https://xsgames.co/randomusers/avatar.php?g=male'
                      : 'https://xsgames.co/randomusers/avatar.php?g=female';
                  renderPlayground();
                }}
              >
                Set Random Avatar
              </button>
              <button
                class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                @click=${() => {
                  state.avatarUrl = '';
                  renderPlayground();
                }}
              >
                Clear Avatar
              </button>
            </div>
          </section>
        </div>
      </div>
    `,
    document.getElementById('playground')!,
  );
}

// Apply dark class to html element
function applyTheme() {
  document.documentElement.classList.toggle('dark', state.dark);
}

applyTheme();
renderPlayground();
