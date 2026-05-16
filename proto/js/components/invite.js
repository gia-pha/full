import { formatDate } from '../utils/format.js';

class InviteComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.render();
    this.bindEvents();
  }

  render() {
    const invites = (this.store.state.data?.invitations || []).filter(i => i.clanId === this.store.state.currentClanId);

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.invite.title}</h2>
        </div>
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 class="font-semibold text-emerald-800 text-sm mb-3">Gui loi moi moi</h3>
            <div class="space-y-3">
              <div>
                <label class="text-xs text-emerald-600">${this.t.invite.email}</label>
                <input type="email" class="invite-email w-full mt-1 px-4 py-2.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@example.com" />
              </div>
              <div>
                <label class="text-xs text-emerald-600">${this.t.invite.message}</label>
                <textarea class="invite-msg w-full mt-1 px-4 py-2.5 border border-emerald-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" rows="3" placeholder="Nhan dep..."></textarea>
              </div>
              <button class="invite-send px-6 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-medium">📨 ${this.t.invite.send}</button>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-gray-700 text-sm mb-3">Lich su loi moi</h3>
            ${invites.length === 0 ? '<div class="text-center py-8 text-gray-400 text-sm">Chua co loi moi</div>' : `
              <div class="space-y-2">
                ${invites.map(inv => `
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p class="font-medium text-gray-700 text-sm">${inv.email}</p>
                      <p class="text-xs text-gray-400">${formatDate(inv.date)}</p>
                    </div>
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-medium ${inv.status === 'pending' ? 'bg-amber-100 text-amber-700' : inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}">${inv.status === 'pending' ? 'Dang cho' : inv.status === 'accepted' ? 'Da chap nhan' : 'Da gui'}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.invite-send')?.addEventListener('click', () => {
      const email = this.container.querySelector('.invite-email')?.value;
      if (!email || !email.includes('@')) return alert('Nhap email hop le');
      alert(`Da gui loi moi den ${email} (prototype)`);
      this.container.querySelector('.invite-email').value = '';
      this.container.querySelector('.invite-msg').value = '';
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { InviteComponent };
