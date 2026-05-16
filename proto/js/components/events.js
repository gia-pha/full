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
      <div class="h-full overflow-y-auto bg-white pb-20 lg:pb-6">
        <div class="p-4 sm:p-6 border-b flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.events.title}</h2>
          ${canEdit ? `<button class="events-add px-3 sm:px-4 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-medium">+ ${this.t.events.addEvent}</button>` : ''}
        </div>
        <div class="px-4 sm:px-6 pt-3">
          <div class="flex gap-2">
            <button class="events-tab px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${this.tab === 'upcoming' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'}" data-tab="upcoming">📅 ${this.t.events.upcoming} (${upcoming.length})</button>
            <button class="events-tab px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${this.tab === 'past' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 active:bg-gray-200'}" data-tab="past">📋 ${this.t.events.past} (${past.length})</button>
          </div>
        </div>
        <div class="p-4 sm:p-6 space-y-3 sm:space-y-4">
          ${shown.length === 0 ? `<div class="text-center py-12 text-gray-400"><div class="text-4xl mb-3">📭</div><p class="text-sm">Khong co su kien</p></div>` : shown.map(e => this.renderCard(e, canEdit)).join('')}
        </div>
      </div>
    `;
  }

  renderCard(event, canEdit) {
    const allPersons = this.store.state.data?.persons || [];
    const typeColors = { memorial: 'amber', meeting: 'blue', reunion: 'green', anniversary: 'purple' };
    const color = typeColors[event.type] || 'gray';

    return `
      <div class="border border-gray-200 rounded-xl overflow-hidden active:shadow-md transition-shadow">
        <div class="p-3 sm:p-4">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-1.5 mb-1">
                <span class="px-2 py-0.5 text-[10px] rounded-full font-medium bg-${color}-100 text-${color}-700">${this.t.events.type[event.type] || event.type}</span>
                <span class="px-2 py-0.5 text-[10px] rounded-full font-medium ${event.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}">${event.status === 'upcoming' ? 'Sap toi' : 'Da qua'}</span>
              </div>
              <h3 class="font-semibold text-gray-800 text-sm sm:text-base truncate">${event.title}</h3>
            </div>
            ${canEdit ? `
              <div class="flex gap-1 ml-2 flex-shrink-0">
                <button class="event-edit p-1.5 text-gray-400 active:text-gray-600 active:bg-gray-100 rounded text-xs" data-id="${event.id}">✏️</button>
                <button class="event-delete p-1.5 text-gray-400 active:text-red-600 active:bg-red-50 rounded text-xs" data-id="${event.id}">🗑️</button>
              </div>
            ` : ''}
          </div>
          <p class="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">${event.description}</p>
          <div class="flex flex-col gap-1.5 text-xs text-gray-500">
            <div class="flex items-center gap-1.5">📅 ${formatDate(event.date)}</div>
            <div class="flex items-center gap-1.5">📍 ${event.location}</div>
          </div>
          ${event.mapUrl ? `
            <div class="flex gap-2 mt-2">
              <a href="${event.mapUrl}" target="_blank" class="px-3 py-1.5 bg-blue-50 active:bg-blue-100 text-blue-600 rounded-lg text-[10px] sm:text-xs font-medium">🗺️ Ban do</a>
              <button class="event-cal px-3 py-1.5 bg-purple-50 active:bg-purple-100 text-purple-600 rounded-lg text-[10px] sm:text-xs font-medium" data-id="${event.id}">📆 Lich</button>
            </div>
          ` : ''}
          ${event.images?.length > 0 ? `
            <div class="mt-2">
              <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                ${event.images.map(img => `<div class="w-20 h-14 sm:w-28 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"><img src="${img}" class="w-full h-full object-cover" loading="lazy" /></div>`).join('')}
              </div>
            </div>
          ` : ''}
          ${event.attendees?.length > 0 ? `
            <div class="flex items-center gap-2 mt-2">
              <div class="flex -space-x-1.5">
                ${event.attendees.slice(0, 4).map(id => {
                  const p = allPersons.find(x => x.id === id);
                  return p ? `<div class="w-6 h-6 rounded-full ${p.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'} border-2 border-white flex items-center justify-center text-white text-[8px] font-bold" title="${p.name}">${p.name.split(' ').pop()?.charAt(0)}</div>` : '';
                }).join('')}
              </div>
              <span class="text-[10px] text-gray-400">${event.attendees.length} nguoi</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.events-tab').forEach(tab => {
      tab.addEventListener('click', () => { this.tab = tab.dataset.tab; this.render(); this.bindEvents(); });
    });
    this.container.querySelector('.events-add')?.addEventListener('click', () => {
      this.store.openModal('add-event', { clanId: this.store.state.currentClanId });
    });
    this.container.querySelectorAll('.event-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const event = this.store.getClanEvents(this.store.state.currentClanId).find(e => e.id === btn.dataset.id);
        this.store.openModal('edit-event', event);
      });
    });
    this.container.querySelectorAll('.event-delete').forEach(btn => {
      btn.addEventListener('click', () => { if (confirm('Xoa su kien?')) alert('Da xoa (prototype)'); });
    });
    this.container.querySelectorAll('.event-cal').forEach(btn => {
      btn.addEventListener('click', () => {
        const event = this.store.getClanEvents(this.store.state.currentClanId).find(e => e.id === btn.dataset.id);
        if (event) {
          const d = event.date.replace(/-/g, '');
          window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${d}/${d}&location=${encodeURIComponent(event.location)}`, '_blank');
        }
      });
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { EventsComponent };
