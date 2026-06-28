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
      <div class="h-full overflow-y-auto bg-heritage-cream">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 bg-white">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-1 h-8 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
              <div>
                <h2 class="text-xl sm:text-2xl font-bold font-serif text-gray-800">${clan.name}</h2>
                <p class="text-sm text-gray-500 mt-1">${this.t.clan.lineage[clan.lineage]}</p>
              </div>
            </div>
            ${(this.store.getCurrentPerson()?.data.role === 'editor' || this.store.getCurrentPerson()?.data.role === 'admin') ? `<button class="clan-edit-btn px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium flex-shrink-0 transition-all shadow-md shadow-purple-200">✏️ ${this.t.clan.editClan}</button>` : ''}
          </div>
        </div>
        <div class="p-4 sm:p-6 lg:p-8 space-y-6">
          <div class="heritage-card p-4 lg:p-6">
            <h3 class="text-lg font-semibold font-serif text-gray-700 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              ${this.t.clan.history}
            </h3>
            <p class="text-gray-600 leading-relaxed">${clan.history}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${this.statCard('📍', this.t.clan.origin, clan.origin, 'blue')}
            ${this.statCard('🕯️', this.t.clan.memorialDate, clan.memorialDate, 'amber')}
            ${this.statCard('🏠', this.t.clan.clanHouse, clan.clanHouse, 'green', 'sm:col-span-2')}
            ${this.statCard('🏘️', this.t.clan.village, clan.village, 'purple', 'sm:col-span-2')}
          </div>
          ${notable.length > 0 ? `
            <div>
              <h3 class="text-lg font-semibold font-serif text-gray-700 mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ${this.t.clan.notableFigures}
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${notable.map(f => `
                  <div class="heritage-card p-4 border-amber-200 bg-amber-50/50">
                    <div class="flex items-start gap-4">
                      <div class="w-12 h-12 bg-gradient-to-br from-amber-200 to-yellow-300 rounded-full flex items-center justify-center text-xl flex-shrink-0 shadow-sm">⭐</div>
                      <div class="min-w-0">
                        <button class="clan-member-link font-semibold text-amber-800 hover:text-amber-900" data-id="${f.person.id}">${f.person.data['first name'] + ' ' + f.person.data['last name']}</button>
                        <p class="text-sm text-amber-600 mt-1">${f.achievement}</p>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
          ${clan.images?.length > 0 ? `
            <div>
              <h3 class="text-lg font-semibold font-serif text-gray-700 mb-4">📷 ${this.t.clan.images}</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                ${clan.images.map(img => `<div class="aspect-video bg-gray-100 rounded-xl overflow-hidden shadow-sm"><img src="${img}" alt="" class="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" /></div>`).join('')}
              </div>
            </div>
          ` : ''}
          <div class="heritage-card p-4 lg:p-6">
            <p class="text-sm text-gray-400 mb-2">${this.t.clan.publicUrl}</p>
            <div class="flex items-center gap-3">
              <code class="flex-1 text-sm text-gray-600 bg-white px-4 py-3 rounded-lg border border-gray-200 truncate">${clan.publicPageUrl}</code>
              <button class="clan-copy-link px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium flex-shrink-0 transition-all shadow-md shadow-purple-200">📋 ${this.t.clan.copyLink}</button>
            </div>
          </div>
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
