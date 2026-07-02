import { store } from '../store.js';
import { getGenderIcon } from '../utils/avatar.js';

class ProfileComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.editing = false;
    this.render();
    this.bindEvents();
  }

  render() {
    const person = this.store.getCurrentPerson();
    if (!person) return;
    const clans = store.state.data?.clans || [];
    const allPersons = store.state.data?.persons || [];
    const myClans = clans.filter(c => allPersons.some(p => p.data.clanId === c.id && (p.id === person.id || p.rels.spouses.includes(person.id))));

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-800">${this.t.profile.title}</h2>
          ${!this.editing ? `<button class="profile-edit-btn px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">✏️ ${this.t.profile.edit}</button>` : `<button class="profile-cancel px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors mr-2">${this.t.profile.cancel}</button><button class="profile-save px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">${this.t.profile.save}</button>`}
        </div>
        <div class="px-4 sm:px-6 lg:px-8 py-6 pb-8">
          ${person.data.avatar ? `<img src="${person.data.avatar}" alt="${person.data.firstName + ' ' + person.data.lastName}" class="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-gray-100 mb-4" />` : `<div class="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-2 border-gray-100 ${person.data.gender === 'M' ? 'text-blue-500' : 'text-pink-500'} mb-4" style="padding: 0.5rem">${getGenderIcon(person.data.gender)}</div>`}
          <div class="max-w-2xl space-y-6">
            <div>
              <label class="text-sm text-gray-400">${this.t.profile.name}</label>
              ${this.editing ? `<input type="text" class="profile-name w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${person.data.firstName + ' ' + person.data.lastName}" />` : `<p class="mt-2 font-bold text-gray-800 text-xl">${person.data.firstName + ' ' + person.data.lastName}</p>`}
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-sm text-gray-400">${this.t.profile.birthYear}</label>${this.editing ? `<input type="number" class="profile-birth w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${person.data.birthYear || ''}" />` : `<p class="mt-2 text-gray-700">${person.data.birthYear || '-'}</p>`}</div>
              <div><label class="text-sm text-gray-400">${this.t.profile.gender}</label>${this.editing ? `<select class="profile-gender w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="M" ${person.data.gender === 'M' ? 'selected' : ''}>${this.t.member.male}</option><option value="F" ${person.data.gender === 'F' ? 'selected' : ''}>${this.t.member.female}</option></select>` : `<p class="mt-2 text-gray-700">${person.data.gender === 'M' ? this.t.member.male : this.t.member.female}</p>`}</div>
            </div>
            <div><label class="text-sm text-gray-400">${this.t.profile.spouse}</label><p class="mt-2 text-gray-700">${person.rels.spouses[0] ? ((sp => sp.data.firstName + ' ' + sp.data.lastName)(allPersons.find(p => p.id === person.rels.spouses[0]))) || '-' : '-'}</p></div>
            <div>
              <label class="text-sm text-gray-400 mb-3 block">${this.t.app.sidebar.clans}</label>
              <div class="space-y-3">${myClans.map(c => `<div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><span class="w-3 h-3 rounded-full ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span><span class="font-semibold text-gray-700">${c.name}</span><span class="text-sm text-gray-400 ml-auto">${this.t.clan.lineage[c.lineage]}</span></div>`).join('')}</div>
            </div>
            <div class="border-t pt-6"><button class="profile-delete w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-medium transition-colors">🗑️ ${this.t.profile.deleteAccount}</button></div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.profile-edit-btn')?.addEventListener('click', () => { this.editing = true; this.render(); this.bindEvents(); });
    this.container.querySelector('.profile-save')?.addEventListener('click', () => {
      const p = this.store.getCurrentPerson();
      const n = this.container.querySelector('.profile-name'); const b = this.container.querySelector('.profile-birth'); const g = this.container.querySelector('.profile-gender');
      if (p && n) { const parts = n.value.trim().split(' '); p.data.lastName = parts.pop() || ''; p.data.firstName = parts.join(' ') || ''; }
      if (p && b) p.data.birthYear = parseInt(b.value) || null;
      if (p && g) p.data.gender = g.value;
      this.editing = false; this.render(); this.bindEvents();
    });
    this.container.querySelector('.profile-delete')?.addEventListener('click', () => { if (confirm('Xoa tai khoan? Khong the hoan tai.')) alert('Da gui yeu cau (prototype)'); });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { ProfileComponent };
