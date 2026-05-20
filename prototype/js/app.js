import { store } from './store.js';
import { TreeRenderer } from './tree/tree-renderer.js';
import { SidebarComponent } from './components/sidebar.js';
import { MemberCardComponent } from './components/member-card.js';
import { ClanInfoComponent } from './components/clan-info.js';
import { EventsComponent } from './components/events.js';
import { FundComponent } from './components/fund.js';
import { AdminComponent } from './components/admin.js';
import { NotificationsComponent } from './components/notifications.js';
import { MembersListComponent } from './components/members-list.js';
import { ProfileComponent } from './components/profile.js';
import { InviteComponent } from './components/invite.js';
import { AuthComponent } from './components/auth.js';
import { PublicPageComponent } from './components/public-page.js';
import { ModalComponent } from './components/modal.js';

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
      <div id="auth-root" class="hidden"></div>
      <div id="main-root" class="h-screen w-screen flex flex-col lg:flex-row overflow-hidden">
        <div id="sidebar-root" class="lg:flex-shrink-0"></div>
        <div id="content-wrapper" class="flex-1 flex lg:flex-row flex-col overflow-hidden min-w-0 lg:pt-0 pt-[60px] lg:pb-0 pb-[70px]">
          <div id="content-root" class="flex-1 overflow-hidden min-h-0"></div>
          <div id="membercard-root" class="hidden"></div>
        </div>
        <div id="modal-root"></div>
      </div>
    `;
    this.renderAuth();
  }

  renderAuth() {
    document.getElementById('auth-root').classList.remove('hidden');
    document.getElementById('main-root').classList.add('hidden');
    this.components.auth = new AuthComponent(
      document.getElementById('auth-root'), store, this.t()
    );
  }

  renderMain() {
    document.getElementById('auth-root').classList.add('hidden');
    document.getElementById('main-root').classList.remove('hidden');

    this.components.sidebar = new SidebarComponent(
      document.getElementById('sidebar-root'), store, this.t()
    );
    this.components.modal = new ModalComponent(
      document.getElementById('modal-root'), store, this.t()
    );
    this.renderContent();
    this.renderMemberCard();
  }

  renderContent() {
    const root = document.getElementById('content-root');
    root.innerHTML = '';
    const page = store.state.currentPage;
    const t = this.t();

    // Only these pages are centered on large screens
    const centeredPages = new Set(['notifications', 'profile', 'invite']);
    let container = root;
    if (centeredPages.has(page)) {
      const wrapper = document.createElement('div');
      wrapper.className = 'h-full max-w-4xl mx-auto w-full';
      root.appendChild(wrapper);
      container = wrapper;
    }

    const constructors = {
      'tree': TreeRenderer,
      'members': MembersListComponent,
      'clan-info': ClanInfoComponent,
      'events': EventsComponent,
      'funds': FundComponent,
      'admin': AdminComponent,
      'notifications': NotificationsComponent,
      'profile': ProfileComponent,
      'invite': InviteComponent,
      'public-page': PublicPageComponent
    };

    const Ctor = constructors[page];
    if (Ctor) {
      this.components[page] = new Ctor(container, store, t);
    } else {
      root.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400">Trang khong ton tai</div>';
    }
  }

  renderMemberCard() {
    const root = document.getElementById('membercard-root');
    if (store.state.selectedPersonId) {
      root.classList.remove('hidden');
      this.components.memberCard = new MemberCardComponent(root, store, this.t());
    } else {
      root.classList.add('hidden');
      root.innerHTML = '';
    }
  }

  subscribeToStore() {
    let authenticated = false, page, clan, selected, lang, darkMode;

    store.subscribe((state) => {
      if (state._authenticated && !authenticated) {
        authenticated = true;
        this.renderMain();
        return;
      }

      if (state.darkMode !== darkMode) {
        darkMode = state.darkMode;
        if (this.components.sidebar) {
          this.components.sidebar.render();
          this.components.sidebar.bindEvents();
        }
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
        if (this.components.sidebar) {
          this.components.sidebar.render();
          this.components.sidebar.bindEvents();
        }
        return;
      }

      if (state.selectedPersonId !== selected) {
        selected = state.selectedPersonId;
        this.renderMemberCard();
        if (this.components.tree) this.components.tree.renderChart?.();
        return;
      }

      if (this.components.modal) {
        this.components.modal.render();
        this.components.modal.bindEvents();
      }

      if (this.components.sidebar) {
        this.components.sidebar.render();
        this.components.sidebar.bindEvents();
      }
    });
  }

  updateAllTranslations() {
    const t = this.t();
    Object.entries(this.components).forEach(([name, comp]) => {
      comp?.updateTranslations?.(t);
    });
    this.renderContent();
    this.renderMemberCard();
  }
}

new App();
