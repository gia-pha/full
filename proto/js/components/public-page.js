class PublicPageComponent {
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
    const upcoming = this.store.getClanEvents(clan.id).filter(e => e.status === 'upcoming');
    const notable = (clan.notableFigures || []).map(f => ({ ...f, person: allPersons.find(p => p.id === f.id) })).filter(f => f.person);

    this.container.innerHTML = `
      <div class="min-h-screen bg-white">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <h1 class="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">${clan.name}</h1>
            <p class="text-emerald-100 text-sm sm:text-lg leading-relaxed">${clan.history}</p>
            <div class="flex flex-wrap gap-4 sm:gap-6 mt-4 sm:mt-6 text-xs sm:text-sm">
              <div><span class="text-emerald-200">${this.t.clan.origin}:</span> <span class="ml-1.5 font-medium">${clan.origin}</span></div>
              <div><span class="text-emerald-200">${this.t.clan.memorialDate}:</span> <span class="ml-1.5 font-medium">${clan.memorialDate}</span></div>
            </div>
          </div>
        </div>
        <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 pb-20">
          ${notable.length > 0 ? `
            <section>
              <h2 class="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">${this.t.publicPage.notableFigures}</h2>
              <div class="space-y-3 sm:grid sm:grid-cols-2 sm:gap-4">
                ${notable.map(f => `
                  <div class="flex items-start gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <div class="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0">⭐</div>
                    <div class="min-w-0">
                      <h3 class="font-semibold text-gray-800 text-sm">${f.person.name}</h3>
                      <p class="text-xs sm:text-sm text-gray-600 mt-0.5">${f.achievement}</p>
                      <p class="text-[10px] text-gray-400 mt-0.5">${f.person.birthYear}${f.person.deathYear ? ' - ' + f.person.deathYear : ''}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
          ${clan.images?.length > 0 ? `
            <section>
              <h2 class="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">${this.t.publicPage.images}</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                ${clan.images.map(img => `<div class="aspect-video bg-gray-100 rounded-xl overflow-hidden"><img src="${img}" class="w-full h-full object-cover active:scale-105 transition-transform" loading="lazy" /></div>`).join('')}
              </div>
            </section>
          ` : ''}
          ${upcoming.length > 0 ? `
            <section>
              <h2 class="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">${this.t.publicPage.upcomingEvents}</h2>
              <div class="space-y-3">
                ${upcoming.map(e => `
                  <div class="flex items-start gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border">
                    <div class="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-100 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span class="text-[10px] text-emerald-600 font-medium">${new Date(e.date).toLocaleString('vi-VN', { month: 'short' })}</span>
                      <span class="text-base sm:text-lg font-bold text-emerald-700 leading-none">${new Date(e.date).getDate()}</span>
                    </div>
                    <div class="min-w-0">
                      <h3 class="font-semibold text-gray-800 text-sm">${e.title}</h3>
                      <p class="text-xs text-gray-600 mt-0.5 line-clamp-2">${e.description}</p>
                      <div class="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 text-[10px] sm:text-xs text-gray-400">
                        <span>📅 ${new Date(e.date).toLocaleDateString('vi-VN')}</span>
                        <span>📍 ${e.location}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
          <section class="text-center py-4">
            <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 sm:p-8 text-white">
              <h2 class="text-lg sm:text-2xl font-bold mb-2">${this.t.publicPage.joinClan}</h2>
              <p class="text-emerald-100 mb-4 sm:mb-6 text-sm">Ban la thanh vien ho toc? Dang ky de truy cap toan bo chuc nang.</p>
              <button class="public-join px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-emerald-700 rounded-xl font-semibold text-sm active:bg-emerald-50 transition">→ ${this.t.auth.register}</button>
            </div>
          </section>
        </div>
        <footer class="bg-gray-50 border-t py-4 text-center text-xs text-gray-400">${clan.name} &copy; ${new Date().getFullYear()}</footer>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.public-join')?.addEventListener('click', () => this.store.setCurrentPage('auth'));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { PublicPageComponent };
