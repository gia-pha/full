class ClanInfoComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.render();
    this.bindEvents();
  }

  render() {
    const clan = this.store.getCurrentClan();
    if (!clan) return;
    const allPersons = this.store.state.data?.persons || [];
    const notable = (clan.notableFigures || []).map(f => ({ ...f, person: allPersons.find(p => p.id === f.id) })).filter(f => f.person);

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${clan.name}</h2>
          <p class="text-sm text-gray-500 mt-1">${this.t.clan.lineage[clan.lineage]}</p>
        </div>
        <div class="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">📜 ${this.t.clan.history}</h3>
            <p class="text-gray-600 leading-relaxed bg-gray-50 p-4 lg:p-6 rounded-xl">${clan.history}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${this.statCard('📍', this.t.clan.origin, clan.origin, 'blue')}
            ${this.statCard('🕯️', this.t.clan.memorialDate, clan.memorialDate, 'amber')}
            ${this.statCard('🏠', this.t.clan.clanHouse, clan.clanHouse, 'green', 'sm:col-span-2')}
            ${this.statCard('🏘️', this.t.clan.village, clan.village, 'purple', 'sm:col-span-2')}
          </div>
          ${notable.length > 0 ? `
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4">⭐ ${this.t.clan.notableFigures}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${notable.map(f => `
                  <div class="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div class="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center text-xl flex-shrink-0">⭐</div>
                    <div class="min-w-0">
                      <button class="clan-member-link font-semibold text-yellow-800 hover:text-yellow-900" data-id="${f.person.id}">${f.person.name}</button>
                      <p class="text-sm text-yellow-600 mt-1">${f.achievement}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${clan.images?.length > 0 ? `
            <div>
              <h3 class="text-lg font-semibold text-gray-700 mb-4">📷 ${this.t.clan.images}</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                ${clan.images.map(img => `<div class="aspect-video bg-gray-100 rounded-xl overflow-hidden"><img src="${img}" alt="" class="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" /></div>`).join('')}
              </div>
            </div>
          ` : ''}
          <div class="bg-gray-50 rounded-xl p-4 lg:p-6 border border-gray-200">
            <p class="text-sm text-gray-400 mb-2">${this.t.clan.publicUrl}</p>
            <div class="flex items-center gap-3">
              <code class="flex-1 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg border border-gray-200 truncate">${clan.publicPageUrl}</code>
              <button class="clan-copy-link px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex-shrink-0 transition-colors">📋 ${this.t.clan.copyLink}</button>
            </div>
          </div>
          ${(this.store.getCurrentPerson()?.role === 'editor' || this.store.getCurrentPerson()?.role === 'admin') ? `
            <button class="clan-edit-btn w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-colors">✏️ Chinh sua thong tin ho toc</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  statCard(icon, label, value, color, extra = '') {
    const colors = { blue: 'bg-blue-50 border-blue-200', amber: 'bg-amber-50 border-amber-200', green: 'bg-green-50 border-green-200', purple: 'bg-purple-50 border-purple-200' };
    return `<div class="rounded-xl p-4 lg:p-5 border ${colors[color]} ${extra}"><p class="text-sm text-gray-500 mb-2">${icon} ${label}</p><p class="font-semibold text-gray-800 text-base leading-snug">${value}</p></div>`;
  }

  bindEvents() {
    this.container.querySelectorAll('.clan-member-link').forEach(l => l.addEventListener('click', () => { this.store.setSelectedPerson(l.dataset.id); this.store.setCurrentPage('tree'); }));
    this.container.querySelector('.clan-copy-link')?.addEventListener('click', function(btn) {
      navigator.clipboard.writeText(this.store.getCurrentClan().publicPageUrl);
      btn.textContent = '✓ Da sao chep!';
      setTimeout(() => btn.textContent = '📋 Sao chep link', 2000);
    }.bind(this));
    this.container.querySelector('.clan-edit-btn')?.addEventListener('click', () => this.store.openModal('edit-clan', this.store.getCurrentClan()));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { ClanInfoComponent };
