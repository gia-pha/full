import { toFamilyChartData } from '../utils/data-converter.js';

class TreeRenderer {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.chart = null;
    this.editTree = null;
    this.init();
  }

  init() {
    this.container.classList.add('relative', 'flex', 'flex-col', 'h-full', 'overflow-hidden');
    this.container.innerHTML = `
      <div class="tree-toolbar-mobile lg:hidden absolute top-14 left-3 right-3 z-30 bg-white shadow-lg border border-gray-200 rounded-xl flex items-center gap-2 p-2 transform -translate-y-full opacity-0 transition-all duration-300 pointer-events-none">
        <input type="text" class="tree-search-input-mobile px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="${this.t.tree.search}" />
        <button class="tree-search-btn-mobile px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex-shrink-0 transition-colors">Tim</button>
        <button class="tree-reset-mobile px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex-shrink-0 transition-colors">${this.t.tree.reset}</button>
      </div>
      <div class="tree-toolbar-desktop lg:flex items-center gap-3 p-4 bg-white border-b border-gray-200">
        <input type="text" class="tree-search-input px-5 py-3 border border-gray-300 rounded-xl text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="${this.t.tree.search}" />
        <button class="tree-reset px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium flex-shrink-0 transition-colors">${this.t.tree.reset}</button>
        <div class="flex items-center gap-2 ml-auto">
          <button class="tree-toggle-light p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition-colors" title="Light mode">☀️</button>
          <button class="tree-toggle-builder-desktop p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition-colors" title="Chuyen doi hien thi">🏗️</button>
        </div>
      </div>
      <div class="tree-mobile-actions lg:hidden absolute top-3 right-3 z-30 flex items-center gap-2">
        <button class="tree-toggle-search p-2.5 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 rounded-xl text-sm transition-colors">🔍</button>
      </div>
      <div class="tree-viewport relative flex-1 min-h-0 bg-gray-50">
        <div id="FamilyChart" class="f3" style="width:100%;height:100%;"></div>
      </div>
    `;
    this.renderChart();
    this.bindEvents();
    this._updateResponsive();
    if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
    this._resizeHandler = () => this._updateResponsive();
    window.addEventListener('resize', this._resizeHandler);
  }

  _updateResponsive() {
    const isLg = window.innerWidth >= 1024;
    const desktop = this.container.querySelector('.tree-toolbar-desktop');
    const mobileActions = this.container.querySelector('.tree-mobile-actions');
    const mobileToolbar = this.container.querySelector('.tree-toolbar-mobile');
    if (desktop) desktop.style.display = isLg ? 'flex' : 'none';
    if (mobileActions) mobileActions.style.display = isLg ? 'none' : 'flex';
    if (mobileToolbar) mobileToolbar.style.display = isLg ? 'none' : '';
  }

  renderChart() {
    const chartEl = this.container.querySelector('#FamilyChart');
    if (!chartEl) return;

    const familyData = toFamilyChartData(this.store.state.currentClanId);
    if (familyData.length === 0) {
      chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-lg">Khong co du lieu</div>';
      return;
    }

    if (typeof f3 === 'undefined') {
      if (!this._loadAttempted) {
        this._loadAttempted = true;
        chartEl.innerHTML = '<div class="flex items-center justify-center h-full text-gray-400 text-lg">Dang tai library...</div>';
        setTimeout(() => this.renderChart(), 500);
      }
      return;
    }

    try {
        chartEl.innerHTML = '';
        this.chart = f3.createChart(chartEl, familyData)
          .setTransitionTime(1000)
          .setCardXSpacing(350)
          .setCardYSpacing(200);

        this.card = this.chart.setCardHtml()
          .setCardDisplay([
            ['first name', 'last name'],
            ['birth year', 'death year'],
            ['generation']
          ]);

        if (this.store.state.builderMode) {
          this.editTree = this.chart.editTree()
            .fixed(true)
            .setFields(['first name', 'last name', 'birth year', 'death year', 'gender', 'notes'])
            .setEditFirst(true)
            .setCardClickOpen(this.card)
            .setOnChange(() => {
              const updated = this.editTree.exportData();
              console.log('Data updated:', updated);
            });
          this.editTree.setEdit();
        }

        this.chart.updateTree({ initial: true });
        if (this.store.state.builderMode) {
          this.editTree.open(this.chart.getMainDatum());
        } else {
          setTimeout(() => this._bindCardClicks(), 800);
        }
    
    } catch (err) {
      console.error('Family Chart error:', err);
      chartEl.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">Loi: ${err.message}</div>`;
    }
  }

 
  _bindCardClicks() {
    const chartEl = this.container.querySelector('#FamilyChart');
    if (!chartEl) return;
    if (this._clickHandler) chartEl.removeEventListener('click', this._clickHandler);

    this._clickHandler = (e) => {
      const g = e.target.closest('g[data-id]');
      if (!g) return;
      this.store.setSelectedPerson(g.getAttribute('data-id'));
    };
    chartEl.addEventListener('click', this._clickHandler);
  }

  bindEvents() {
    let timer;
    const handleSearch = (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => this.store.setSearchQuery(e.target.value), 300);
    };
    this.container.querySelector('.tree-search-input')?.addEventListener('input', handleSearch);
    this.container.querySelector('.tree-search-input-mobile')?.addEventListener('input', handleSearch);
    this.container.querySelector('.tree-reset')?.addEventListener('click', () => {
      this.chart?.resetZoom?.();
    });
    this.container.querySelector('.tree-reset-mobile')?.addEventListener('click', () => {
      const input = this.container.querySelector('.tree-search-input-mobile');
      if (input) input.value = '';
      this.store.setSearchQuery('');
      this.chart?.resetZoom?.();
    });
    this.container.querySelector('.tree-toggle-search')?.addEventListener('click', () => {
      const toolbar = this.container.querySelector('.tree-toolbar-mobile');
      if (toolbar) {
        toolbar.classList.toggle('-translate-y-full');
        toolbar.classList.toggle('opacity-0');
        toolbar.classList.toggle('pointer-events-none');
      }
    });
    this.container.querySelector('.tree-toggle-builder-desktop')?.addEventListener('click', () => {
      this._toggleBuilder();
    });
    this.container.querySelector('.tree-toggle-light')?.addEventListener('click', () => {
      this._toggleLight();
    });
  }

  _toggleLight() {
    this.container.classList.toggle('tree-light');
  }

  _toggleBuilder() {
    const enabled = !this.store.state.builderMode;
    this.store.setBuilderMode(enabled);

    if (enabled) {
      const chartEl = this.container.querySelector('#FamilyChart');
      if (this._clickHandler && chartEl) {
        chartEl.removeEventListener('click', this._clickHandler);
        this._clickHandler = null;
      }
      this.renderChart();
    } else if (this.editTree) {
      this.editTree.destroy();
      this.editTree = null;
      this.renderChart();
    }
  }

  updateTranslations(t) {
    this.t = t;
    this.init();
  }
}

export { TreeRenderer };
