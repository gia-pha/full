import { html, render } from 'lit';
import './styles/main.css';
import './components/person-avatar.js';
import './components/member-item.js';
import type { AvatarShape, AvatarSize } from './components/person-avatar.js';
import type { Person } from './types/index.js';

const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const shapes: AvatarShape[] = ['circle', 'rounded'];

interface PlaygroundState {
  dark: boolean;
  avatarSize: AvatarSize;
  avatarShape: AvatarShape;
  selected: boolean;
  honorific: string;
  showButtons: boolean;
  isCurrentPerson: boolean;
  locked: boolean;
  personGender: 'M' | 'F';
  firstName: string;
  lastName: string;
  birthYear: string;
  deathYear: string;
  role: string;
  avatarUrl: string;
}

const state: PlaygroundState = {
  dark: false,
  avatarSize: 'md',
  avatarShape: 'circle',
  selected: false,
  honorific: 'Bố',
  showButtons: true,
  isCurrentPerson: false,
  locked: false,
  personGender: 'M',
  firstName: 'Nguyễn',
  lastName: 'Văn A',
  birthYear: '1985',
  deathYear: '',
  role: 'admin',
  avatarUrl: '',
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

function renderPlayground() {
  const person = updatePerson();

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
                shape="${state.avatarShape}"
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

              <div>
                <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Shape</label>
                <select
                  class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  value="${state.avatarShape}"
                  @change=${(e: Event) => {
                    state.avatarShape = (e.target as HTMLSelectElement)
                      .value as AvatarShape;
                    renderPlayground();
                  }}
                >
                  ${shapes.map((s) => html`<option value="${s}">${s}</option>`)}
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
                ?show-buttons=${state.showButtons}
                ?is-current-person=${state.isCurrentPerson}
                ?locked=${state.locked}
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
                  id="isCurrentPerson"
                  ?checked=${state.isCurrentPerson}
                  @change=${(e: Event) => {
                    state.isCurrentPerson = (
                      e.target as HTMLInputElement
                    ).checked;
                    renderPlayground();
                  }}
                  class="rounded border-gray-300"
                />
                <label for="isCurrentPerson" class="text-sm text-gray-700 dark:text-gray-300">Is Current Person</label>
              </div>

              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showButtons"
                  ?checked=${state.showButtons}
                  @change=${(e: Event) => {
                    state.showButtons = (e.target as HTMLInputElement).checked;
                    renderPlayground();
                  }}
                  class="rounded border-gray-300"
                />
                <label for="showButtons" class="text-sm text-gray-700 dark:text-gray-300">Show Buttons</label>
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
