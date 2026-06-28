class SidebarComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.store.initCalendar();
    this.render();
    this.bindEvents();
  }

  getNavItems() {
    const person = this.store.getCurrentPerson();
    const items = [
      { id: 'tree', icon: 'tree', label: this.t.app.sidebar.tree },
      { id: 'members', icon: 'members', label: this.t.app.sidebar.members },
      { id: 'clan-info', icon: 'clan', label: this.t.app.sidebar.clanInfo },
      { id: 'events', icon: 'events', label: this.t.app.sidebar.events },
      { id: 'calendar', icon: 'calendar', label: this.t.app.sidebar.calendar },
      { id: 'funds', icon: 'funds', label: this.t.app.sidebar.funds },
    ];
    if (person?.data.role === 'admin') items.push({ id: 'admin', icon: 'admin', label: this.t.app.sidebar.admin });
    if (person?.data.role === 'editor' || person?.data.role === 'admin') items.push({ id: 'invite', icon: 'invite', label: this.t.app.sidebar.invite });
    return items;
  }

  getSvgIcon(name, size = 20) {
    const icons = {
      tree: '<path d="M12 2L4 7v5c0 5.52 3.84 10.74 8 12 4.16-1.26 8-6.48 8-12V7l-8-5z"/>',
      members: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
      clan: '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>',
      events: '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>',
      calendar: '<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>',
      funds: '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>',
      admin: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
      invite: '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
      bell: '<path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>',
      user: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
      globe: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
      sun: '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>',
      moon: '<path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/>',
      chevronLeft: '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>',
      chevronRight: '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>',
      menu: '<path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>',
      close: '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
      dark: '<path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
      lang: '<path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">${icons[name] || icons.user}</svg>`;
  }

  render() {
    const state = this.store.state;
    const clans = state.data?.clans || [];
    const navItems = this.getNavItems();
    const unread = this.store.getUnreadCount();
    const currentPerson = this.store.getCurrentPerson();
    const currentClan = clans.find(c => c.id === state.currentClanId);

    this.container.innerHTML = `
      <style>
        @media (max-width: 1023px) { .gp-desktop { display: none !important; } .gp-mobile { display: block !important; } }
        @media (min-width: 1024px) { .gp-desktop { display: flex !important; height: 100% !important; } .gp-mobile { display: none !important; } }
      </style>

      <!-- ===== DESKTOP TOP NAVIGATION ===== -->
      <div class="gp-desktop">
        <nav class="gp-desktop-topnav h-[64px] bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 shadow-sm z-30">
          <!-- Logo -->
          <div class="flex items-center gap-3 mr-6 lg:mr-8 flex-shrink-0">
            <div class="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
              GP
            </div>
            <h1 class="text-lg font-bold font-serif text-gray-800 hidden xl:block">Gia Phả</h1>
          </div>

          <!-- Clan switcher -->
          <div class="relative flex-shrink-0 mr-4 lg:mr-6">
            <button class="clan-dropdown-btn flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors">
              <span class="w-2.5 h-2.5 rounded-full ${currentClan?.lineage === 'father' ? 'bg-blue-500' : currentClan?.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span>
              <span class="text-gray-700 font-medium truncate max-w-[120px]">${currentClan?.name || ''}</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="clan-dropdown-menu absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 hidden z-50">
              ${clans.map(c => `
                <button class="clan-btn w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-purple-50 transition-colors ${state.currentClanId === c.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600'}" data-clan="${c.id}">
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span>
                  <span class="truncate">${c.name}</span>
                  <span class="text-xs text-gray-400 ml-auto">${this.t.clan.lineage[c.lineage]}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Navigation links -->
          <div class="flex-1 flex items-center gap-1 overflow-x-auto">
            ${navItems.map(item => `
              <button class="topnav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap flex-shrink-0 ${state.currentPage === item.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-purple-50/50'}" data-page="${item.id}">
                <span class="w-5 h-5 flex-shrink-0">${this.getSvgIcon(item.icon, 20)}</span>
                <span class="hidden 2xl:inline truncate">${item.label}</span>
              </button>
            `).join('')}
          </div>

          <!-- Right section -->
          <div class="flex items-center gap-1 ml-4 flex-shrink-0">
            <button class="nav-btn relative p-2.5 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors" data-page="notifications">
              <span class="w-5 h-5">${this.getSvgIcon('bell', 20)}</span>
              ${unread > 0 ? `<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>` : ''}
            </button>

            <button class="nav-btn p-2.5 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors" data-page="profile">
              <span class="w-5 h-5">${this.getSvgIcon('user', 20)}</span>
            </button>

            <button class="nav-btn p-2.5 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors" data-page="public-page">
              <span class="w-5 h-5">${this.getSvgIcon('globe', 20)}</span>
            </button>

            <div class="w-px h-6 bg-gray-200 mx-1"></div>

            <button class="dark-mode-btn p-2.5 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors">
              <span class="w-5 h-5">${state.darkMode ? this.getSvgIcon('sun', 20) : this.getSvgIcon('moon', 20)}</span>
            </button>

            <button class="lang-btn p-2.5 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors">
              <span class="w-5 h-5">${this.getSvgIcon('lang', 20)}</span>
            </button>
          </div>
        </nav>
      </div>

      <!-- ===== MOBILE HEADER ===== -->
      <div class="gp-mobile">
        <header class="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 h-[60px] shadow-sm">
          <div class="flex items-center justify-between px-4 h-full">
            <button class="menu-btn p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-xl">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">GP</div>
              <span class="font-serif font-bold text-sm text-gray-800 truncate max-w-[160px]">${currentClan?.name || ''}</span>
            </div>
            <button class="lang-btn p-2 -mr-2 text-gray-600 active:bg-gray-100 rounded-xl text-xs font-bold">${state.language === 'vi' ? 'EN' : 'VI'}</button>
          </div>
        </header>

        <!-- Mobile bottom nav -->
        <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-bottom h-[70px] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div class="flex items-stretch h-full">
            ${navItems.slice(0, 5).map(item => {
              const active = state.currentPage === item.id;
              return `<button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-100 relative ${active ? 'text-purple-700' : 'text-gray-400'}" data-page="${item.id}">${active ? '<div class="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-4"></div>' : ''}<span class="mt-1 w-6 h-6">${this.getSvgIcon(item.icon, 24)}</span><span class="text-[10px] font-medium truncate">${item.label}</span></button>`;
            }).join('')}
            <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-100 relative text-gray-400" data-page="notifications"><span class="mt-1 w-6 h-6 relative">${this.getSvgIcon('bell', 24)}${unread > 0 ? '<span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>' : ''}</span><span class="text-[10px] font-medium">${this.t.app.sidebar.notifications}</span></button>
          </div>
        </nav>

        <!-- Mobile drawer -->
        <div class="drawer-overlay fixed inset-0 z-50 bg-black/40 hidden opacity-0">
          <div class="drawer-panel absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl -translate-x-full">
            <div class="h-full flex flex-col overflow-y-auto">
              <div class="p-5 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 text-white flex-shrink-0">
                <div class="flex items-center gap-4">
                  ${(() => { const cp = this.store.getCurrentPerson(); if (!cp) return ''; const fullName = cp.data['first name'] + ' ' + cp.data['last name']; return `<div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">${cp.data.gender === 'M' ? '♂' : '♀'}</div><div><div class="font-serif font-bold text-lg">${fullName}</div><div class="text-sm opacity-80">${this.t.admin.roles[cp.data.role] || ''}</div></div>`; })()}
                </div>
              </div>
              <div class="p-4 border-b flex-shrink-0">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">${this.t.app.sidebar.clans}</p>
                <div class="space-y-2">${clans.map(c => `<button class="clan-btn w-full text-left px-4 py-3 rounded-xl text-sm transition flex items-center gap-3 ${state.currentClanId === c.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 active:bg-gray-50'}" data-clan="${c.id}"><span class="w-3 h-3 rounded-full flex-shrink-0 ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span><span class="truncate flex-1">${c.name}</span><span class="text-xs text-gray-400">${this.t.clan.lineage[c.lineage]}</span></button>`).join('')}</div>
              </div>
              <nav class="flex-1 overflow-y-auto p-4 space-y-1">
                ${navItems.map(item => `<button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 ${state.currentPage === item.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 active:bg-gray-50'}" data-page="${item.id}"><span class="w-5 h-5">${this.getSvgIcon(item.icon, 20)}</span><span>${item.label}</span></button>`).join('')}
                <div class="border-t my-3"></div>
                <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="notifications"><span class="w-5 h-5">${this.getSvgIcon('bell', 20)}</span><span class="flex-1 text-left">${this.t.app.sidebar.notifications}</span>${unread > 0 ? `<span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">${unread}</span>` : ''}</button>
                <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="profile"><span class="w-5 h-5">${this.getSvgIcon('user', 20)}</span><span>${this.t.app.sidebar.profile}</span></button>
                <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="public-page"><span class="w-5 h-5">${this.getSvgIcon('globe', 20)}</span><span>${this.t.app.sidebar.publicPage}</span></button>
              </nav>
              <div class="p-4 border-t flex-shrink-0 space-y-2">
                <button class="dark-mode-btn-full w-full text-left px-4 py-3.5 rounded-xl text-sm text-gray-600 active:bg-gray-50 flex items-center gap-3"><span class="w-5 h-5">${state.darkMode ? this.getSvgIcon('sun', 20) : this.getSvgIcon('moon', 20)}</span><span>${state.darkMode ? 'Light Mode' : 'Dark Mode'}</span></button>
                <button class="lang-btn-full w-full text-left px-4 py-3.5 rounded-xl text-sm text-gray-600 active:bg-gray-50 flex items-center gap-3"><span class="w-5 h-5">${this.getSvgIcon('lang', 20)}</span><span>${state.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll('.clan-btn').forEach(btn => {
      btn.addEventListener('click', () => { this.store.setCurrentClan(btn.dataset.clan); this.closeDrawer(); this.closeDropdown(); });
    });
    this.container.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => { this.store.setCurrentPage(btn.dataset.page); this.closeDrawer(); });
    });
    this.container.querySelectorAll('.lang-btn, .lang-btn-full').forEach(btn => {
      btn.addEventListener('click', () => this.store.setLanguage(this.store.state.language === 'vi' ? 'en' : 'vi'));
    });
    this.container.querySelector('.dark-mode-btn')?.addEventListener('click', () => this.store.toggleDarkMode());
    this.container.querySelector('.dark-mode-btn-full')?.addEventListener('click', () => this.store.toggleDarkMode());

    // Clan dropdown
    const dropdownBtn = this.container.querySelector('.clan-dropdown-btn');
    const dropdownMenu = this.container.querySelector('.clan-dropdown-menu');
    dropdownBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    const menuBtn = this.container.querySelector('.menu-btn');
    const overlay = this.container.querySelector('.drawer-overlay');
    const panel = this.container.querySelector('.drawer-panel');
    menuBtn?.addEventListener('click', () => {
      overlay.classList.remove('hidden');
      requestAnimationFrame(() => { overlay.classList.remove('opacity-0'); panel.classList.remove('-translate-x-full'); });
    });
    overlay?.addEventListener('click', e => { if (e.target === overlay) this.closeDrawer(); });
  }

  toggleDropdown() {
    const menu = this.container.querySelector('.clan-dropdown-menu');
    if (menu) menu.classList.toggle('hidden');
  }

  closeDropdown() {
    const menu = this.container.querySelector('.clan-dropdown-menu');
    if (menu) menu.classList.add('hidden');
  }

  closeDrawer() {
    const overlay = this.container.querySelector('.drawer-overlay');
    const panel = this.container.querySelector('.drawer-panel');
    if (!overlay || !panel) return;
    panel.classList.add('-translate-x-full');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }

  updateTranslations(t) { this.t = t; this.render(); this.bindEvents(); }
}

export { SidebarComponent };
