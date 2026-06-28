import { calculateRelationship, getVietnameseHonorific } from '../utils/honorifics.js';

class MemberCardComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.render();
    this.bindEvents();
  }

  render() {
    const person = this.store.getSelectedPerson();
    const state = this.store.state;
    const currentPerson = this.store.getCurrentPerson();
    const allPersons = state.data?.persons || [];
    if (!person) { this.container.innerHTML = ''; return; }

    const rel = calculateRelationship(currentPerson, person, allPersons);
    const honorific = getVietnameseHonorific(rel, currentPerson, person, this.t);
    const isClose = rel && rel.distance <= 3;
    const spouse = person.rels.spouses[0] ? allPersons.find(p => p.id === person.rels.spouses[0]) : null;
    const parent = person.rels.parents[0] ? allPersons.find(p => p.id === person.rels.parents[0]) : null;
    const children = (person.rels.children || []).map(id => allPersons.find(p => p.id === id)).filter(Boolean);
    const isDeceased = person.data['death year'] != null;

    this.container.innerHTML = `
      <!-- Mobile: Bottom Sheet -->
      <div class="member-sheet lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col safe-area-bottom border-t border-purple-100" style="transform:translateY(100%)">
        <div class="flex justify-center py-3 border-b sticky top-0 bg-white rounded-t-2xl"><div class="w-10 h-1 bg-gray-300 rounded-full"></div></div>
        <button class="member-close absolute top-3 right-3 w-8 h-8 bg-gray-100 active:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 z-10">✕</button>
        <div class="overflow-y-auto flex-1">${this.renderContent(person, honorific, rel, spouse, parent, children, isClose, isDeceased)}</div>
      </div>
      <div class="member-overlay lg:hidden fixed inset-0 z-30 bg-black/30 hidden"></div>

      <!-- Desktop: Side Panel -->
      <div class="hidden lg:flex flex-col w-[400px] xl:w-[480px] border-l border-gray-200 bg-white h-full flex-shrink-0">
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full"></div>
            <h3 class="font-semibold font-serif text-gray-800">${this.t.member.title}</h3>
          </div>
          <button class="member-close w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 transition-colors">✕</button>
        </div>
        <div class="overflow-y-auto flex-1">${this.renderContent(person, honorific, rel, spouse, parent, children, isClose, isDeceased)}</div>
      </div>
    `;

    requestAnimationFrame(() => {
      const sheet = this.container.querySelector('.member-sheet');
      const overlay = this.container.querySelector('.member-overlay');
      if (sheet && window.innerWidth < 1024) {
        sheet.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1)';
        sheet.style.transform = 'translateY(0)';
        overlay?.classList.remove('hidden');
      }
    });
  }

  renderContent(person, honorific, rel, spouse, parent, children, isClose, isDeceased) {
    return `
      <div class="p-5 lg:p-6 space-y-5">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl ${person.data.gender === 'M' ? 'bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600' : 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600'} flex items-center justify-center text-3xl flex-shrink-0 shadow-md">${person.data.gender === 'M' ? '♂' : '♀'}</div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold font-serif text-gray-800 text-lg lg:text-xl truncate">${person.data['first name'] + ' ' + person.data['last name']}</h2>
            ${honorific ? `<p class="text-purple-600 text-sm font-medium mt-0.5">${this.t.member.honorific}: ${honorific}</p>` : ''}
            <div class="flex items-center gap-2 mt-1.5">
              ${rel?.type === 'self' ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">${this.t.tree.currentPerson}</span>` : ''}
              ${isDeceased ? `<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">✝ ${this.t.tree.deceased}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          ${this.infoCard(this.t.member.birthYear, person.data.birthday || '-', 'blue')}
          ${this.infoCard(this.t.member.gender, person.data.gender === 'M' ? this.t.member.male : this.t.member.female, person.data.gender === 'M' ? 'blue' : 'pink')}
          ${this.infoCard(this.t.member.generation, String(person.data.generation), 'purple')}
          ${this.infoCard(this.t.member.role, this.t.admin.roles[person.data.role] || person.data.role, 'amber')}
        </div>

        ${spouse ? this.relationCard(this.t.member.spouse, spouse, 'pink') : ''}
        ${parent ? this.relationCard(this.t.member.parent, parent, 'blue') : ''}

        ${children.length > 0 ? `
          <div>
            <p class="text-sm text-gray-400 mb-3">${this.t.member.children} (${children.length})</p>
            <div class="space-y-2">${children.map(c => `<button class="member-link w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors" data-id="${c.id}"><span class="text-lg ${c.data.gender === 'M' ? 'text-blue-500' : 'text-pink-500'}">${c.data.gender === 'M' ? '♂' : '♀'}</span><span class="flex-1 text-left font-medium text-gray-700 truncate">${c.data['first name'] + ' ' + c.data['last name']}</span><span class="text-sm text-gray-400">${c.data.birthday}</span></button>`).join('')}</div>
          </div>
        ` : ''}

        ${isClose && person.data.notes ? `<div class="p-4 bg-amber-50 rounded-xl border border-amber-200"><p class="text-xs text-amber-500 mb-1">${this.t.member.notes}</p><p class="text-gray-700">${person.data.notes}</p></div>` : ''}
        ${!isClose && person.id !== this.store.getCurrentPerson()?.id ? `<div class="p-4 bg-gray-100 rounded-xl text-center"><p class="text-sm text-gray-500">🔒 ${this.t.member.limitedAccess}</p></div>` : ''}

        <div class="flex gap-3 pt-2">
          ${(person.data.role === 'editor' || person.data.role === 'admin') ? `<button class="member-edit flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-purple-200">✏️ ${this.t.member.edit}</button>` : ''}
          ${person.id !== this.store.getCurrentPerson()?.id ? `<button class="member-delete px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors">🗑️ ${this.t.member.delete}</button>` : ''}
        </div>
      </div>
    `;
  }

  infoCard(label, value, color) {
    const c = { blue: 'bg-blue-50 border border-blue-100', pink: 'bg-pink-50 border border-pink-100', purple: 'bg-purple-50 border border-purple-100', amber: 'bg-amber-50 border border-amber-100' };
    return `<div class="rounded-xl p-3 lg:p-4 ${c[color]}"><p class="text-xs text-gray-400 mb-1">${label}</p><p class="font-semibold text-gray-800">${value}</p></div>`;
  }

  relationCard(label, person, color) {
    const bc = { pink: 'border-pink-200 bg-pink-50', blue: 'border-blue-200 bg-blue-50' };
    const tc = { pink: 'text-pink-500 text-pink-700', blue: 'text-blue-500 text-blue-700' };
    return `<div class="p-4 rounded-xl border ${bc[color]}"><p class="text-xs ${tc[color].split(' ')[0]} mb-2">${label}</p><button class="member-link font-semibold ${tc[color].split(' ')[1]} hover:underline" data-id="${person.id}">${person.data['first name'] + ' ' + person.data['last name']} (${person.data.birthday}${person.data['death year'] ? ' - ' + person.data['death year'] : ''})</button></div>`;
  }

  bindEvents() {
    this.container.querySelectorAll('.member-close').forEach(b => b.addEventListener('click', () => this.store.setSelectedPerson(null)));
    this.container.querySelector('.member-overlay')?.addEventListener('click', () => this.store.setSelectedPerson(null));
    this.container.querySelectorAll('.member-link').forEach(l => l.addEventListener('click', () => this.store.setSelectedPerson(l.dataset.id)));
    this.container.querySelector('.member-edit')?.addEventListener('click', () => this.store.openModal('edit-person', this.store.getSelectedPerson()));
    this.container.querySelector('.member-delete')?.addEventListener('click', () => { if (confirm('Xoa thanh vien nay?')) this.store.setSelectedPerson(null); });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { MemberCardComponent };
