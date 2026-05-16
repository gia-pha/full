import { buildGedcom, parseGedcom } from '../utils/gedcom.js';
import { downloadFile } from '../utils/format.js';

class AdminComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.tab = 'members';
    this.render();
    this.bindEvents();
  }

  render() {
    const members = this.store.getClanMembers(this.store.state.currentClanId);

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.admin.title}</h2>
        </div>
        <div class="px-4 sm:px-6 pt-3">
          <div class="flex gap-2 flex-wrap">
            ${['members', 'roles', 'gedcom'].map(t => `
              <button class="admin-tab px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${this.tab === t ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'}" data-tab="${t}">
                ${t === 'members' ? '👥 Thanh vien' : t === 'roles' ? '🏷️ Vai tro' : '📄 GEDCOM'}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="p-4 sm:p-6">
          ${this.tab === 'members' ? this.renderMembers(members) : ''}
          ${this.tab === 'roles' ? this.renderRoles(members) : ''}
          ${this.tab === 'gedcom' ? this.renderGedcom() : ''}
        </div>
      </div>
    `;
  }

  renderMembers(members) {
    return `
      <div class="space-y-2">
        ${members.map(m => `
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl active:bg-gray-100">
            <div class="w-10 h-10 rounded-full ${m.gender === 'male' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'} flex items-center justify-center text-sm font-bold flex-shrink-0">${m.name.split(' ').pop()?.charAt(0)}</div>
            <div class="flex-1 min-w-0">
              <button class="admin-member-link font-medium text-gray-800 text-sm active:text-emerald-600" data-id="${m.id}">
                ${m.name} ${m.deathYear ? '<span class="text-gray-400 text-xs">✝</span>' : ''}
              </button>
              <p class="text-xs text-gray-400">${m.birthYear || '-'} · The ${m.generation}</p>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-medium ${this.roleClass(m.role)}">${this.t.admin.roles[m.role]}</span>
              <button class="admin-reset p-1.5 text-gray-400 active:text-amber-600 rounded text-xs" data-id="${m.id}" title="Dat lai">🔄</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderRoles(members) {
    const groups = { admin: { l: '👑 Quan tri', c: 'bg-red-50 border-red-200' }, treasurer: { l: '💰 Thu quyi', c: 'bg-amber-50 border-amber-200' }, editor: { l: '✏️ Bien tap', c: 'bg-blue-50 border-blue-200' }, member: { l: '👤 Thanh vien', c: 'bg-gray-50 border-gray-200' } };
    return `
      <div class="space-y-3">
        ${Object.entries(groups).map(([role, info]) => {
          const ms = members.filter(m => m.role === role);
          return `
            <div class="border rounded-xl overflow-hidden ${info.c}">
              <div class="px-3 py-2 border-b flex items-center justify-between">
                <span class="font-medium text-sm">${info.l}</span>
                <span class="text-xs text-gray-400">${ms.length}</span>
              </div>
              <div class="p-3">
                ${ms.length === 0 ? '<p class="text-xs text-gray-400 text-center py-1">Chua co ai</p>' : `
                  <div class="flex flex-wrap gap-1.5">
                    ${ms.map(m => `
                      <div class="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/60 rounded-lg text-xs">
                        <span class="${m.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}">${m.gender === 'male' ? '♂' : '♀'}</span>
                        <span class="font-medium truncate max-w-[100px]">${m.name}</span>
                        ${role !== 'admin' && role !== 'member' ? `<button class="admin-change-role ml-1 text-gray-400 active:text-emerald-600" data-id="${m.id}" data-role="${role}">↓</button>` : ''}
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderGedcom() {
    return `
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 class="font-semibold text-blue-800 text-sm mb-1">${this.t.gedcom.import}</h3>
          <p class="text-xs text-blue-600 mb-3">Nhap tu file GEDCOM (.ged)</p>
          <div class="flex items-center gap-2">
            <input type="file" class="admin-gedcom-input flex-1 text-xs" accept=".ged,.GED" />
            <button class="admin-gedcom-import px-3 py-2 bg-blue-600 active:bg-blue-700 text-white rounded-lg text-xs font-medium">📤</button>
          </div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
          <h3 class="font-semibold text-green-800 text-sm mb-1">${this.t.gedcom.export}</h3>
          <p class="text-xs text-green-600 mb-3">Xuat ra file GEDCOM (.ged)</p>
          <button class="admin-gedcom-export px-4 py-2 bg-green-600 active:bg-green-700 text-white rounded-lg text-xs font-medium">📥 ${this.t.gedcom.download}</button>
        </div>
      </div>
    `;
  }

  roleClass(role) {
    return { admin: 'bg-red-100 text-red-700', treasurer: 'bg-amber-100 text-amber-700', editor: 'bg-blue-100 text-blue-700', member: 'bg-gray-100 text-gray-600' }[role] || 'bg-gray-100 text-gray-600';
  }

  bindEvents() {
    this.container.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => { this.tab = tab.dataset.tab; this.render(); this.bindEvents(); });
    });
    this.container.querySelectorAll('.admin-member-link').forEach(l => {
      l.addEventListener('click', () => { this.store.setSelectedPerson(l.dataset.id); this.store.setCurrentPage('tree'); });
    });
    this.container.querySelectorAll('.admin-reset').forEach(b => {
      b.addEventListener('click', () => { if (confirm('Dat lai tai khoan?')) alert('Da dat lai (prototype)'); });
    });
    this.container.querySelectorAll('.admin-change-role').forEach(b => {
      b.addEventListener('click', () => this.store.openModal('change-role', { personId: b.dataset.id, currentRole: b.dataset.role, newRole: 'member' }));
    });
    this.container.querySelector('.admin-gedcom-import')?.addEventListener('click', () => {
      const file = this.container.querySelector('.admin-gedcom-input')?.files?.[0];
      if (!file) return alert('Chon file GEDCOM');
      const reader = new FileReader();
      reader.onload = e => {
        try { const r = parseGedcom(e.target.result); alert(`Thanh cong: ${r.persons.length} thanh vien`); }
        catch (err) { alert(`Loi: ${err.message}`); }
      };
      reader.readAsText(file);
    });
    this.container.querySelector('.admin-gedcom-export')?.addEventListener('click', () => {
      downloadFile(buildGedcom(store.state.data), 'family-tree.ged', 'text/plain');
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { AdminComponent };
