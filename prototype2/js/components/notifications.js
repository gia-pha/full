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
    const prefs = this.store.getCurrentPerson()?.data.notificationPreferences || {};
    const icons = { fund_change: '💰', new_event: '📅', memorial_reminder: '🕯️', member_joins: '👤' };

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-heritage-cream">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 flex items-center justify-between bg-white">
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
            <h2 class="text-xl sm:text-2xl font-bold font-serif text-gray-800">${this.t.notifications.title}</h2>
          </div>
          <div class="flex gap-3">
            <button class="notif-all-read px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium transition-colors">${this.t.notifications.markAllRead}</button>
            <button class="notif-prefs-btn px-4 py-2 ${this.showPrefs ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' : 'bg-white hover:bg-gray-50 border border-gray-200'} rounded-lg text-sm font-medium transition-all">⚙️ ${this.t.notifications.preferences}</button>
          </div>
        </div>
        ${this.showPrefs ? `
          <div class="px-4 sm:px-6 lg:px-8 py-5 bg-purple-50 border-b border-purple-100">
            <div class="max-w-lg space-y-4">${[
              { key: 'fundChanges', label: this.t.notifications.fundChanges },
              { key: 'newEvents', label: this.t.notifications.newEvents },
              { key: 'memberJoins', label: this.t.notifications.memberJoins },
              { key: 'memorialDates', label: this.t.notifications.memorialDates }
            ].map(p => `<label class="flex items-center justify-between cursor-pointer py-2"><span class="text-gray-700">${p.label}</span><input type="checkbox" class="toggle notif-pref" data-pref="${p.key}" ${prefs[p.key] ? 'checked' : ''} /></label>`).join('')}
            </div>
          </div>
        ` : ''}
        <div class="p-4 sm:p-6 lg:p-8">
          ${notifs.length === 0 ? '<div class="text-center py-16 text-gray-400"><div class="text-5xl mb-4">🔕</div><p class="text-base">Khong co thong bao</p></div>' : `
            <div class="space-y-3 max-w-3xl">
              ${notifs.map(n => `
                <div class="heritage-card flex items-start gap-4 p-4 lg:p-5 ${n.read ? '' : 'border-purple-200 bg-purple-50/30'}">
                  <div class="text-2xl flex-shrink-0 mt-0.5">${icons[n.type] || '📌'}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-3">
                      <h4 class="font-semibold text-gray-800 truncate">${n.title}</h4>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <span class="text-xs text-gray-400">${formatDate(n.date)}</span>
                        ${!n.read ? '<span class="w-2.5 h-2.5 bg-purple-500 rounded-full"></span>' : ''}
                        <button class="notif-delete p-1 text-gray-300 hover:text-red-500 transition-colors" data-id="${n.id}">✕</button>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1 leading-relaxed">${n.message}</p>
                    ${!n.read ? `<button class="notif-mark-read mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium" data-id="${n.id}">${this.t.notifications.markRead}</button>` : ''}
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
    this.container.querySelectorAll('.notif-pref').forEach(t => t.addEventListener('change', e => store.setNotificationPreferences({ [e.target.dataset.pref]: e.target.checked })));
    this.container.querySelectorAll('.notif-mark-read').forEach(b => b.addEventListener('click', () => this.store.markNotificationRead(b.dataset.id)));
    this.container.querySelectorAll('.notif-delete').forEach(b => b.addEventListener('click', () => this.store.deleteNotification(b.dataset.id)));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { NotificationsComponent };
