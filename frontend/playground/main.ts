import { html, render } from 'lit';
import '../src/styles/main.css';
import '../src/i18n/provider.js';
import '../src/components/person-avatar.js';
import '../src/components/avatar-stack.js';
import '../src/components/member-item.js';
import '../src/components/member-card.js';
import '../src/components/event-card.js';
import '../src/components/notification-item.js';
import '../src/components/modal.js';
import '../src/components/confirm-dialog.js';
import '../src/components/app-input.js';
import '../src/components/app-select.js';
import '../src/components/app-textarea.js';
import '../src/components/toggle.js';
import '../src/components/tabs.js';
import '../src/components/empty-state.js';
import '../src/components/stat-card.js';
import '../src/components/info-card.js';
import '../src/components/relation-card.js';
import '../src/components/fund-chart.js';
import '../src/components/fund-summary.js';
import '../src/components/fund-transactions-table.js';
import '../src/components/app-button.js';
import '../src/components/sidebar.js';
import '../src/components/calendar.js';
import { appButtonSection } from './components/app-button.js';
import { avatarStackSection } from './components/avatar-stack.js';
import { calendarSection } from './components/calendar.js';
import { cardsSection } from './components/cards.js';
import { confirmDialogSection } from './components/confirm-dialog.js';
import { eventCardSection } from './components/event-card.js';
import { formControlsSection } from './components/form-controls.js';
import { fundChartSection } from './components/fund-chart.js';
import { fundSummarySection } from './components/fund-summary.js';
import { fundTransactionsTableSection } from './components/fund-transactions-table.js';
import { memberCardSection } from './components/member-card.js';
import { memberItemSection } from './components/member-item.js';
import { modalSection } from './components/modal.js';
import { notificationItemSection } from './components/notification-item.js';
import { personAvatarSection } from './components/person-avatar.js';
import { sidebarSection } from './components/sidebar.js';
import { uiBasicsSection } from './components/ui-basics.js';
import { notify, state, subscribe, updatePerson } from './state.js';

function renderPlayground() {
  const person = updatePerson();

  render(
    html`
      <div class="min-h-screen">
        <i18n-provider .locale=${state.language}>
        <header class="bg-white os-dark:bg-gray-800 shadow border-b border-gray-200 os-dark:border-gray-700">
          <div class="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-800 os-dark:text-gray-100">
              Component Playground
            </h1>
            <div class="flex items-center gap-2">
              <button
                class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 os-dark:bg-gray-700 os-dark:hover:bg-gray-600 text-gray-700 os-dark:text-gray-200 transition-colors"
                title=${state.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
                @click=${() => {
                  state.language = state.language === 'vi' ? 'en' : 'vi';
                  notify();
                }}
              >
                🌐 ${state.language === 'vi' ? 'EN' : 'VI'}
              </button>
              <button
                class="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 os-dark:bg-gray-700 os-dark:hover:bg-gray-600 text-gray-700 os-dark:text-gray-200 transition-colors"
                @click=${() => {
                  state.dark = !state.dark;
                  notify();
                }}
              >
                ${state.dark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </header>

        <div class="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          ${personAvatarSection(person)}
          ${avatarStackSection()}
          ${memberItemSection(person)}
          ${memberCardSection()}
          ${sidebarSection()}
          ${eventCardSection()}
          ${notificationItemSection()}
          ${modalSection()}
          ${confirmDialogSection()}
          ${formControlsSection()}
          ${appButtonSection()}
          ${uiBasicsSection()}
          ${cardsSection()}
          ${fundChartSection()}
          ${fundSummarySection()}
          ${fundTransactionsTableSection()}
          ${calendarSection()}
        </div>
        </i18n-provider>
      </div>
    `,
    document.getElementById('playground')!,
  );
}

let osDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', (e) => {
    osDark = e.matches;
    applyTheme();
    renderPlayground();
  });

function applyTheme() {
  document.documentElement.classList.toggle('os-dark', osDark);
}

applyTheme();
subscribe(renderPlayground);
renderPlayground();
