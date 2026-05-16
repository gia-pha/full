import { formatDate } from '../utils/format.js';
import { store } from '../store.js';

class NotificationsComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.showPrefs = false;
    this.render();
    this.bindEvents();
  }

  render() {
    const notifs = this.store.state.notifications;
    const prefs = this.store.getCurrentPerson()?.notificationPreferences || {};
    const icons = { fund_change: '💰', new_event: '📅', memorial_reminder: '🕯️', member_joins: '👤' };

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.notifications.title}</h2>
          <div class="flex gap-2">
            <button class="notif-all-read px-3 py-1.5 bg-gray-100 active:bg-gray-200 rounded-lg text-xs font-medium">Da doc tat ca</button>
            <button class="notif-prefs-btn px-3 py-1.5 ${this.showPrefs ? 'bg-emerald-600 text-white' : 'bg-gray-100 active:bg-gray-200'} rounded-lg text-xs font-medium">⚙️</button>
          </div>
        </div>
        ${this.showPrefs ? `
          <div class="px-4 sm:px-6 py-4 bg-gray-50 border-b">
            <p class="font-medium text-gray-700 text-sm mb-3">${this.t.notifications.preferences}</p>
            <div class="space-y-3">
              ${[
                { key: 'fundChanges', label: this.t.notifications.fundChanges },
                { key: 'newEvents', label: this.t.notifications.newEvents },
                { key: 'memberJoins', label: this.t.notifications.memberJoins },
                { key: 'memorialDates', label: this.t.notifications.memorialDates }
              ].map(p => `
                <label class="flex items-center justify-between cursor-pointer">
                  <span class="text-sm text-gray-600">${p.label}</span>
                  <input type="checkbox" class="toggle notif-pref" data-pref="${p.key}" ${prefs[p.key] ? 'checked' : ''} />
                </label>
              `).join('')}
            </div>
          </div>
        ` : ''}
        <div class="p-4 sm:p-6">
          ${notifs.length === 0 ? '<div class="text-center py-12 text-gray-400"><div class="text-4xl mb-3">🔕</div><p class="text-sm">Khong co thong bao</p></div>' : `
            <div class="space-y-2">
              ${notifs.map(n => `
                <div class="flex items-start gap-3 p-3 rounded-xl border ${n.read ? 'bg-white border-gray-100' : 'bg-emerald-50 border-emerald-200'}">
                  <div class="text-lg flex-shrink-0 mt-0.5">${icons[n.type] || '📌'}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <h4 class="font-medium text-gray-800 text-sm truncate">${n.title}</h4>
                      <div class="flex items-center gap-1.5 flex-shrink-0">
                        <span class="text-[10px] text-gray-400">${formatDate(n.date)}</span>
                        ${!n.read ? '<span class="w-2 h-2 bg-emerald-500 rounded-full"></span>' : ''}
                        <button class="notif-delete p-0.5 text-gray-300 active:text-red-500 text-xs" data-id="${n.id}">✕</button>
                      </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-0.5 line-clamp-2">${n.message}</p>
                    ${!n.read ? `<button class="notif-mark-read mt-1.5 text-[10px] text-emerald-600 font-medium" data-id="${n.id}">${this.t.notifications.markRead}</button>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.notif-all-read')?.addEventListener('click', () => this.store.markAllNotificationsRead());
    this.container.querySelector('.notif-prefs-btn')?.addEventListener('click', () => { this.showPrefs = !this.showPrefs; this.render(); this.bindEvents(); });
    this.container.querySelectorAll('.notif-pref').forEach(t => {
      t.addEventListener('change', e => store.setNotificationPreferences({ [e.target.dataset.pref]: e.target.checked }));
    });
    this.container.querySelectorAll('.notif-mark-read').forEach(b => {
      b.addEventListener('click', () => this.store.markNotificationRead(b.dataset.id));
    });
    this.container.querySelectorAll('.notif-delete').forEach(b => {
      b.addEventListener('click', () => this.store.deleteNotification(b.dataset.id));
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { NotificationsComponent };
