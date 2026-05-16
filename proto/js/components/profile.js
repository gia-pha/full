import { store } from '../store.js';

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
    const myClans = clans.filter(c => allPersons.some(p => p.clanId === c.id && (p.id === person.id || p.spouseId === person.id)));

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="relative h-32 sm:h-40 bg-gradient-to-r from-emerald-500 to-teal-600">
          ${!this.editing ? `<button class="profile-edit-btn absolute top-4 right-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors">✏️ ${this.t.profile.edit}</button>` : `<button class="absolute top-4 right-20 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors">${this.t.profile.cancel}</button><button class="profile-save absolute top-4 right-4 px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-emerald-700 text-sm font-medium transition-colors">${this.t.profile.save}</button>`}
        </div>
        <div class="px-4 sm:px-6 lg:px-8 -mt-12 pb-8">
          <div class="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl border-4 border-white ${person.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} mb-6">${person.gender === 'male' ? '♂' : '♀'}</div>
          <div class="max-w-2xl space-y-6">
            <div>
              <label class="text-sm text-gray-400">${this.t.profile.name}</label>
              ${this.editing ? `<input type="text" class="profile-name w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${person.name}" />` : `<p class="mt-2 font-bold text-gray-800 text-xl">${person.name}</p>`}
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div><label class="text-sm text-gray-400">${this.t.profile.birthYear}</label>${this.editing ? `<input type="number" class="profile-birth w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${person.birthYear || ''}" />` : `<p class="mt-2 text-gray-700">${person.birthYear || '-'}</p>`}</div>
              <div><label class="text-sm text-gray-400">${this.t.profile.gender}</label>${this.editing ? `<select class="profile-gender w-full mt-2 px-5 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="male" ${person.gender === 'male' ? 'selected' : ''}>${this.t.member.male}</option><option value="female" ${person.gender === 'female' ? 'selected' : ''}>${this.t.member.female}</option></select>` : `<p class="mt-2 text-gray-700">${person.gender === 'male' ? this.t.member.male : this.t.member.female}</p>`}</div>
            </div>
            <div><label class="text-sm text-gray-400">${this.t.profile.spouse}</label><p class="mt-2 text-gray-700">${person.spouseId ? allPersons.find(p => p.id === person.spouseId)?.name || '-' : '-'}</p></div>
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
      if (p && n) { p.name = n.value; const parts = n.value.split(' '); p.lastName = parts.pop() || ''; p.firstName = parts.join(' ') || ''; }
      if (p && b) p.birthYear = parseInt(b.value) || null;
      if (p && g) p.gender = g.value;
      this.editing = false; this.render(); this.bindEvents();
    });
    this.container.querySelector('.profile-delete')?.addEventListener('click', () => { if (confirm('Xoa tai khoan? Khong the hoan tai.')) alert('Da gui yeu cau (prototype)'); });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { ProfileComponent };
