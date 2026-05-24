import {
  solarToLunar,
  getDaysInMonth,
  getFirstDayOfMonth,
  monthNamesVi,
  monthNamesEn,
  dayNamesVi,
  dayNamesEn,
  getVietnameseYearName
} from '../utils/lunar.js';

class CalendarComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.store.initCalendar();
    this.render();
    this.bindEvents();
  }

  render() {
    const month = this.store.state.calendarMonth;
    const year = this.store.state.calendarYear;
    const lang = this.store.state.language;
    const calendarType = this.store.state.calendarType;
    const events = this.store.getClanEvents(this.store.state.currentClanId);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const monthNames = lang === 'vi' ? monthNamesVi : monthNamesEn;
    const dayNames = lang === 'vi' ? dayNamesVi : dayNamesEn;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Build events map: date -> [events]
    const eventsMap = {};
    events.forEach(e => {
      if (!eventsMap[e.date]) eventsMap[e.date] = [];
      eventsMap[e.date].push(e);
    });

    // Build lunar date map for each day
    const dayLunarDates = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const lunar = solarToLunar(year, month, d);
      dayLunarDates[d] = lunar;
    }

    // Generate calendar grid
    const cells = [];
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(prevYear, prevMonth);

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: prevMonthDays - i, current: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        current: true,
        isToday: dateStr === todayStr,
        events: eventsMap[dateStr] || [],
        lunar: dayLunarDates[d]
      });
    }

    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, current: false });
    }

    const lunarYearName = calendarType === 'lunar' ? getVietnameseYearName(year) : '';

    this.container.innerHTML = `
      <div class="h-full overflow-y-auto bg-white">
        <div class="p-4 sm:p-6 lg:p-8 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-800">${this.t.events.calendarView}</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">${this.t.events.calendarType}:</span>
            <button class="cal-type-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${this.store.state.calendarType === 'solar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-type="solar">${this.t.events.solar}</button>
            <button class="cal-type-btn px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${this.store.state.calendarType === 'lunar' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}" data-type="lunar">${this.t.events.lunar}</button>
          </div>
        </div>
        <div class="p-4 sm:p-6 lg:p-8">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2">
              <button class="cal-prev px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">◀</button>
              <button class="cal-today px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors">${this.t.events.today}</button>
              <button class="cal-next px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">▶</button>
            </div>
            <h3 class="text-lg font-bold text-gray-800">${monthNames[month]} ${year}${lunarYearName ? ' - ' + lunarYearName : ''}</h3>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span> ${this.t.events.type.memorial}
              <span class="w-2 h-2 rounded-full bg-blue-400 ml-2"></span> ${this.t.events.type.meeting}
              <span class="w-2 h-2 rounded-full bg-emerald-400 ml-2"></span> ${this.t.events.type.reunion}
              <span class="w-2 h-2 rounded-full bg-purple-400 ml-2"></span> ${this.t.events.type.anniversary}
            </div>
          </div>

          <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              ${dayNames.map(dn => `<div class="py-2 text-center text-xs font-semibold text-gray-500 uppercase">${dn}</div>`).join('')}
            </div>
            <div class="grid grid-cols-7">
              ${cells.map(cell => this.renderCell(cell, calendarType, lang)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCell(cell, calendarType, lang) {
    if (!cell.current) {
      return `<div class="min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-gray-100 bg-gray-50">
        <span class="text-xs text-gray-300">${cell.day}</span>
      </div>`;
    }

    const todayClass = cell.isToday ? 'bg-emerald-50 border-emerald-300' : 'bg-white hover:bg-gray-50';
    const todayDayClass = cell.isToday ? 'bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : '';

    // Lunar date display
    let lunarDisplay = '';
    if (cell.lunar) {
      const l = cell.lunar;
      const monthNames = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      lunarDisplay = `<div class="text-[9px] text-amber-500 mt-0.5">${l.day}/${monthNames[l.month] || l.month}</div>`;
    }

    // Event dots
    const typeColors = { memorial: 'bg-amber-400', meeting: 'bg-blue-400', reunion: 'bg-emerald-400', anniversary: 'bg-purple-400' };
    const eventDots = cell.events?.map(e =>
      `<div class="w-1.5 h-1.5 rounded-full ${typeColors[e.type] || 'bg-gray-400'}" title="${e.title}"></div>`
    ).join('') || '';

    // Event list (max 2)
    const textColors = { memorial: 'text-amber-600', meeting: 'text-blue-600', reunion: 'text-emerald-600', anniversary: 'text-purple-600' };
    const eventList = cell.events?.slice(0, 2).map(e =>
      `<div class="text-[10px] truncate ${textColors[e.type] || 'text-gray-600'}">${e.title}</div>`
    ).join('') || '';

    const moreCount = cell.events?.length > 2 ? `<div class="text-[10px] text-gray-400">+${cell.events.length - 2}</div>` : '';

    return `<div class="min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-gray-100 ${todayClass} transition-colors cursor-pointer cal-day-cell" data-date="${cell.dateStr}">
      <div class="flex items-start justify-between mb-1">
        <span class="text-xs font-medium text-gray-700 ${todayDayClass}">${cell.day}</span>
        ${calendarType === 'lunar' ? lunarDisplay : ''}
      </div>
      ${eventDots ? `<div class="flex gap-0.5 mb-1">${eventDots}</div>` : ''}
      <div class="space-y-0.5">
        ${eventList}
        ${moreCount}
      </div>
      ${calendarType === 'solar' && cell.lunar && cell.events.length > 0 ? lunarDisplay : ''}
    </div>`;
  }

  bindEvents() {
    this.container.querySelector('.cal-prev')?.addEventListener('click', () => {
      const m = this.store.state.calendarMonth;
      const y = this.store.state.calendarYear;
      this.store.setCalendarMonth(m === 1 ? 12 : m - 1);
      this.store.setCalendarYear(m === 1 ? y - 1 : y);
    });

    this.container.querySelector('.cal-next')?.addEventListener('click', () => {
      const m = this.store.state.calendarMonth;
      const y = this.store.state.calendarYear;
      this.store.setCalendarMonth(m === 12 ? 1 : m + 1);
      this.store.setCalendarYear(m === 12 ? y + 1 : y);
    });

    this.container.querySelector('.cal-today')?.addEventListener('click', () => {
      const now = new Date();
      this.store.setCalendarMonth(now.getMonth() + 1);
      this.store.setCalendarYear(now.getFullYear());
    });

    this.container.querySelectorAll('.cal-type-btn').forEach(btn => btn.addEventListener('click', () => {
      this.store._state.calendarType = btn.dataset.type;
      this.store._notify();
    }));

    this.container.querySelectorAll('.cal-day-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        if (cell.dataset.date) {
          // Open modal or navigate to show events for that day
          const events = this.store.getClanEvents(this.store.state.currentClanId).filter(e => e.date === cell.dataset.date);
          if (events.length > 0) {
            this.store.openModal('day-events', { date: cell.dataset.date, events });
          }
        }
      });
    });
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { CalendarComponent };
