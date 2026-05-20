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
      { id: 'tree', icon: '🌳', label: this.t.app.sidebar.tree },
      { id: 'members', icon: '👥', label: this.t.app.sidebar.members },
      { id: 'clan-info', icon: '🏛️', label: this.t.app.sidebar.clanInfo },
      { id: 'events', icon: '📅', label: this.t.app.sidebar.events },
      { id: 'funds', icon: '💰', label: this.t.app.sidebar.funds },
    ];
    if (person?.role === 'admin') items.push({ id: 'admin', icon: '⚙️', label: this.t.app.sidebar.admin });
    if (person?.role === 'editor' || person?.role === 'admin') items.push({ id: 'invite', icon: '📨', label: this.t.app.sidebar.invite });
    return items;
  }

  render() {
    const state = this.store.state;
    const clans = state.data?.clans || [];
    const navItems = this.getNavItems();
    const unread = this.store.getUnreadCount();

    this.container.innerHTML = `
      <style>
        @media (max-width: 1023px) { .gp-desktop { display: none !important; } .gp-mobile { display: block !important; } }
        @media (min-width: 1024px) { .gp-desktop { display: flex !important; flex-direction: column; height: 100% !important; } .gp-mobile { display: none !important; } }
      </style>

      <!-- ===== DESKTOP SIDEBAR ===== -->
      <div class="gp-desktop" style="width:${state.sidebarOpen ? 256 : 64}px; height:100%;">
        <aside class="h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <!-- Logo -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">GP</div>
              ${state.sidebarOpen ? '<h1 class="text-lg font-bold text-gray-800 truncate">Gia Phả</h1>' : ''}
            </div>
          </div>

          <!-- Clan switcher -->
          <div class="p-3 border-b border-gray-200">
            ${state.sidebarOpen ? `<div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">${this.t.app.sidebar.clans}</div>` : ''}
            <div class="${state.sidebarOpen ? 'space-y-1' : 'flex flex-col gap-1 items-center'}">
              ${clans.map(c => `
                <button class="clan-btn w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${state.currentClanId === c.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}" data-clan="${c.id}">
                  <span class="w-2 h-2 rounded-full flex-shrink-0 ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span>
                  ${state.sidebarOpen ? `<span class="truncate">${c.name}</span><span class="text-xs text-gray-400 ml-auto">${this.t.clan.lineage[c.lineage]}</span>` : ''}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto p-3 space-y-1">
            ${navItems.map(item => `
              <button class="nav-btn w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 ${state.currentPage === item.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}" data-page="${item.id}">
                <span class="text-base flex-shrink-0">${item.icon}</span>
                ${state.sidebarOpen ? `<span class="truncate">${item.label}</span>` : ''}
              </button>
            `).join('')}

            <div class="border-t border-gray-200 my-3"></div>

            <button class="nav-btn w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 text-gray-600 hover:bg-gray-50 relative" data-page="notifications">
              <span class="text-base flex-shrink-0">🔔</span>
              ${state.sidebarOpen ? `<span class="truncate">${this.t.app.sidebar.notifications}</span>` : ''}
              ${unread > 0 ? `<span class="${state.sidebarOpen ? 'ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full' : 'absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full'}">${state.sidebarOpen ? unread : ''}</span>` : ''}
            </button>

            <button class="nav-btn w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 text-gray-600 hover:bg-gray-50" data-page="profile">
              <span class="text-base flex-shrink-0">👤</span>
              ${state.sidebarOpen ? `<span class="truncate">${this.t.app.sidebar.profile}</span>` : ''}
            </button>

            <button class="nav-btn w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-3 text-gray-600 hover:bg-gray-50" data-page="public-page">
              <span class="text-base flex-shrink-0">🌐</span>
              ${state.sidebarOpen ? `<span class="truncate">${this.t.app.sidebar.publicPage}</span>` : ''}
            </button>
          </nav>

          <!-- Footer -->
          <div class="p-3 border-t border-gray-200 space-y-2">
            <button class="dark-mode-btn w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
              <span class="text-base flex-shrink-0">${state.darkMode ? '☀️' : '🌙'}</span>
              ${state.sidebarOpen ? `<span>${state.darkMode ? 'Light Mode' : 'Dark Mode'}</span>` : ''}
            </button>
            <button class="lang-btn w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
              <span class="text-base flex-shrink-0">🌍</span>
              ${state.sidebarOpen ? `<span>${state.language === 'vi' ? 'English' : 'Ti\u1ebfng Vi\u1ec7t'}</span>` : ''}
            </button>
            <button class="sidebar-toggle w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3">
              <span class="text-base flex-shrink-0">${state.sidebarOpen ? '◀' : '▶'}</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- ===== MOBILE HEADER ===== -->
      <div class="gp-mobile">
        <header class="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 h-[60px]">
          <div class="flex items-center justify-between px-4 h-full">
            <button class="menu-btn p-2 -ml-2 text-gray-600 active:bg-gray-100 rounded-xl">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">GP</div>
              <span class="font-semibold text-base text-gray-800">${clans.find(c => c.id === state.currentClanId)?.name || ''}</span>
            </div>
            <button class="lang-btn p-2 -mr-2 text-gray-600 active:bg-gray-100 rounded-xl text-sm font-bold">${state.language === 'vi' ? 'EN' : 'VI'}</button>
          </div>
        </header>

        <!-- Mobile bottom nav -->
        <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200 safe-area-bottom h-[70px]">
          <div class="flex items-stretch h-full">
            ${navItems.slice(0, 5).map(item => {
              const active = state.currentPage === item.id;
              return `<button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-100 relative ${active ? 'text-emerald-600' : 'text-gray-400'}" data-page="${item.id}">${active ? '<div class="absolute top-0 inset-x-0 h-0.5 bg-emerald-600 rounded-full mx-4"></div>' : ''}<span class="mt-1 text-xl">${item.icon}</span><span class="text-[11px] font-medium truncate">${item.label}</span></button>`;
            }).join('')}
            <button class="nav-btn flex-1 flex flex-col items-center justify-center gap-0.5 active:bg-gray-100 text-gray-400 relative" data-page="notifications"><span class="mt-1 text-xl relative">🔔${unread > 0 ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>' : ''}</span><span class="text-[11px] font-medium">${this.t.app.sidebar.notifications}</span></button>
          </div>
        </nav>

        <!-- Mobile drawer -->
        <div class="drawer-overlay fixed inset-0 z-50 bg-black/40 hidden opacity-0">
          <div class="drawer-panel absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl -translate-x-full">
            <div class="h-full flex flex-col overflow-y-auto">
              <div class="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex-shrink-0">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">${this.store.getCurrentPerson()?.gender === 'male' ? '♂' : '♀'}</div>
                  <div><div class="font-bold text-lg">${this.store.getCurrentPerson()?.name || ''}</div><div class="text-sm opacity-80">${this.t.admin.roles[this.store.getCurrentPerson()?.role] || ''}</div></div>
                </div>
              </div>
              <div class="p-4 border-b flex-shrink-0">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">${this.t.app.sidebar.clans}</p>
                <div class="space-y-2">${clans.map(c => `<button class="clan-btn w-full text-left px-4 py-3 rounded-xl text-sm transition flex items-center gap-3 ${state.currentClanId === c.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 active:bg-gray-50'}" data-clan="${c.id}"><span class="w-3 h-3 rounded-full flex-shrink-0 ${c.lineage === 'father' ? 'bg-blue-500' : c.lineage === 'mother' ? 'bg-pink-500' : 'bg-purple-500'}"></span><span class="truncate flex-1">${c.name}</span><span class="text-xs text-gray-400">${this.t.clan.lineage[c.lineage]}</span></button>`).join('')}</div>
              </div>
              <nav class="flex-1 overflow-y-auto p-4 space-y-1">
                ${navItems.map(item => `<button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 ${state.currentPage === item.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 active:bg-gray-50'}" data-page="${item.id}"><span class="text-lg">${item.icon}</span><span>${item.label}</span></button>`).join('')}
                <div class="border-t my-3"></div>
                <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="notifications"><span class="text-lg">🔔</span><span class="flex-1 text-left">${this.t.app.sidebar.notifications}</span>${unread > 0 ? `<span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">${unread}</span>` : ''}</button>
                <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="profile"><span class="text-lg">👤</span><span>${this.t.app.sidebar.profile}</span></button>
                <button class="nav-btn w-full text-left px-4 py-3.5 rounded-xl text-sm transition flex items-center gap-3 text-gray-600 active:bg-gray-50" data-page="public-page"><span class="text-lg">🌐</span><span>${this.t.app.sidebar.publicPage}</span></button>
              </nav>
              <div class="p-4 border-t flex-shrink-0">
                <button class="lang-btn-full w-full text-left px-4 py-3.5 rounded-xl text-sm text-gray-600 active:bg-gray-50 flex items-center gap-3"><span class="text-lg">🌍</span><span>${state.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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
    this.container.querySelector('.dark-mode-btn')?.addEventListener('click', () => this.store.toggleDarkMode());

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
