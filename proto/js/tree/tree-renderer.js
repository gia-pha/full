import { toFamilyChartData } from '../utils/data-converter.js';

class TreeRenderer {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.chart = null;
    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="tree-toolbar flex items-center gap-3 p-4 bg-white border-b border-gray-200">
        <input type="text" class="tree-search-input px-5 py-3 border border-gray-300 rounded-xl text-sm flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="${this.t.tree.search}" />
        <button class="tree-reset px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium flex-shrink-0 transition-colors">${this.t.tree.reset}</button>
      </div>
      <div class="tree-viewport relative bg-gray-50" style="height: calc(100% - 72px);">
        <div id="FamilyChart" class="f3" style="width:100%;height:100%;background:#f9fafb;"></div>
      </div>
    `;
    this.renderChart();
    this.bindEvents();
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
      this.chart = f3.createChart(chartEl, familyData);
      this.chart.setCardHtml()
        .setCardDisplay([
          ['first name', 'last name'],
          ['birth year', 'death year'],
          ['generation']
        ]);
      this.chart.updateTree({ initial: true });
      setTimeout(() => this._bindCardClicks(), 800);
      setTimeout(() => this._scaleChart(), 1200);
    } catch (err) {
      console.error('Family Chart error:', err);
      chartEl.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">Loi: ${err.message}</div>`;
    }
  }

  _scaleChart() {
    if (window.innerWidth < 1024) return;
    const chartEl = this.container.querySelector('#FamilyChart');
    if (!chartEl) return;
    const svg = chartEl.querySelector('svg');
    if (svg) {
      svg.style.transform = 'scale(1.35)';
      svg.style.transformOrigin = '50% 0%';
    } else {
      setTimeout(() => this._scaleChart(), 200);
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
    const searchInput = this.container.querySelector('.tree-search-input');
    let timer;
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => this.store.setSearchQuery(e.target.value), 300);
    });
    this.container.querySelector('.tree-reset')?.addEventListener('click', () => {
      this.chart?.resetZoom?.();
    });
  }

  updateTranslations(t) {
    this.t = t;
    this.init();
  }
}

export { TreeRenderer };
