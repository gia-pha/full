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
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${clan.name}</h2>
          <p class="text-xs sm:text-sm text-gray-500 mt-1">${this.t.clan.lineage[clan.lineage]}</p>
        </div>
        <div class="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">📜 ${this.t.clan.history}</h3>
            <p class="text-gray-600 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-lg text-sm">${clan.history}</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
            ${this.statCard('📍', this.t.clan.origin, clan.origin, 'blue')}
            ${this.statCard('🕯️', this.t.clan.memorialDate, clan.memorialDate, 'amber')}
            ${this.statCard('🏠', this.t.clan.clanHouse, clan.clanHouse, 'green', 'col-span-2')}
            ${this.statCard('🏘️', this.t.clan.village, clan.village, 'purple', 'col-span-2')}
          </div>
          ${notable.length > 0 ? `
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-3">⭐ ${this.t.clan.notableFigures}</h3>
              <div class="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3">
                ${notable.map(f => `
                  <div class="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div class="w-10 h-10 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">⭐</div>
                    <div class="min-w-0">
                      <button class="clan-member-link font-medium text-yellow-800 text-sm active:opacity-70" data-id="${f.person.id}">${f.person.name}</button>
                      <p class="text-xs text-yellow-600 mt-0.5 truncate">${f.achievement}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${clan.images?.length > 0 ? `
            <div>
              <h3 class="text-base sm:text-lg font-semibold text-gray-700 mb-3">📷 ${this.t.clan.images}</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                ${clan.images.map(img => `
                  <div class="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src="${img}" alt="" class="w-full h-full object-cover active:scale-105 transition-transform" loading="lazy" />
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          <div class="bg-gray-50 rounded-lg p-3 sm:p-4 border">
            <p class="text-xs text-gray-400 mb-2">${this.t.clan.publicUrl}</p>
            <div class="flex items-center gap-2">
              <code class="flex-1 text-xs text-gray-600 bg-white px-3 py-2 rounded border truncate">${clan.publicPageUrl}</code>
              <button class="clan-copy-link px-3 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-xs font-medium flex-shrink-0">📋</button>
            </div>
          </div>
          ${(this.store.getCurrentPerson()?.role === 'editor' || this.store.getCurrentPerson()?.role === 'admin') ? `
            <button class="clan-edit-btn w-full py-3 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg font-medium text-sm">✏️ Chinh sua thong tin</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  statCard(icon, label, value, color, extra = '') {
    const colors = {
      blue: 'bg-blue-50 border-blue-100 text-blue-800',
      amber: 'bg-amber-50 border-amber-100 text-amber-800',
      green: 'bg-green-50 border-green-100 text-green-800',
      purple: 'bg-purple-50 border-purple-100 text-purple-800'
    };
    return `
      <div class="rounded-lg p-3 border ${colors[color] || colors.blue} ${extra}">
        <p class="text-xs opacity-70 mb-1">${icon} ${label}</p>
        <p class="font-medium text-sm leading-snug">${value}</p>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.clan-member-link').forEach(link => {
      link.addEventListener('click', () => {
        this.store.setSelectedPerson(link.dataset.id);
        this.store.setCurrentPage('tree');
      });
    });
    const copyBtn = this.container.querySelector('.clan-copy-link');
    copyBtn?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.store.getCurrentClan().publicPageUrl);
      copyBtn.textContent = '✓';
      setTimeout(() => copyBtn.textContent = '📋', 2000);
    });
    this.container.querySelector('.clan-edit-btn')?.addEventListener('click', () => {
      this.store.openModal('edit-clan', this.store.getCurrentClan());
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { ClanInfoComponent };
