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
    const clan = this.store.getCurrentClan();
    const inviteCode = clan ? clan.id : '';

    const qrData = `https://gia-pha.app/join/${inviteCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-heritage-cream">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-3">
            <div class="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
            <h2 class="text-xl sm:text-2xl font-bold font-serif text-gray-800">${this.t.invite.title}</h2>
          </div>
        </div>
        <div class="p-4 sm:p-6 lg:p-8 space-y-8">
          <div class="text-center heritage-card p-6 lg:p-8 max-w-lg mx-auto bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <h3 class="font-bold font-serif text-purple-800 text-lg mb-2">${this.t.invite.qrTitle}</h3>
            <p class="text-sm text-purple-600 mb-6">${this.t.invite.qrDesc}</p>
            <div class="inline-block bg-white p-4 rounded-2xl shadow-lg">
              <img src="${qrUrl}" alt="QR Code" class="w-48 h-48" />
            </div>
            <div class="mt-6 flex gap-3 justify-center">
              <button class="invite-copy px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-purple-200">📋 ${this.t.invite.copyLink}</button>
              <button class="invite-share px-5 py-2.5 bg-white border border-purple-300 hover:bg-purple-50 text-purple-600 rounded-xl text-sm font-medium transition-colors">📤 ${this.t.invite.share}</button>
            </div>
          </div>
          <div class="max-w-2xl mx-auto">
            <h3 class="font-bold font-serif text-gray-700 text-lg mb-4">${this.t.invite.history}</h3>
            ${invites.length === 0 ? `<div class="text-center py-12 text-gray-400"><p class="text-base">${this.t.invite.noInvites}</p></div>` : `<div class="space-y-3">${invites.map(inv => `
              <div class="heritage-card flex items-center justify-between p-5">
                <div>
                  <p class="font-semibold text-gray-700">${inv.name}</p>
                  <p class="text-sm text-gray-400 mt-1">${this.t.invite.joined} ${formatDate(inv.date)}</p>
                </div>
                <span class="px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">${this.t.invite.joinedStatus}</span>
              </div>
            `).join('')}</div>`}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.invite-copy')?.addEventListener('click', () => {
      const clan = this.store.getCurrentClan();
      const link = `https://gia-pha.app/join/${clan?.id || ''}`;
      navigator.clipboard?.writeText(link);
      alert(this.t.invite.copySuccess);
    });
    this.container.querySelector('.invite-share')?.addEventListener('click', () => {
      const clan = this.store.getCurrentClan();
      const link = `https://gia-pha.app/join/${clan?.id || ''}`;
      if (navigator.share) {
        navigator.share({ title: this.t.invite.shareTitle, url: link });
      } else {
        alert(this.t.invite.shareNotSupported);
      }
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { InviteComponent };
