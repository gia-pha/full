class ModalComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.render();
    this.bindEvents();
  }

  render() {
    const type = this.store.state.modalOpen;
    const data = this.store.state.modalData;
    if (!type) { this.container.innerHTML = ''; return; }

    const titles = { 'edit-person': 'Chinh sua thanh vien', 'edit-clan': 'Chinh sua ho toc', 'add-event': 'Them su kien', 'edit-event': 'Chinh sua su kien', 'add-fund-transaction': 'Them giao dich', 'change-role': 'Doi vai tro' };

    this.container.innerHTML = `
      <div class="modal-overlay fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
        <div class="modal-content bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] sm:m-4 overflow-hidden flex flex-col">
          <div class="sticky top-0 bg-white px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between">
            <h3 class="font-semibold text-gray-800 text-sm sm:text-lg">${titles[type] || 'Modal'}</h3>
            <button class="modal-close w-8 h-8 bg-gray-100 active:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-sm">✕</button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto">
            ${this.getBody(type, data)}
          </div>
        </div>
      </div>
    `;

    // Animate in
    requestAnimationFrame(() => {
      const content = this.container.querySelector('.modal-content');
      if (content) {
        content.style.transform = 'translateY(100%)';
        content.style.opacity = '0';
        requestAnimationFrame(() => {
          content.style.transition = 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s';
          content.style.transform = 'translateY(0)';
          content.style.opacity = '1';
        });
      }
    });
  }

  getBody(type, data) {
    switch (type) {
      case 'edit-person': return this.editPerson(data);
      case 'edit-clan': return this.editClan(data);
      case 'add-event': case 'edit-event': return this.editEvent(data, type === 'add-event');
      case 'add-fund-transaction': return this.fundTxn(data);
      case 'change-role': return this.changeRole(data);
      default: return '<p class="text-gray-400 text-sm">Khong co noi dung</p>';
    }
  }

  input(label, cls, value = '', type = 'text', extra = '') {
    return `<div><label class="text-xs sm:text-sm text-gray-600">${label}</label><input type="${type}" class="${cls} w-full mt-1 px-3 sm:px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" value="${value}" ${extra} /></div>`;
  }

  textarea(label, cls, value = '', rows = 3) {
    return `<div><label class="text-xs sm:text-sm text-gray-600">${label}</label><textarea class="${cls} w-full mt-1 px-3 sm:px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" rows="${rows}">${value}</textarea></div>`;
  }

  editPerson(p) {
    if (!p) return '<p class="text-gray-400 text-sm">Khong co du lieu</p>';
    return `
      <div class="space-y-3 sm:space-y-4">
        ${this.input(this.t.member.name, 'modal-person-name', p.name)}
        <div class="grid grid-cols-2 gap-3">${this.input(this.t.member.birthYear, 'modal-person-birth', p.birthYear || '', 'number')}${this.input(this.t.member.deathYear, 'modal-person-death', p.deathYear || '', 'number')}</div>
        ${this.textarea(this.t.member.notes, 'modal-person-notes', p.notes || '')}
        <div class="flex gap-2 pt-2">
          <button class="modal-save-person flex-1 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-medium">${this.t.profile.save}</button>
          <button class="modal-cancel px-4 py-2.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">${this.t.profile.cancel}</button>
        </div>
      </div>
    `;
  }

  editClan(c) {
    if (!c) return '<p class="text-gray-400 text-sm">Khong co du lieu</p>';
    return `
      <div class="space-y-3 sm:space-y-4">
        ${this.textarea(this.t.clan.history, 'modal-clan-history', c.history, 4)}
        <div class="grid grid-cols-2 gap-3">${this.input(this.t.clan.origin, 'modal-clan-origin', c.origin)}${this.input(this.t.clan.memorialDate, 'modal-clan-memorial', c.memorialDate)}</div>
        ${this.input(this.t.clan.clanHouse, 'modal-clan-house', c.clanHouse)}
        ${this.input(this.t.clan.village, 'modal-clan-village', c.village)}
        <div class="flex gap-2 pt-2">
          <button class="modal-save-clan flex-1 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-medium">${this.t.profile.save}</button>
          <button class="modal-cancel px-4 py-2.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">${this.t.profile.cancel}</button>
        </div>
      </div>
    `;
  }

  editEvent(event, isAdd) {
    return `
      <div class="space-y-3 sm:space-y-4">
        ${this.input(this.t.events.title, 'modal-event-title', event?.title || '')}
        ${this.textarea(this.t.events.description, 'modal-event-desc', event?.description || '')}
        <div class="grid grid-cols-2 gap-3">
          ${this.input(this.t.events.date, 'modal-event-date', event?.date || '', 'date')}
          <div><label class="text-xs sm:text-sm text-gray-600">${this.t.events.type}</label><select class="modal-event-type w-full mt-1 px-3 sm:px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="memorial" ${event?.type === 'memorial' ? 'selected' : ''}>Giô to</option><option value="meeting" ${event?.type === 'meeting' ? 'selected' : ''}>Hoi nghi</option><option value="reunion" ${event?.type === 'reunion' ? 'selected' : ''}>Quen ma</option><option value="anniversary" ${event?.type === 'anniversary' ? 'selected' : ''}>Ky niem</option></select></div>
        </div>
        ${this.input(this.t.events.location, 'modal-event-location', event?.location || '')}
        ${this.input('Map URL', 'modal-event-map', event?.mapUrl || '', 'url')}
        <div class="flex gap-2 pt-2">
          <button class="modal-save-event flex-1 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-medium">${this.t.profile.save}</button>
          <button class="modal-cancel px-4 py-2.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">${this.t.profile.cancel}</button>
        </div>
      </div>
    `;
  }

  fundTxn(data) {
    const members = this.store.getClanMembers(data.clanId);
    const events = this.store.getClanEvents(data.clanId);
    return `
      <div class="space-y-3 sm:space-y-4">
        ${this.input(this.t.fund.description, 'modal-txn-desc', '', 'text')}
        <div class="grid grid-cols-2 gap-3">
          ${this.input(this.t.fund.amount, 'modal-txn-amount', '', 'number')}
          ${this.input(this.t.fund.date, 'modal-txn-date', new Date().toISOString().split('T')[0], 'date')}
        </div>
        <div><label class="text-xs sm:text-sm text-gray-600">${this.t.fund.person}</label><select class="modal-txn-person w-full mt-1 px-3 sm:px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">${members.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}</select></div>
        <div><label class="text-xs sm:text-sm text-gray-600">${this.t.fund.event} (optional)</label><select class="modal-txn-event w-full mt-1 px-3 sm:px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="">-- Khong co --</option>${events.map(e => `<option value="${e.id}">${e.title}</option>`).join('')}</select></div>
        <div class="flex gap-2 pt-2">
          <button class="modal-save-txn flex-1 py-2.5 ${data.type === 'contribution' ? 'bg-emerald-600 active:bg-emerald-700' : 'bg-red-600 active:bg-red-700'} text-white rounded-lg text-sm font-medium">${data.type === 'contribution' ? 'Dong gap' : 'Chi tieu'}</button>
          <button class="modal-cancel px-4 py-2.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">${this.t.profile.cancel}</button>
        </div>
      </div>
    `;
  }

  changeRole(data) {
    const person = this.store.getPersonById(data.personId);
    if (!person) return '<p class="text-gray-400 text-sm">Khong tim thay</p>';
    return `
      <div class="space-y-4">
        <div class="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <p class="text-xs text-gray-500">${this.t.member.name}</p>
          <p class="font-medium text-gray-800 text-sm">${person.name}</p>
          <p class="text-xs text-gray-500 mt-1">${this.t.member.role}: <span class="text-emerald-600">${this.t.admin.roles[data.currentRole]}</span></p>
        </div>
        <div><label class="text-xs sm:text-sm text-gray-600">Vai tro moi</label><select class="modal-new-role w-full mt-1 px-3 sm:px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="member">${this.t.admin.roles.member}</option><option value="editor">${this.t.admin.roles.editor}</option><option value="treasurer">${this.t.admin.roles.treasurer}</option></select></div>
        <div class="flex gap-2 pt-2">
          <button class="modal-save-role flex-1 py-2.5 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-sm font-medium">${this.t.admin.editRole}</button>
          <button class="modal-cancel px-4 py-2.5 bg-gray-100 active:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">${this.t.profile.cancel}</button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const overlay = this.container.querySelector('.modal-overlay');
    const close = () => this.store.closeModal();
    this.container.querySelector('.modal-close')?.addEventListener('click', close);
    this.container.querySelector('.modal-cancel')?.addEventListener('click', close);
    overlay?.addEventListener('click', e => { if (e.target === overlay) close(); });

    this.container.querySelector('.modal-save-person')?.addEventListener('click', () => {
      const p = this.store.state.modalData;
      if (p) {
        const n = this.container.querySelector('.modal-person-name');
        const b = this.container.querySelector('.modal-person-birth');
        const d = this.container.querySelector('.modal-person-death');
        const nt = this.container.querySelector('.modal-person-notes');
        if (n) p.name = n.value;
        if (b) p.birthYear = parseInt(b.value) || null;
        if (d) p.deathYear = parseInt(d.value) || null;
        if (nt) p.notes = nt.value;
      }
      close();
    });

    this.container.querySelector('.modal-save-clan')?.addEventListener('click', () => {
      const c = this.store.getCurrentClan();
      if (c) {
        const h = this.container.querySelector('.modal-clan-history');
        const o = this.container.querySelector('.modal-clan-origin');
        const m = this.container.querySelector('.modal-clan-memorial');
        const hs = this.container.querySelector('.modal-clan-house');
        const v = this.container.querySelector('.modal-clan-village');
        if (h) c.history = h.value;
        if (o) c.origin = o.value;
        if (m) c.memorialDate = m.value;
        if (hs) c.clanHouse = hs.value;
        if (v) c.village = v.value;
      }
      close();
    });

    this.container.querySelector('.modal-save-event')?.addEventListener('click', () => { alert('Da luu (prototype)'); close(); });
    this.container.querySelector('.modal-save-txn')?.addEventListener('click', () => { alert('Da them (prototype)'); close(); });
    this.container.querySelector('.modal-save-role')?.addEventListener('click', () => {
      const sel = this.container.querySelector('.modal-new-role');
      const p = this.store.getPersonById(this.store.state.modalData?.personId);
      if (p && sel) p.role = sel.value;
      close();
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { ModalComponent };
