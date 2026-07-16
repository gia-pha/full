import { buildGedcom, parseGedcom } from '../utils/gedcom.js';
import { downloadFile } from '../utils/format.js';
import { store } from '../store.js';
import { getGenderIcon } from '../utils/avatar.js';

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
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.admin.title}</h2>
        </div>
        <div class="p-4 sm:p-6 lg:p-8">
          <div class="flex gap-3 mb-6 flex-wrap">
            ${['members', 'roles', 'gedcom'].map(tb => `<button class="admin-tab px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${this.tab === tb ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-tab="${tb}">${tb === 'members' ? '👥 ' + this.t.admin.membersTab : tb === 'roles' ? '🏷️ ' + this.t.admin.rolesTab : '📄 ' + this.t.admin.gedcomTab}</button>`).join('')}
          </div>
          ${this.tab === 'members' ? this.renderMembers(members) : ''}
          ${this.tab === 'roles' ? this.renderRoles(members) : ''}
          ${this.tab === 'gedcom' ? this.renderGedcom() : ''}
        </div>
      </div>
    `;
  }

  renderMembers(members) {
    return `<div class="space-y-3">${members.map(m => { const fullName = m.data.firstName + ' ' + m.data.lastName; return `
      <div class="flex items-center gap-4 p-4 lg:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
        ${m.data.avatar ? `<img src="${m.data.avatar}" alt="${fullName}" class="w-12 h-12 lg:w-14 lg:h-14 rounded-full object-cover flex-shrink-0" />` : `<div class="w-12 h-12 lg:w-14 lg:h-14 rounded-full ${m.data.gender === 'M' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'} flex items-center justify-center flex-shrink-0" style="padding: 0.5rem">${getGenderIcon(m.data.gender)}</div>`}
        <div class="flex-1 min-w-0">
          <button class="admin-member-link font-semibold text-gray-800 hover:text-emerald-600 transition-colors" data-id="${m.id}">${fullName} ${m.data.deathYear ? '<span class="text-gray-400 text-sm">✝</span>' : ''}</button>
          <p class="text-sm text-gray-400 mt-0.5">${m.data.birthYear || '-'} · ${this.t.tree.generation} ${m.data.generation}</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="px-3 py-1 rounded-full text-xs font-medium ${this.roleClass(m.data.role)}">${this.t.admin.roles[m.data.role]}</span>
          <button class="admin-reset p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" data-id="${m.id}" title="${this.t.admin.resetAccount}">🔄</button>
        </div>
      </div>
    `; }).join('')}</div>`;
  }

  renderRoles(members) {
    const groups = { admin: { l: this.t.admin.roleLabels.admin, c: 'bg-red-50 border-red-200' }, treasurer: { l: this.t.admin.roleLabels.treasurer, c: 'bg-amber-50 border-amber-200' }, editor: { l: this.t.admin.roleLabels.editor, c: 'bg-blue-50 border-blue-200' }, member: { l: this.t.admin.roleLabels.member, c: 'bg-gray-50 border-gray-200' } };
    return `<div class="space-y-4">${Object.entries(groups).map(([role, info]) => {
      const ms = members.filter(m => m.data.role === role);
      return `<div class="border rounded-2xl overflow-hidden ${info.c}"><div class="px-5 py-3 border-b flex items-center justify-between"><span class="font-semibold text-sm">${info.l}</span><span class="text-sm text-gray-400">${ms.length}</span></div><div class="p-4">           ${ms.length === 0 ? `<p class="text-sm text-gray-400 text-center py-3">${this.t.admin.noMembers}</p>` : `<div class="flex flex-wrap gap-2">${ms.map(m => { const fullName = m.data.firstName + ' ' + m.data.lastName; return `<div class="flex items-center gap-2 px-4 py-2.5 bg-white/70 rounded-xl text-sm"><span class="${m.data.gender === 'M' ? 'text-blue-500' : 'text-pink-500'}">${m.data.gender === 'M' ? '♂' : '♀'}</span><span class="font-medium">${fullName}</span>${role !== 'admin' && role !== 'member' ? `<button class="admin-change-role ml-1 text-gray-400 hover:text-emerald-600" data-id="${m.id}" data-role="${role}">↓</button>` : ''}</div>`; }).join('')}</div>`}</div></div>`;
    }).join('')}</div>`;
  }

  renderGedcom() {
    return `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
     <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6"><h3 class="font-bold text-blue-800 mb-2">${this.t.gedcom.import}</h3><p class="text-sm text-blue-600 mb-4">${this.t.admin.gedcomImportDesc}</p><div class="flex items-center gap-3"><input type="file" class="admin-gedcom-input flex-1 text-sm" accept=".ged,.GED" /><button class="admin-gedcom-import px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">📤 ${this.t.admin.uploadGedcom}</button></div></div>
       <div class="bg-green-50 border border-green-200 rounded-2xl p-6"><h3 class="font-bold text-green-800 mb-2">${this.t.gedcom.export}</h3><p class="text-sm text-green-600 mb-4">${this.t.admin.gedcomExportDesc}</p><button class="admin-gedcom-export px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">📥 ${this.t.gedcom.download}</button></div>
    </div>`;
  }

  roleClass(r) { return { admin: 'bg-red-100 text-red-700', treasurer: 'bg-amber-100 text-amber-700', editor: 'bg-blue-100 text-blue-700', member: 'bg-gray-100 text-gray-600' }[r] || 'bg-gray-100 text-gray-600'; }

  bindEvents() {
    this.container.querySelectorAll('.admin-tab').forEach(tab => tab.addEventListener('click', () => { this.tab = tab.dataset.tab; this.render(); this.bindEvents(); }));
    this.container.querySelectorAll('.admin-member-link').forEach(l => l.addEventListener('click', () => { this.store.setSelectedPerson(l.dataset.id); this.store.setCurrentPage('tree'); }));
    this.container.querySelectorAll('.admin-reset').forEach(b => b.addEventListener('click', () => { if (confirm(this.t.admin.resetConfirm)) alert(this.t.admin.resetSuccess); }));
    this.container.querySelectorAll('.admin-change-role').forEach(b => b.addEventListener('click', () => this.store.openModal('change-role', { personId: b.dataset.id, currentRole: b.dataset.role, newRole: 'member' })));
    this.container.querySelector('.admin-gedcom-import')?.addEventListener('click', () => {
      const file = this.container.querySelector('.admin-gedcom-input')?.files?.[0];
      if (!file) return alert(this.t.admin.selectFile);
      const reader = new FileReader(); reader.onload = e => { try { const r = parseGedcom(e.target.result); alert(`${this.t.admin.importSuccess}: ${r.persons.length} ${this.t.admin.members}`); } catch (err) { alert(`${this.t.admin.importError}: ${err.message}`); } }; reader.readAsText(file);
    });
    this.container.querySelector('.admin-gedcom-export')?.addEventListener('click', () => downloadFile(buildGedcom(store.state.data), 'family-tree.ged', 'text/plain'));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { AdminComponent };
