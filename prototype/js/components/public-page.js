import { GpComponent } from './base.js';

class GpPublicPage extends GpComponent {
  render() {
    const clan = this.store.getCurrentClan();
    if (!clan) return;
    const allPersons = this.store.state.data?.persons || [];
    const upcoming = this.store.getClanEvents(clan.id).filter(e => e.status === 'upcoming');
    const notable = (clan.notableFigures || []).map(f => ({ ...f, person: allPersons.find(p => p.id === f.id) })).filter(f => f.person);

    this.innerHTML = `
      <div class="min-h-screen bg-white">
        <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"><div class="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24"><h1 class="text-3xl lg:text-5xl font-bold mb-4">${clan.name}</h1><p class="text-emerald-100 text-base lg:text-lg leading-relaxed max-w-2xl">${clan.history}</p><div class="flex flex-wrap gap-6 lg:gap-8 mt-6 lg:mt-8 text-sm lg:text-base"><div><span class="text-emerald-200">${this.t.clan.origin}:</span> <span class="ml-2 font-medium">${clan.origin}</span></div><div><span class="text-emerald-200">${this.t.clan.memorialDate}:</span> <span class="ml-2 font-medium">${clan.memorialDate}</span></div></div></div></div>
        <div class="max-w-4xl mx-auto px-6 lg:px-8 py-12 lg:py-16 space-y-12 lg:space-y-16">
          ${notable.length > 0 ? `<section><h2 class="text-2xl font-bold text-gray-800 mb-6">${this.t.publicPage.notableFigures}</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">${notable.map(f => `<div class="flex items-start gap-4 p-5 lg:p-6 bg-yellow-50 rounded-2xl border border-yellow-100"><div class="w-12 h-12 lg:w-14 lg:h-14 bg-yellow-200 rounded-full flex items-center justify-center text-xl lg:text-2xl flex-shrink-0">⭐</div><div><h3 class="font-bold text-gray-800 text-lg">${f.person.data['first name'] + ' ' + f.person.data['last name']}</h3><p class="text-sm lg:text-base text-gray-600 mt-1">${f.achievement}</p><p class="text-xs text-gray-400 mt-1">${f.person.data.birthday}${f.person.data['death year'] ? ' - ' + f.person.data['death year'] : ''}</p></div></div>`).join('')}</div></section>` : ''}
          ${clan.images?.length > 0 ? `<section><h2 class="text-2xl font-bold text-gray-800 mb-6">${this.t.publicPage.images}</h2><div class="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">${clan.images.map(img => `<div class="aspect-video bg-gray-100 rounded-2xl overflow-hidden"><img src="${img}" class="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" /></div>`).join('')}</div></section>` : ''}
          ${upcoming.length > 0 ? `<section><h2 class="text-2xl font-bold text-gray-800 mb-6">${this.t.publicPage.upcomingEvents}</h2><div class="space-y-4">${upcoming.map(e => `<div class="flex items-start gap-4 p-5 lg:p-6 bg-gray-50 rounded-2xl border border-gray-200"><div class="w-14 h-14 lg:w-16 lg:h-16 bg-emerald-100 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"><span class="text-xs text-emerald-600 font-medium">${new Date(e.date).toLocaleString('vi-VN', { month: 'short' })}</span><span class="text-xl lg:text-2xl font-bold text-emerald-700 leading-none">${new Date(e.date).getDate()}</span></div><div class="min-w-0"><h3 class="font-bold text-gray-800 text-lg">${e.title}</h3><p class="text-sm lg:text-base text-gray-600 mt-1">${e.description}</p><div class="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400"><span>📅 ${new Date(e.date).toLocaleDateString('vi-VN')}</span><span>📍 ${e.location}</span></div></div></div>`).join('')}</div></section>` : ''}
          <section class="text-center py-8"><div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 lg:p-12 text-white"><h2 class="text-2xl lg:text-3xl font-bold mb-3">${this.t.publicPage.joinClan}</h2><p class="text-emerald-100 mb-6 lg:mb-8 text-base lg:text-lg">Ban la thanh vien ho toc? Dang ky de truy cap toan bo chuc nang.</p><button class="public-join px-10 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-base hover:bg-emerald-50 transition-colors">→ ${this.t.auth.register}</button></div></section>
        </div>
        <footer class="bg-gray-50 border-t border-gray-200 py-6 text-center text-sm text-gray-400">${clan.name} &copy; ${new Date().getFullYear()}</footer>
      </div>
    `;
  }

  bindEvents() {
    this.querySelector('.public-join')?.addEventListener('click', () => this.store.setCurrentPage('auth'));
  }
}

customElements.define('gp-public-page', GpPublicPage);
export { GpPublicPage };
