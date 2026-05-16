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
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="relative h-28 sm:h-32 bg-gradient-to-r from-emerald-500 to-teal-600">
          ${!this.editing ? `
            <button class="profile-edit-btn absolute top-3 right-3 px-3 py-1.5 bg-white/20 active:bg-white/30 rounded-lg text-white text-xs font-medium">✏️ ${this.t.profile.edit}</button>
          ` : `
            <button class="absolute top-3 right-14 px-3 py-1.5 bg-white/20 active:bg-white/30 rounded-lg text-white text-xs font-medium">${this.t.profile.cancel}</button>
            <button class="profile-save absolute top-3 right-3 px-3 py-1.5 bg-white/90 active:bg-white rounded-lg text-emerald-700 text-xs font-medium">${this.t.profile.save}</button>
          `}
        </div>
        <div class="px-4 sm:px-6 -mt-10 pb-6">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl sm:text-3xl border-4 border-white ${person.gender === 'male' ? 'text-blue-500' : 'text-pink-500'} mb-4 ml-1">
            ${person.gender === 'male' ? '♂' : '♀'}
          </div>
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-400">${this.t.profile.name}</label>
              ${this.editing ? `<input type="text" class="profile-name w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${person.name}" />` : `<p class="mt-1 font-semibold text-gray-800">${person.name}</p>`}
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-gray-400">${this.t.profile.birthYear}</label>
                ${this.editing ? `<input type="number" class="profile-birth w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${person.birthYear || ''}" />` : `<p class="mt-1 text-gray-700 text-sm">${person.birthYear || '-'}</p>`}
              </div>
              <div>
                <label class="text-xs text-gray-400">${this.t.profile.gender}</label>
                ${this.editing ? `<select class="profile-gender w-full mt-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="male" ${person.gender === 'male' ? 'selected' : ''}>${this.t.member.male}</option><option value="female" ${person.gender === 'female' ? 'selected' : ''}>${this.t.member.female}</option></select>` : `<p class="mt-1 text-gray-700 text-sm">${person.gender === 'male' ? this.t.member.male : this.t.member.female}</p>`}
              </div>
            </div>
            <div>
              <label class="text-xs text-gray-400">${this.t.profile.spouse}</label>
              <p class="mt-1 text-gray-700 text-sm">${person.spouseId ? allPersons.find(p => p.id === person.spouseId)?.name || '-' : '-'}</p>
            </div>
            <div>
              <label class="text-xs text-gray-400 mb-2 block">${this.t.app.sidebar.clans}</label>
              <div class="space-y-2">
                ${myClans.map(c => `
                  <div class="flex items-center gap-2.5 p-3 bg-gray-50 rounded-lg">
                    <span class="w-2.5 h-2.5 rounded-full ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span>
                    <span class="font-medium text-gray-700 text-sm">${c.name}</span>
                    <span class="text-xs text-gray-400 ml-auto">${this.t.clan.lineage[c.lineage]}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            <div class="border-t pt-4">
              <button class="profile-delete w-full py-3 bg-red-50 active:bg-red-100 text-red-600 rounded-lg text-sm font-medium">🗑️ ${this.t.profile.deleteAccount}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelector('.profile-edit-btn')?.addEventListener('click', () => { this.editing = true; this.render(); this.bindEvents(); });
    this.container.querySelector('.profile-save')?.addEventListener('click', () => {
      const p = this.store.getCurrentPerson();
      const nameInput = this.container.querySelector('.profile-name');
      const birthInput = this.container.querySelector('.profile-birth');
      const genderInput = this.container.querySelector('.profile-gender');
      if (p && nameInput) { p.name = nameInput.value; const parts = nameInput.value.split(' '); p.lastName = parts.pop() || ''; p.firstName = parts.join(' ') || ''; }
      if (p && birthInput) p.birthYear = parseInt(birthInput.value) || null;
      if (p && genderInput) p.gender = genderInput.value;
      this.editing = false; this.render(); this.bindEvents();
    });
    this.container.querySelector('[class*="cancel"]')?.addEventListener('click', () => { this.editing = false; this.render(); this.bindEvents(); });
    this.container.querySelector('.profile-delete')?.addEventListener('click', () => {
      if (confirm('Xoa tai khoan? Khong the hoan tai.')) alert('Da gui yeu cau (prototype)');
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { ProfileComponent };
