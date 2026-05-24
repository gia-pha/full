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
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-4">${this.t.app.sidebar.members}</h2>
          <input type="text" class="members-search w-full px-4 lg:px-5 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="${this.t.tree.search}" value="${this.query}" />
        </div>
        <div class="p-4 sm:p-6 lg:p-8">
          <p class="text-sm text-gray-400 mb-4">${filtered.length} ${this.t.member.count}</p>
          <div class="space-y-3">
            ${sorted.map(m => { const fullName = m.data['first name'] + ' ' + m.data['last name']; return `
              <button class="member-item w-full text-left p-4 lg:p-5 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all ${m.id === current?.id ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}" data-id="${m.id}">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 lg:w-14 lg:h-14 rounded-full ${m.data.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'} flex items-center justify-center text-lg font-bold flex-shrink-0">${fullName.split(' ').pop()?.charAt(0)}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-semibold text-gray-800 text-base truncate">${fullName}</span>
                      ${m.id === current?.id ? `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium flex-shrink-0">${this.t.member.you}</span>` : ''}
                      ${m.data['death year'] ? '<span class="text-gray-400 flex-shrink-0">✝</span>' : ''}
                    </div>
                    <div class="flex items-center gap-3 mt-1">
                      ${m.honorific ? `<span class="text-xs text-emerald-600 font-medium">${m.honorific}</span>` : ''}
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
