class SidebarComponent {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.render();
    this.bindEvents();
  }

  getNavItems() {
    const person = this.store.getCurrentPerson();
    const items = [
      { id: 'tree', icon: 'tree', label: this.t.app.sidebar.tree },
      { id: 'members', icon: 'users', label: this.t.app.sidebar.members },
      { id: 'clan-info', icon: 'home', label: this.t.app.sidebar.clanInfo },
      { id: 'events', icon: 'calendar', label: this.t.app.sidebar.events },
      { id: 'funds', icon: 'wallet', label: this.t.app.sidebar.funds },
    ];
    if (person?.role === 'admin') items.push({ id: 'admin', icon: 'settings', label: this.t.app.sidebar.admin });
    if (person?.role === 'editor' || person?.role === 'admin') items.push({ id: 'invite', icon: 'mail', label: this.t.app.sidebar.invite });
    return items;
  }

  render() {
    const state = this.store.state;
    const clans = state.data?.clans || [];
    const navItems = this.getNavItems();
    const unread = this.store.getUnreadCount();

    // Desktop sidebar: visible only at lg+
    // Mobile elements: hidden at lg+
    this.container.innerHTML = `
      <style>
        @media (max-width: 1023px) { .gp-desktop { display: none !important; } .gp-mobile { display: block !important; } }
        @media (min-width: 1024px) { .gp-desktop { display: flex !important; flex-direction: column; } .gp-mobile { display: none !important; } }
      </style>
      <div class="gp-desktop" style="width:${state.sidebarOpen ? 256 : 64}px">
        ${this.renderDesktopSidebar(clans, navItems, unread)}
      </div>
      <div class="gp-mobile">
        ${this.renderMobileHeader(clans, unread)}
        ${this.renderMobileBottomNav(navItems, unread)}
        ${this.renderMobileDrawer(clans, navItems, unread)}
      </div>
    `;
  }

  renderDesktopSidebar(clans, navItems, unread) {
    const state = this.store.state;
    const open = state.sidebarOpen;
    return `
      <aside class="h-full bg-white border-r border-gray-200 flex-shrink-0">
        <div class="flex items-center gap-3 p-4 border-b">
          <div class="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">GP</div>
          ${open ? '<span class="font-bold text-gray-800 truncate">Gia Phai</span>' : ''}
        </div>
        <div class="p-3 border-b">
          ${open ? `<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">${this.t.app.sidebar.clans}</p>` : ''}
          <div class="${open ? 'space-y-1' : 'flex flex-col gap-1 items-center'}">
            ${clans.map(c => `
              <button class="clan-btn w-full text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-2.5 ${state.currentClanId === c.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}" data-clan="${c.id}">
                <span class="w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span>
                ${open ? `<span class="truncate">${c.name}</span>` : ''}
              </button>
            `).join('')}
          </div>
        </div>
        <nav class="flex-1 overflow-y-auto p-3 space-y-1">
          ${navItems.map(item => `
            <button class="nav-btn w-full text-left px-3 py-3 rounded-xl text-sm transition flex items-center gap-3 ${state.currentPage === item.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}" data-page="${item.id}">
              <span class="w-5 h-5 flex-shrink-0">${this.svgIcon(item.icon)}</span>
              ${open ? `<span class="truncate">${item.label}</span>` : ''}
            </button>
          `).join('')}
          <div class="border-t my-3"></div>
          <button class="nav-btn w-full text-left px-3 py-3 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 hover:bg-gray-50 relative" data-page="notifications">
            <span class="w-5 h-5 flex-shrink-0">${this.svgIcon('bell')}</span>
            ${open ? `<span>${this.t.app.sidebar.notifications}</span>` : ''}
            ${unread > 0 ? `<span class="absolute top-2.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full"></span>` : ''}
          </button>
          <button class="nav-btn w-full text-left px-3 py-3 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 hover:bg-gray-50" data-page="profile">
            <span class="w-5 h-5 flex-shrink-0">${this.svgIcon('user')}</span>
            ${open ? `<span>${this.t.app.sidebar.profile}</span>` : ''}
          </button>
          <button class="nav-btn w-full text-left px-3 py-3 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 hover:bg-gray-50" data-page="public-page">
            <span class="w-5 h-5 flex-shrink-0">${this.svgIcon('globe')}</span>
            ${open ? `<span>${this.t.app.sidebar.publicPage}</span>` : ''}
          </button>
        </nav>
        <div class="p-3 border-t space-y-1">
          <button class="lang-btn w-full text-left px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
            <span class="text-base flex-shrink-0">🌍</span>
            ${open ? `<span>${state.language === 'vi' ? 'English' : 'Ti\u1ebfng Vi\u1ec7t'}</span>` : ''}
          </button>
          <button class="sidebar-toggle w-full text-left px-3 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
            <span class="flex-shrink-0">${open ? '◀' : '▶'}</span>
          </button>
        </div>
      </aside>
    `;
  }

  renderMobileHeader(clans, unread) {
    const state = this.store.state;
    const clan = clans.find(c => c.id === state.currentClanId);
    return `
      <header class="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 h-[60px]">
        <div class="flex items-center justify-between px-4 h-full">
          <button class="menu-btn p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-xl">${this.svgIcon('menu')}</button>
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">GP</div>
            <span class="font-semibold text-base text-gray-800">${clan?.name || ''}</span>
          </div>
          <button class="lang-btn p-2 -mr-2 text-gray-600 active:bg-gray-100 rounded-xl text-sm font-bold">${state.language === 'vi' ? 'EN' : 'VI'}</button>
        </div>
      </header>
    `;
  }

  renderMobileBottomNav(navItems, unread) {
    const state = this.store.state;
    const items = navItems.slice(0, 5);
    return `
      <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-bottom h-[70px]">
        <div class="flex items-stretch h-full">
          ${items.map(item => {
            const active = state.currentPage === item.id;
            return `<button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-100 relative ${active ? 'text-emerald-600' : 'text-gray-400'}" data-page="${item.id}">${active ? '<div class="absolute top-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full mx-4"></div>' : ''}<span class="mt-1 w-6 h-6 flex items-center justify-center">${this.svgIcon(item.icon)}</span><span class="text-[11px] font-medium truncate">${item.label}</span></button>`;
          }).join('')}
          <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-100 text-gray-400 relative" data-page="notifications"><span class="w-6 h-6 flex items-center justify-center relative">${this.svgIcon('bell')}${unread > 0 ? '<span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>' : ''}</span><span class="text-[11px] font-medium">Thong bao</span></button>
        </div>
      </nav>
    `;
  }

  renderMobileDrawer(clans, navItems, unread) {
    const state = this.store.state;
    const person = this.store.getCurrentPerson();
    return `
      <div class="drawer-overlay fixed inset-0 z-50 bg-black/40 hidden opacity-0">
        <div class="drawer-panel absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl -translate-x-full">
          <div class="h-full flex flex-col overflow-y-auto">
            <div class="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex-shrink-0">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">${person?.gender === 'male' ? '♂' : '♀'}</div>
                <div><div class="font-bold text-lg">${person?.name || ''}</div><div class="text-sm opacity-80">${this.t.admin.roles[person?.role] || ''}</div></div>
              </div>
            </div>
            <div class="p-4 border-b flex-shrink-0">
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">${this.t.app.sidebar.clans}</p>
              <div class="space-y-2">${clans.map(c => `<button class="clan-btn w-full text-left px-4 py-3 rounded-xl text-sm transition flex items-center gap-3 ${state.currentClanId === c.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 active:bg-gray-50'}" data-clan="${c.id}"><span class="w-3 h-3 rounded-full flex-shrink-0 ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span><span class="truncate flex-1">${c.name}</span><span class="text-xs text-gray-400">${this.t.clan.lineage[c.lineage]}</span></button>`).join('')}</div>
            </div>
            <nav class="flex-1 overflow-y-auto p-4 space-y-1">
              ${navItems.map(item => `<button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 ${state.currentPage === item.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 active:bg-gray-50'}" data-page="${item.id}"><span class="w-5 h-5 flex-shrink-0">${this.svgIcon(item.icon)}</span><span>${item.label}</span></button>`).join('')}
              <div class="border-t my-3"></div>
              <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="notifications"><span class="w-5 h-5 flex-shrink-0">${this.svgIcon('bell')}</span><span class="flex-1 text-left">${this.t.app.sidebar.notifications}</span>${unread > 0 ? `<span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">${unread}</span>` : ''}</button>
              <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="profile"><span class="w-5 h-5 flex-shrink-0">${this.svgIcon('user')}</span><span>${this.t.app.sidebar.profile}</span></button>
              <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="public-page"><span class="w-5 h-5 flex-shrink-0">${this.svgIcon('globe')}</span><span>${this.t.app.sidebar.publicPage}</span></button>
            </nav>
            <div class="p-4 border-t flex-shrink-0">
              <button class="lang-btn-full w-full text-left px-4 py-3.5 rounded-xl text-sm text-gray-600 active:bg-gray-50 flex items-center gap-3"><span class="text-lg">🌍</span><span>${state.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}</span></button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  svgIcon(name) {
    const icons = {
      tree: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22V8m-4 0l4-4 4 4M6 22h12"/></svg>',
      users: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>',
      home: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>',
      calendar: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
      wallet: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>',
      settings: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>',
      mail: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>',
      bell: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>',
      user: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>',
      globe: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>',
      menu: '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>'
    };
    return icons[name] || '';
  }

  bindEvents() {
    this.container.querySelectorAll('.clan-btn').forEach(btn => {
      btn.addEventListener('click', () => { this.store.setCurrentClan(btn.dataset.clan); this.closeDrawer(); });
    });
    this.container.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => { this.store.setCurrentPage(btn.dataset.page); this.closeDrawer(); });
    });
    this.container.querySelectorAll('.lang-btn, .lang-btn-full').forEach(btn => {
      btn.addEventListener('click', () => this.store.setLanguage(this.store.state.language === 'vi' ? 'en' : 'vi'));
    });
    this.container.querySelector('.sidebar-toggle')?.addEventListener('click', () => this.store.toggleSidebar());

    const menuBtn = this.container.querySelector('.menu-btn');
    const overlay = this.container.querySelector('.drawer-overlay');
    const panel = this.container.querySelector('.drawer-panel');
    menuBtn?.addEventListener('click', () => {
      overlay.classList.remove('hidden');
      requestAnimationFrame(() => { overlay.classList.remove('opacity-0'); panel.classList.remove('-translate-x-full'); });
    });
    overlay?.addEventListener('click', e => { if (e.target === overlay) this.closeDrawer(); });
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
