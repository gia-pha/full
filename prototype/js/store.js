class Store {
  constructor() {
    this._state = {
      data: null,
      currentClanId: null,
      currentPersonId: null,
      selectedPersonId: null,
      currentPage: 'tree',
      language: 'vi',
      treeZoom: 1,
      treePanX: 0,
      treePanY: 0,
      expandedNodes: new Set(),
      searchQuery: '',
      sidebarOpen: true,
      notifications: [],
      modalOpen: null,
      modalData: null,
      builderMode: false,
      darkMode: false
    };
    this._listeners = [];
  }

  get state() {
    return { ...this._state };
  }

  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  _notify() {
    this._listeners.forEach(l => l({ ...this._state }));
  }

  setData(data) {
    this._state.data = data;
    this._state.currentClanId = data.clans[0].id;
    this._state.currentPersonId = data.currentUser.id;
    this._state.notifications = data.notifications.filter(
      n => n.personId === data.currentUser.id
    );
    this._notify();
  }

  setCurrentClan(clanId) {
    this._state.currentClanId = clanId;
    this._state.expandedNodes = new Set();
    this._state.treePanX = 0;
    this._state.treePanY = 0;
    this._state.treeZoom = 1;
    this._notify();
  }

  setSelectedPerson(personId) {
    this._state.selectedPersonId = personId;
    this._notify();
  }

  setCurrentPage(page) {
    this._state.currentPage = page;
    this._notify();
  }

  setLanguage(lang) {
    this._state.language = lang;
    this._notify();
  }

  setTreeZoom(zoom) {
    this._state.treeZoom = Math.max(0.2, Math.min(3, zoom));
    this._notify();
  }

  setTreePan(x, y) {
    this._state.treePanX = x;
    this._state.treePanY = y;
    this._notify();
  }

  toggleNode(personId) {
    if (this._state.expandedNodes.has(personId)) {
      this._state.expandedNodes.delete(personId);
    } else {
      this._state.expandedNodes.add(personId);
    }
    this._notify();
  }

  expandAll() {
    if (this._state.data) {
      const clanPersons = this._state.data.persons.filter(
        p => p.clanId === this._state.currentClanId
      );
      clanPersons.forEach(p => this._state.expandedNodes.add(p.id));
    }
    this._notify();
  }

  collapseAll() {
    this._state.expandedNodes = new Set();
    this._notify();
  }

  setSearchQuery(query) {
    this._state.searchQuery = query;
    this._notify();
  }

  toggleSidebar() {
    this._state.sidebarOpen = !this._state.sidebarOpen;
    this._notify();
  }

  markNotificationRead(notifId) {
    this._state.notifications = this._state.notifications.map(n =>
      n.id === notifId ? { ...n, read: true } : n
    );
    this._notify();
  }

  markAllNotificationsRead() {
    this._state.notifications = this._state.notifications.map(n => ({ ...n, read: true }));
    this._notify();
  }

  deleteNotification(notifId) {
    this._state.notifications = this._state.notifications.filter(n => n.id !== notifId);
    this._notify();
  }

  setNotificationPreferences(prefs) {
    if (this._state.data) {
      const person = this._state.data.persons.find(
        p => p.id === this._state.currentPersonId
      );
      if (person) {
        person.notificationPreferences = { ...person.notificationPreferences, ...prefs };
      }
    }
    this._notify();
  }

  openModal(type, data = null) {
    this._state.modalOpen = type;
    this._state.modalData = data;
    this._notify();
  }

  closeModal() {
    this._state.modalOpen = null;
    this._state.modalData = null;
    this._notify();
  }

  getUnreadCount() {
    return this._state.notifications.filter(n => !n.read).length;
  }

  getCurrentClan() {
    return this._state.data?.clans?.find(c => c.id === this._state.currentClanId);
  }

  getCurrentPerson() {
    return this._state.data?.persons?.find(p => p.id === this._state.currentPersonId);
  }

  getSelectedPerson() {
    return this._state.data?.persons?.find(p => p.id === this._state.selectedPersonId);
  }

  getClanMembers(clanId) {
    return this._state.data?.persons?.filter(p => p.clanId === clanId) || [];
  }

  getClanEvents(clanId) {
    return this._state.data?.events?.filter(e => e.clanId === clanId) || [];
  }

  getClanFund(clanId) {
    return this._state.data?.funds?.[clanId] || null;
  }

  getPersonById(id) {
    return this._state.data?.persons?.find(p => p.id === id) || null;
  }

  setBuilderMode(enabled) {
    this._state.builderMode = enabled;
    this._notify();
  }

  toggleDarkMode() {
    this._state.darkMode = !this._state.darkMode;
    document.documentElement.classList.toggle('dark', this._state.darkMode);
    this._notify();
  }
}

export const store = new Store();
