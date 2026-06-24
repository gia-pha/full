import { store } from './store.js';
import { TreeRenderer } from './tree/tree-renderer.js';
import { GpSidebar } from './components/sidebar.js';
import { GpMemberCard } from './components/member-card.js';
import { GpClanInfo } from './components/clan-info.js';
import { GpEvents } from './components/events.js';
import { GpCalendar } from './components/calendar.js';
import { GpFund } from './components/fund.js';
import { GpAdmin } from './components/admin.js';
import { GpNotifications } from './components/notifications.js';
import { GpMembersList } from './components/members-list.js';
import { GpProfile } from './components/profile.js';
import { GpInvite } from './components/invite.js';
import { GpAuth } from './components/auth.js';
import { GpPublicPage } from './components/public-page.js';
import { GpModal } from './components/modal.js';

class App {
  constructor() {
    this.i18n = null;
    this.components = {};
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupApp();
    this.subscribeToStore();
  }

  async loadData() {
    const [dataRes, i18nRes] = await Promise.all([
      fetch('data/sample-data.json'),
      fetch('data/i18n.json')
    ]);
    this.sampleData = await dataRes.json();
    this.i18n = await i18nRes.json();
    store.setData(this.sampleData);
  }

  t() {
    return this.i18n[store.state.language] || this.i18n.vi;
  }

  setupApp() {
    const root = document.getElementById('app');
    root.innerHTML = `
      <gp-auth id="auth-root" class="hidden"></gp-auth>
      <div id="main-root" class="hidden h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
        <gp-sidebar id="sidebar-root" class="lg:flex-shrink-0"></gp-sidebar>
        <div id="content-wrapper" class="flex-1 flex lg:flex-row flex-col overflow-hidden min-w-0 lg:pt-0 pt-[60px] lg:pb-0 pb-[70px]">
          <div id="content-root" class="flex-1 overflow-hidden min-h-0"></div>
          <gp-member-card id="membercard-root" class="hidden"></gp-member-card>
        </div>
        <gp-modal id="modal-root"></gp-modal>
      </div>
    `;
    this.renderAuth();
  }

  renderAuth() {
    const el = document.getElementById('auth-root');
    el.classList.remove('hidden');
    document.getElementById('main-root').classList.add('hidden');
    el.store = store;
    el.t = this.t();
    if (!el._connected) el.connectedCallback();
  }

  renderMain() {
    document.getElementById('auth-root').classList.add('hidden');
    document.getElementById('main-root').classList.remove('hidden');

    const sidebar = document.getElementById('sidebar-root');
    sidebar.store = store;
    sidebar.t = this.t();
    if (!sidebar._connected) sidebar.connectedCallback();

    const modal = document.getElementById('modal-root');
    modal.store = store;
    modal.t = this.t();
    if (!modal._connected) modal.connectedCallback();

    this.renderContent();
    this.renderMemberCard();
  }

  createComponent(tag, container, t) {
    const el = document.createElement(tag);
    el.store = store;
    el.t = t;
    container.innerHTML = '';
    container.appendChild(el);
    return el;
  }

  renderContent() {
    const root = document.getElementById('content-root');
    const page = store.state.currentPage;
    const t = this.t();

    const centeredPages = new Set(['notifications', 'profile', 'invite']);
    let container = root;
    if (centeredPages.has(page)) {
      root.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'h-full max-w-4xl mx-auto w-full';
      root.appendChild(wrapper);
      container = wrapper;
    }

    const tagMap = {
      'tree': null,
      'members': 'gp-members-list',
      'clan-info': 'gp-clan-info',
      'events': 'gp-events',
      'calendar': 'gp-calendar',
      'funds': 'gp-fund',
      'admin': 'gp-admin',
      'notifications': 'gp-notifications',
      'profile': 'gp-profile',
      'invite': 'gp-invite',
      'public-page': 'gp-public-page'
    };

    if (page === 'tree') {
      root.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'h-full w-full';
      root.appendChild(wrapper);
      this.components.tree = new TreeRenderer(wrapper, store, t);
    } else {
      const tag = tagMap[page];
      if (tag) {
        this.components[page] = this.createComponent(tag, container, t);
      } else {
        root.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400">Trang khong ton tai</div>';
      }
    }
  }

  renderMemberCard() {
    const el = document.getElementById('membercard-root');
    if (store.state.selectedPersonId) {
      el.classList.remove('hidden');
      el.store = store;
      el.t = this.t();
      el.render();
      el.bindEvents();
    } else {
      el.classList.add('hidden');
      el.innerHTML = '';
    }
  }

  subscribeToStore() {
    let authenticated = false, page, clan, selected, lang, darkMode, calMonth, calYear, calType;

    store.subscribe((state) => {
      if (state._authenticated && !authenticated) {
        authenticated = true;
        this.renderMain();
        return;
      }

      if (state.calendarMonth !== calMonth || state.calendarYear !== calYear || state.calendarType !== calType) {
        calMonth = state.calendarMonth;
        calYear = state.calendarYear;
        calType = state.calendarType;
        if (this.components.sidebar) { this.components.sidebar.render(); this.components.sidebar.bindEvents(); }
        if (this.components.events) { this.components.events.render(); this.components.events.bindEvents(); }
        if (this.components.calendar) { this.components.calendar.render(); this.components.calendar.bindEvents(); }
        return;
      }

      if (state.darkMode !== darkMode) {
        darkMode = state.darkMode;
        if (this.components.sidebar) { this.components.sidebar.render(); this.components.sidebar.bindEvents(); }
        return;
      }

      if (state.language !== lang) {
        lang = state.language;
        this.updateAllTranslations();
        return;
      }

      if (state.currentClanId !== clan) {
        clan = state.currentClanId;
        this.updateAllTranslations();
        return;
      }

      if (state.currentPage !== page) {
        page = state.currentPage;
        this.renderContent();
        const sidebar = document.getElementById('sidebar-root');
        if (sidebar) { sidebar.render(); sidebar.bindEvents(); }
        return;
      }

      if (state.selectedPersonId !== selected) {
        selected = state.selectedPersonId;
        this.renderMemberCard();
        if (this.components.tree) this.components.tree.renderChart?.();
        return;
      }

      const modal = document.getElementById('modal-root');
      if (modal) { modal.render(); modal.bindEvents(); }

      const sidebar = document.getElementById('sidebar-root');
      if (sidebar) { sidebar.render(); sidebar.bindEvents(); }
    });
  }

  updateAllTranslations() {
    const t = this.t();
    ['sidebar-root', 'modal-root', 'membercard-root', 'auth-root'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.t = t; el.updateTranslations?.(t); }
    });
    Object.entries(this.components).forEach(([name, comp]) => {
      comp?.updateTranslations?.(t);
    });
    this.renderContent();
    this.renderMemberCard();
  }
}

new App();
