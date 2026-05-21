import { toFamilyChartData } from '../utils/data-converter.js';

class TreeRenderer {
  constructor(container, store, t) {
    this.container = container;
    this.store = store;
    this.t = t;
    this.chart = null;
    this.editTree = null;
    this.showCardButtons = true;
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
      chartEl.innerHTML = `<div class="flex items-center justify-center h-full text-gray-400 text-lg">${this.t.tree.noData}</div>`;
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
          ])
          .setDefaultPersonIcon((d) => {
            if (d.data.gender === 'F') return femaleIcon();
            return maleIcon();
          });

        function femaleIcon() {
          return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.75 13C13.75 12.31 14.31 11.75 15 11.75S16.25 12.31 16.25 13 15.69 14.25 15 14.25 13.75 13.69 13.75 13M22 12V22H2V12C2 6.5 6.5 2 12 2S22 6.5 22 12M4 12C4 16.41 7.59 20 12 20S20 16.41 20 12C20 11.21 19.88 10.45 19.67 9.74C18.95 9.91 18.2 10 17.42 10C14.05 10 11.07 8.33 9.26 5.77C8.28 8.16 6.41 10.09 4.05 11.14C4 11.42 4 11.71 4 12M9 14.25C9.69 14.25 10.25 13.69 10.25 13S9.69 11.75 9 11.75 7.75 12.31 7.75 13 8.31 14.25 9 14.25Z"/></svg>`;
        }

        function maleIcon() {
          return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9,11.75A1.25,1.25 0 0,0 7.75,13A1.25,1.25 0 0,0 9,14.25A1.25,1.25 0 0,0 10.25,13A1.25,1.25 0 0,0 9,11.75M15,11.75A1.25,1.25 0 0,0 13.75,13A1.25,1.25 0 0,0 15,14.25A1.25,1.25 0 0,0 16.25,13A1.25,1.25 0 0,0 15,11.75M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,11.71 4,11.42 4.05,11.14C6.41,10.09 8.28,8.16 9.26,5.77C11.07,8.33 14.05,10 17.42,10C18.2,10 18.95,9.91 19.67,9.74C19.88,10.45 20,11.21 20,12C20,16.41 16.41,20 12,20Z"/></svg>`;
        }

        if (this.showCardButtons) {
          const self = this;
          this.card.setOnCardUpdate(function(d) {
            if (d.data._new_rel_data) return;
            if (self.editTree.isRemovingRelative()) return;

            const card = this.querySelector('.card-inner');
            if (card.querySelector('.f3-card-edit-btn')) return;

            d3.select(this).select('.card').style('cursor', 'default');

            // Edit button
            d3.select(card)
              .append('div')
              .attr('class', 'f3-svg-circle-hover f3-card-edit-btn')
              .attr('style', 'cursor:pointer;width:24px;height:24px;position:absolute;top:4px;right:4px;z-index:10;')
              .html(f3.icons.userEditSvgIcon())
              .select('svg')
              .style('padding', '0')
              .attr('width', 16)
              .attr('height', 16)
              .on('click', (e) => {
                e.stopPropagation();
                self.editTree.open(d.data);
                if (self.editTree.isAddingRelative()) return;
                if (self.editTree.isRemovingRelative()) return;
                self.card.onCardClickDefault(e, d);
              });

            // Add relative button
            d3.select(card)
              .append('div')
              .attr('class', 'f3-svg-circle-hover f3-card-add-btn')
              .attr('style', 'cursor:pointer;width:24px;height:24px;position:absolute;top:4px;right:32px;z-index:10;')
              .html(f3.icons.userPlusSvgIcon())
              .select('svg')
              .style('padding', '0')
              .attr('width', 16)
              .attr('height', 16)
              .on('click', (e) => {
                e.stopPropagation();
                self.editTree.open(d.data);
                self.card.onCardClickDefault(e, d);
                document.querySelector('.f3-add-relative-btn')?.click();
              });
          });

          this.card.setOnCardClick((e, d) => {
          if (this.editTree.isAddingRelative()) {
            if (d.data._new_rel_data) {
              this.editTree.open(d.data);
            } else {
              this.editTree.addRelativeInstance.onCancel();
              this.editTree.closeForm();
              this.card.onCardClickDefault(e, d);
            }
          } else if (this.editTree.isRemovingRelative()) {
            this.editTree.open(d.data);
          } else {
            this.card.onCardClickDefault(e, d);
          }
          });
        }

        this.editTree = this.chart.editTree()
          .fixed(true)
          .setFields(['first name', 'last name', 'birth year', 'death year', 'gender', 'notes'])
          .setEditFirst(true);
        this.editTree.setEdit();

        // Add close button to edit modal
        setTimeout(() => {
          const formCont = document.querySelector('.f3-form-cont');
          if (formCont && !formCont.querySelector('.f3-form-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'f3-form-close absolute top-3 right-3 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-500 z-50';
            closeBtn.textContent = '✕';
            closeBtn.onclick = (e) => {
              e.stopPropagation();
              this.editTree.closeForm();
            };
            formCont.style.position = 'relative';
            formCont.insertBefore(closeBtn, formCont.firstChild);
          }
        }, 500);

        this.chart.updateTree({ initial: true });
    
    } catch (err) {
      console.error('Family Chart error:', err);
      chartEl.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 text-sm p-4 text-center">Loi: ${err.message}</div>`;
    }
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
  }

  updateTranslations(t) {
    this.t = t;
    this.init();
  }
}

export { TreeRenderer };
