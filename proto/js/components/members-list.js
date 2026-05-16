import { calculateRelationship, getVietnameseHonorific } from '../utils/honorifics.js';
import { store } from '../store.js';

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
    const allPersons = store.state.data?.persons || [];
    const filtered = this.query ? members.filter(m => m.name.toLowerCase().includes(this.query.toLowerCase())) : members;
    const sorted = filtered.map(m => {
      const rel = calculateRelationship(current, m, allPersons);
      return { ...m, rel, honorific: getVietnameseHonorific(rel, current, m), dist: rel?.distance || 99 };
    }).sort((a, b) => a.dist - b.dist);

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800 mb-3">${this.t.app.sidebar.members}</h2>
          <input type="text" class="members-search w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="${this.t.tree.search}" value="${this.query}" />
        </div>
        <div class="p-4 sm:p-6">
          <p class="text-xs text-gray-400 mb-3">${filtered.length} thanh vien</p>
          <div class="space-y-2">
            ${sorted.map(m => `
              <button class="member-item w-full text-left p-3 rounded-xl border border-gray-200 active:border-emerald-300 active:bg-emerald-50 transition ${m.id === current?.id ? 'bg-emerald-50 border-emerald-300' : 'bg-white'}" data-id="${m.id}">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full ${m.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'} flex items-center justify-center text-sm font-bold flex-shrink-0">${m.name.split(' ').pop()?.charAt(0)}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="font-medium text-gray-800 text-sm truncate">${m.name}</span>
                      ${m.id === current?.id ? `<span class="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full flex-shrink-0">Ban</span>` : ''}
                      ${m.deathYear ? '<span class="text-gray-400 text-xs flex-shrink-0">✝</span>' : ''}
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      ${m.honorific ? `<span class="text-[10px] text-emerald-600 font-medium">${m.honorific}</span>` : ''}
                      <span class="text-[10px] text-gray-400">${m.birthYear}${m.deathYear ? '-' + m.deathYear : ''}</span>
                      <span class="text-[10px] text-gray-400">The ${m.generation}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5 flex-shrink-0">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${this.roleClass(m.role)}">${this.t.admin.roles[m.role]}</span>
                    ${m.dist > 3 && m.id !== current?.id ? '<span class="text-gray-400 text-xs">🔒</span>' : ''}
                  </div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  roleClass(role) {
    return { admin: 'bg-red-100 text-red-700', treasurer: 'bg-amber-100 text-amber-700', editor: 'bg-blue-100 text-blue-700', member: 'bg-gray-100 text-gray-600' }[role] || 'bg-gray-100 text-gray-600';
  }

  bindEvents() {
    const input = this.container.querySelector('.members-search');
    input?.addEventListener('input', e => { this.query = e.target.value; this.render(); this.bindEvents(); });
    this.container.querySelectorAll('.member-item').forEach(item => {
      item.addEventListener('click', () => { this.store.setSelectedPerson(item.dataset.id); this.store.setCurrentPage('tree'); });
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { MembersListComponent };
