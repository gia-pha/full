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
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.invite.title}</h2>
        </div>
        <div class="p-4 sm:p-6 lg:p-8 space-y-8">
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 lg:p-8 max-w-2xl">
            <h3 class="font-bold text-emerald-800 text-lg mb-4">Gui loi moi moi</h3>
            <div class="space-y-4">
              <div><label class="text-sm text-emerald-600">${this.t.invite.email}</label><input type="email" class="invite-email w-full mt-2 px-5 py-3 border border-emerald-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="email@example.com" /></div>
              <div><label class="text-sm text-emerald-600">${this.t.invite.message}</label><textarea class="invite-msg w-full mt-2 px-5 py-3 border border-emerald-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" rows="4" placeholder="Nhan dep..."></textarea></div>
              <button class="invite-send px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-base font-medium transition-colors">📨 ${this.t.invite.send}</button>
            </div>
          </div>
          <div class="max-w-2xl">
            <h3 class="font-bold text-gray-700 text-lg mb-4">Lich su loi moi</h3>
            ${invites.length === 0 ? '<div class="text-center py-12 text-gray-400"><p class="text-base">Chua co loi moi nao</p></div>' : `<div class="space-y-3">${invites.map(inv => `
              <div class="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                <div><p class="font-semibold text-gray-700">${inv.email}</p><p class="text-sm text-gray-400 mt-1">${formatDate(inv.date)}</p></div>
                <span class="px-4 py-1.5 rounded-full text-sm font-medium ${inv.status === 'pending' ? 'bg-amber-100 text-amber-700' : inv.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}">${inv.status === 'pending' ? 'Dang cho' : inv.status === 'accepted' ? 'Da chap nhan' : 'Da gui'}</span>
              </div>
            `).join('')}</div>`}
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
