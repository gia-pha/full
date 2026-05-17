import { formatDate } from '../utils/format.js';

class EventsComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.tab = 'upcoming';
    this.render();
    this.bindEvents();
  }

  render() {
    const events = this.store.getClanEvents(this.store.state.currentClanId);
    const upcoming = events.filter(e => e.status === 'upcoming');
    const past = events.filter(e => e.status === 'past');
    const shown = this.tab === 'upcoming' ? upcoming : past;
    const canEdit = this.store.getCurrentPerson()?.role === 'editor' || this.store.getCurrentPerson()?.role === 'admin';

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.events.title}</h2>
          ${canEdit ? `<button class="events-add px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">+ ${this.t.events.addEvent}</button>` : ''}
        </div>
        <div class="p-4 sm:p-6 lg:p-8">
          <div class="flex gap-3 mb-6">
            <button class="events-tab px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${this.tab === 'upcoming' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-tab="upcoming">📅 ${this.t.events.upcoming} (${upcoming.length})</button>
            <button class="events-tab px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${this.tab === 'past' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-tab="past">📋 ${this.t.events.past} (${past.length})</button>
          </div>
          ${shown.length === 0 ? `<div class="text-center py-16 text-gray-400"><div class="text-5xl mb-4">📭</div><p class="text-base">Khong co su kien</p></div>` : `
            <div class="space-y-4">
              ${shown.map(e => this.renderCard(e, canEdit)).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  renderCard(event, canEdit) {
    const allPersons = this.store.state.data?.persons || [];
    const typeColors = { memorial: 'amber', meeting: 'blue', reunion: 'emerald', anniversary: 'purple' };
    const color = typeColors[event.type] || 'gray';

    return `
      <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-5 lg:p-6">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="px-3 py-1 text-xs rounded-full font-medium bg-${color}-100 text-${color}-700">${this.t.events.type[event.type] || event.type}</span>
                <span class="px-3 py-1 text-xs rounded-full font-medium ${event.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}">${event.status === 'upcoming' ? 'Sap toi' : 'Da qua'}</span>
              </div>
              <h3 class="font-bold text-gray-800 text-lg">${event.title}</h3>
            </div>
            ${canEdit ? `<div class="flex gap-2 ml-4 flex-shrink-0"><button class="event-edit p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-id="${event.id}">✏️</button><button class="event-delete p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${event.id}">🗑️</button></div>` : ''}
          </div>
          <p class="text-gray-600 mb-4 leading-relaxed">${event.description}</p>
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div class="flex items-center gap-2"><span>📅</span> ${formatDate(event.date)}</div>
            <div class="flex items-center gap-2"><span>📍</span> ${event.location}</div>
          </div>
          ${event.mapUrl ? `
            <div class="flex flex-wrap gap-3 mb-4">
              <a href="${event.mapUrl}" target="_blank" class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors">🗺️ ${this.t.events.viewMap}</a>
              <button class="event-cal px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-sm font-medium transition-colors" data-id="${event.id}">📆 ${this.t.events.addToCalendar}</button>
            </div>
          ` : ''}
          ${event.images?.length > 0 ? `
            <div class="mb-4">
              <p class="text-sm text-gray-400 mb-3">${this.t.events.images} (${event.images.length})</p>
              <div class="flex gap-3 overflow-x-auto pb-2">
                ${event.images.map(img => `<div class="w-36 h-24 lg:w-48 lg:h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0"><img src="${img}" class="w-full h-full object-cover" loading="lazy" /></div>`).join('')}
              </div>
            </div>
          ` : ''}
          ${event.attendees?.length > 0 ? `
            <div class="flex items-center gap-3">
              <div class="flex -space-x-2">${event.attendees.slice(0, 5).map(id => {
                const p = allPersons.find(x => x.id === id);
                return p ? `<div class="w-8 h-8 rounded-full ${p.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'} border-2 border-white flex items-center justify-center text-white text-xs font-bold" title="${p.name}">${p.name.split(' ').pop()?.charAt(0)}</div>` : '';
              }).join('')}</div>
              <span class="text-sm text-gray-400">${event.attendees.length} nguoi tham du</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.events-tab').forEach(tab => tab.addEventListener('click', () => { this.tab = tab.dataset.tab; this.render(); this.bindEvents(); }));
    this.container.querySelector('.events-add')?.addEventListener('click', () => this.store.openModal('add-event', { clanId: this.store.state.currentClanId }));
    this.container.querySelectorAll('.event-edit').forEach(b => b.addEventListener('click', () => { const e = this.store.getClanEvents(this.store.state.currentClanId).find(x => x.id === b.dataset.id); this.store.openModal('edit-event', e); }));
    this.container.querySelectorAll('.event-delete').forEach(b => b.addEventListener('click', () => { if (confirm('Xoa su kien?')) alert('Da xoa (prototype)'); }));
    this.container.querySelectorAll('.event-cal').forEach(b => b.addEventListener('click', () => {
      const e = this.store.getClanEvents(this.store.state.currentClanId).find(x => x.id === b.dataset.id);
      if (e) { const d = e.date.replace(/-/g, ''); window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.title)}&dates=${d}/${d}&location=${encodeURIComponent(e.location)}`, '_blank'); }
    }));
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { EventsComponent };
