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

    // Generate QR code URL (using a public QR API)
    const qrData = `https://gia-pha.app/join/${inviteCode}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.invite.title}</h2>
        </div>
        <div class="p-4 sm:p-6 lg:p-8 space-y-8">
          <div class="text-center bg-emerald-50 border border-emerald-200 rounded-2xl p-6 lg:p-8 max-w-lg mx-auto">
            <h3 class="font-bold text-emerald-800 text-lg mb-2">QR Code loi moi</h3>
            <p class="text-sm text-emerald-600 mb-6">Cho thanh vien moi quet QR code de tham gia ho toc</p>
            <div class="inline-block bg-white p-4 rounded-2xl shadow-lg">
              <img src="${qrUrl}" alt="QR Code" class="w-48 h-48" />
            </div>
            <div class="mt-6 flex gap-3 justify-center">
              <button class="invite-copy px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">📋 Sao chep link</button>
              <button class="invite-share px-5 py-2.5 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-600 rounded-xl text-sm font-medium transition-colors">📤 Chia se</button>
            </div>
          </div>
          <div class="max-w-2xl mx-auto">
            <h3 class="font-bold text-gray-700 text-lg mb-4">Lich su loi moi</h3>
            ${invites.length === 0 ? '<div class="text-center py-12 text-gray-400"><p class="text-base">Chua co ai tham gia tuong QR code</p></div>' : `<div class="space-y-3">${invites.map(inv => `
              <div class="flex items-center justify-between p-5 bg-gray-50 rounded-xl">
                <div>
                  <p class="font-semibold text-gray-700">${inv.name}</p>
                  <p class="text-sm text-gray-400 mt-1">Tham gia ${formatDate(inv.date)}</p>
                </div>
                <span class="px-4 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">Da tham gia</span>
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
      alert('Da sao chep link!');
    });
    this.container.querySelector('.invite-share')?.addEventListener('click', () => {
      const clan = this.store.getCurrentClan();
      const link = `https://gia-pha.app/join/${clan?.id || ''}`;
      if (navigator.share) {
        navigator.share({ title: 'Loi moi tham gia ho toc', url: link });
      } else {
        alert('Chinh nang chia se khong duoc ho tro');
      }
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { InviteComponent };
