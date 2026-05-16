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

    if (!person) {
      this.container.innerHTML = '';
      return;
    }

    const rel = calculateRelationship(currentPerson, person, allPersons);
    const honorific = getVietnameseHonorific(rel, currentPerson, person);
    const isClose = rel && rel.distance <= 3;
    const spouse = person.spouseId ? allPersons.find(p => p.id === person.spouseId) : null;
    const parent = person.parentId ? allPersons.find(p => p.id === person.parentId) : null;
    const children = (person.childrenIds || []).map(id => allPersons.find(p => p.id === id)).filter(Boolean);

    this.container.innerHTML = `
      <!-- Mobile: Bottom Sheet -->
      <div class="member-sheet lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white rounded-t-2xl shadow-2xl transform translate-y-full transition-transform duration-300 max-h-[85vh] flex flex-col safe-area-bottom">
        <div class="flex justify-center py-3 border-b sticky top-0 bg-white rounded-t-2xl">
          <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <div class="overflow-y-auto flex-1">
          ${this.renderPersonContent(person, honorific, rel, spouse, parent, children, isClose)}
        </div>
        <button class="member-close lg:hidden absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 z-10">✕</button>
      </div>
      <div class="member-overlay lg:hidden fixed inset-0 z-30 bg-black/30 hidden"></div>

      <!-- Desktop: Side Panel -->
      <div class="hidden lg:flex flex-col w-96 border-l border-gray-200 bg-white h-full">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-semibold text-gray-800 text-sm">${this.t.member.title}</h3>
          <button class="member-close w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">✕</button>
        </div>
        <div class="overflow-y-auto flex-1">
          ${this.renderPersonContent(person, honorific, rel, spouse, parent, children, isClose)}
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      const sheet = this.container.querySelector('.member-sheet');
      const overlay = this.container.querySelector('.member-overlay');
      if (sheet && window.innerWidth < 1024) {
        sheet.classList.remove('translate-y-full');
        overlay?.classList.remove('hidden');
      }
    });
  }

  renderPersonContent(person, honorific, rel, spouse, parent, children, isClose) {
    const isDeceased = person.deathYear != null;
    return `
      <div class="p-4 sm:p-6 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${person.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'} flex items-center justify-center text-2xl flex-shrink-0">
            ${person.gender === 'male' ? '♂' : '♀'}
          </div>
          <div class="flex-1 min-w-0">
            <h2 class="font-bold text-gray-800 text-base sm:text-lg truncate">${person.name}</h2>
            ${honorific ? `<p class="text-emerald-600 text-xs sm:text-sm font-medium">${this.t.member.honorific}: ${honorific}</p>` : ''}
            <div class="flex items-center gap-1.5 mt-1">
              ${rel?.type === 'self' ? `<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] rounded-full font-medium">${this.t.tree.currentPerson}</span>` : ''}
              ${isDeceased ? `<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full">✝ ${this.t.tree.deceased}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:gap-3">
          ${this.infoCard(this.t.member.birthYear, person.birthYear || '-', 'blue')}
          ${this.infoCard(this.t.member.gender, person.gender === 'male' ? this.t.member.male : this.t.member.female, person.gender === 'male' ? 'blue' : 'pink')}
          ${this.infoCard(this.t.member.generation, String(person.generation), 'purple')}
          ${this.infoCard(this.t.member.role, this.t.admin.roles[person.role] || person.role, 'amber')}
        </div>

        ${spouse ? this.relationCard(this.t.member.spouse, spouse, 'pink') : ''}
        ${parent ? this.relationCard(this.t.member.parent, parent, 'blue') : ''}

        ${children.length > 0 ? `
          <div>
            <p class="text-xs text-gray-400 mb-2">${this.t.member.children} (${children.length})</p>
            <div class="space-y-1.5">
              ${children.map(c => `
                <button class="member-link w-full flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg active:bg-gray-100" data-id="${c.id}">
                  <span class="text-sm ${c.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}">${c.gender === 'male' ? '♂' : '♀'}</span>
                  <span class="flex-1 text-left text-sm font-medium text-gray-700 truncate">${c.name}</span>
                  <span class="text-xs text-gray-400">${c.birthYear}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${isClose && person.notes ? `
          <div class="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p class="text-xs text-amber-400 mb-1">${this.t.member.notes}</p>
            <p class="text-sm text-gray-700">${person.notes}</p>
          </div>
        ` : ''}

        ${!isClose && person.id !== this.store.getCurrentPerson()?.id ? `
          <div class="p-3 bg-gray-100 rounded-lg text-center">
            <p class="text-xs text-gray-500">🔒 ${this.t.member.limitedAccess}</p>
          </div>
        ` : ''}

        <div class="flex gap-2 pt-2 pb-4">
          ${(person.role === 'editor' || person.role === 'admin') ? `
            <button class="member-edit flex-1 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-medium">✏️ ${this.t.member.edit}</button>
          ` : ''}
          ${person.id !== this.store.getCurrentPerson()?.id ? `
            <button class="member-delete px-4 py-2.5 bg-red-50 active:bg-red-100 text-red-600 rounded-lg text-sm font-medium">🗑️</button>
          ` : ''}
        </div>
      </div>
    `;
  }

  infoCard(label, value, color) {
    const colors = {
      blue: 'bg-blue-50 text-blue-400 font-medium text-blue-700',
      pink: 'bg-pink-50 text-pink-400 font-medium text-pink-700',
      purple: 'bg-purple-50 text-purple-400 font-medium text-purple-700',
      amber: 'bg-amber-50 text-amber-400 font-medium text-amber-700'
    };
    return `
      <div class="rounded-lg p-2.5 ${colors[color] || colors.blue}">
        <p class="text-[10px] ${colors[color].split(' ')[1]} mb-0.5">${label}</p>
        <p class="text-sm">${value}</p>
      </div>
    `;
  }

  relationCard(label, person, color) {
    const borderColors = { pink: 'border-pink-100 bg-pink-50', blue: 'border-blue-100 bg-blue-50' };
    const textColors = { pink: 'text-pink-400 text-pink-700', blue: 'text-blue-400 text-blue-700' };
    return `
      <div class="p-3 rounded-lg border ${borderColors[color] || borderColors.blue}">
        <p class="text-xs ${textColors[color].split(' ')[0] || 'text-gray-400'} mb-1">${label}</p>
        <button class="member-link font-medium text-sm ${textColors[color].split(' ')[1] || 'text-gray-700'} active:opacity-70" data-id="${person.id}">
          ${person.name} (${person.birthYear}${person.deathYear ? ' - ' + person.deathYear : ''})
        </button>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.member-close').forEach(btn => {
      btn.addEventListener('click', () => this.store.setSelectedPerson(null));
    });

    const overlay = this.container.querySelector('.member-overlay');
    overlay?.addEventListener('click', () => this.store.setSelectedPerson(null));

    this.container.querySelectorAll('.member-link').forEach(link => {
      link.addEventListener('click', () => this.store.setSelectedPerson(link.dataset.id));
    });

    const editBtn = this.container.querySelector('.member-edit');
    editBtn?.addEventListener('click', () => {
      this.store.openModal('edit-person', this.store.getSelectedPerson());
    });

    const deleteBtn = this.container.querySelector('.member-delete');
    deleteBtn?.addEventListener('click', () => {
      if (confirm('Ban co chac muon xoa thanh vien nay?')) {
        this.store.setSelectedPerson(null);
      }
    });
  }

  updateTranslations(t) {
    this.t = t;
    this.render();
    this.bindEvents();
  }
}

export { MemberCardComponent };
