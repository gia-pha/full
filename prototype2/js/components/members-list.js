import { calculateRelationship, getVietnameseHonorific } from '../utils/honorifics.js';

class MembersListComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.query = '';
    this.render();
    this.bindEvents();
  }

  render() {
    const members = this.store.getClanMembers(this.store.state.currentClanId);
    const current = this.store.getCurrentPerson();
    const allPersons = this.store.state.data?.persons || [];
    const filtered = this.query ? members.filter(m => (m.data['first name'] + ' ' + m.data['last name']).toLowerCase().includes(this.query.toLowerCase())) : members;
    const sorted = filtered.map(m => { const rel = calculateRelationship(current, m, allPersons); return { ...m, rel, honorific: getVietnameseHonorific(rel, current, m, this.t), dist: rel?.distance || 99 }; }).sort((a, b) => a.dist - b.dist);

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-heritage-cream">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-1 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
            <h2 class="text-xl sm:text-2xl font-bold font-serif text-gray-800">${this.t.app.sidebar.members}</h2>
          </div>
          <div class="relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" class="members-search w-full pl-12 pr-4 lg:px-5 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-amber-50/30" placeholder="${this.t.tree.search}" value="${this.query}" />
          </div>
        </div>
        <div class="p-4 sm:p-6 lg:p-8">
          <p class="text-sm text-gray-400 mb-4">${filtered.length} ${this.t.member.count}</p>
          <div class="space-y-3">
            ${sorted.map(m => { const fullName = m.data['first name'] + ' ' + m.data['last name']; return `
              <button class="member-item w-full text-left heritage-card p-4 lg:p-5 hover:shadow-md transition-all ${m.id === current?.id ? 'border-purple-300 bg-purple-50/50' : ''}" data-id="${m.id}">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${m.data.gender === 'M' ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600' : 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600'} flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm">${fullName.split(' ').pop()?.charAt(0)}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-800 text-base truncate">${fullName}</span>
                      ${m.id === current?.id ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium flex-shrink-0">${this.t.member.you}</span>` : ''}
                      ${m.data['death year'] ? '<span class="text-gray-400 flex-shrink-0">✝</span>' : ''}
                    </div>
                    <div class="flex items-center gap-3 mt-1">
                      ${m.honorific ? `<span class="text-xs text-purple-600 font-medium">${m.honorific}</span>` : ''}
                      <span class="text-xs text-gray-400">${m.data.birthday}${m.data['death year'] ? '-' + m.data['death year'] : ''}</span>
                      <span class="text-xs text-gray-400">${this.t.tree.generation} ${m.data.generation}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${this.roleClass(m.data.role)}">${this.t.admin.roles[m.data.role]}</span>
                    ${m.dist > 3 && m.id !== current?.id ? '<span class="text-gray-400">🔒</span>' : ''}
                  </div>
                </div>
              </button>
            `; }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  roleClass(r) { return { admin: 'bg-red-100 text-red-700', treasurer: 'bg-amber-100 text-amber-700', editor: 'bg-blue-100 text-blue-700', member: 'bg-gray-100 text-gray-600' }[r] || 'bg-gray-100 text-gray-600'; }

  bindEvents() {
    this.container.querySelector('.members-search')?.addEventListener('input', e => { this.query = e.target.value; this.render(); this.bindEvents(); });
    this.container.querySelectorAll('.member-item').forEach(i => i.addEventListener('click', () => { this.store.setSelectedPerson(i.dataset.id); this.store.setCurrentPage('tree'); }));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { MembersListComponent };
