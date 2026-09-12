import 'family-chart/styles/family-chart.css';
import './family-tree.css';
import { createChart, type EditTree, icons } from 'family-chart';
import { html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { I18nMixin } from '../i18n/i18n-mixin.js';
import type { Person } from '../types/index.js';
import { getGenderIconSvg } from '../utils/avatar.js';
import { getFullName } from '../utils/format.js';
import { toFamilyChartData } from '../utils/tree.js';
import './empty-state.js';

type TreeChart = ReturnType<typeof createChart>;
type TreeCard = ReturnType<TreeChart['setCardHtml']>;
type CardDatum = Parameters<EditTree['open']>[0];

const CARD_DISPLAY = [
  ['firstName', 'lastName'],
  ['birthYear', 'deathYear'],
  ['generation'],
];

const EDIT_FIELDS = [
  'firstName',
  'lastName',
  'birthYear',
  'deathYear',
  'gender',
  'notes',
];

@customElement('app-family-tree')
export class AppFamilyTree extends I18nMixin(LitElement) {
  @property({ type: Array })
  persons: Person[] = [];

  @property({ type: String })
  clanId?: string;

  @property({ type: String })
  mainPersonId?: string;

  @property({ type: Boolean })
  editable = false;

  @state()
  query = '';

  @state()
  mobileSearchOpen = false;

  private chart?: TreeChart;
  private chartContainer?: HTMLElement;
  private card?: TreeCard;
  private editTree?: EditTree;
  private searchTimer?: ReturnType<typeof setTimeout>;

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'block';
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.searchTimer);
    this.chart = undefined;
    this.chartContainer = undefined;
    this.card = undefined;
    this.editTree = undefined;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (changed.has('editable')) {
      this.destroyChart();
    }
    this.syncChart();
    const initialMain = changed.get('mainPersonId') === undefined;
    if (
      changed.has('mainPersonId') &&
      !initialMain &&
      this.chart &&
      this.mainPersonId
    ) {
      this.chart.updateMainId(this.mainPersonId);
      this.chart.updateTree({ tree_position: 'main_to_middle' });
    }
  }

  private filtered(): Person[] {
    if (!this.clanId) return this.persons;
    return this.persons.filter((p) => p.data.clanId === this.clanId);
  }

  private syncChart() {
    const container = this.querySelector<HTMLElement>('.tree-chart');
    if (!container) {
      this.chart = undefined;
      this.chartContainer = undefined;
      this.card = undefined;
      return;
    }
    const data = toFamilyChartData(
      this.persons,
      this.clanId,
      this.mainPersonId,
    );
    if (!this.chart) {
      this.createChart(container, data);
      return;
    }
    if (container !== this.chartContainer) {
      this.destroyChart();
      this.createChart(container, data);
      return;
    }
    this.chart.updateData(data);
  }

  private createChart(
    container: HTMLElement,
    data: ReturnType<typeof toFamilyChartData>,
  ) {
    const chart = createChart(container, data)
      .setTransitionTime(1000)
      .setCardXSpacing(350)
      .setCardYSpacing(200);
    const card = chart.setCardHtml();
    this.card = card;
    card
      .setCardDisplay(CARD_DISPLAY)
      .setDefaultPersonIcon((person) =>
        getGenderIconSvg(String(person.data.data.gender)),
      )
      .setOnCardClick((e: MouseEvent, d: { data: CardDatum }) =>
        this.handleCardClick(e, d),
      );
    if (this.editable) {
      this.setupEditing(chart, card);
    }
    if (this.mainPersonId) {
      chart.updateMainId(this.mainPersonId);
    }
    chart.updateTree({ initial: true });
    this.chart = chart;
    this.chartContainer = container;
  }

  private setupEditing(chart: TreeChart, card: TreeCard) {
    const editTree = chart
      .editTree()
      .fixed()
      .setFields(EDIT_FIELDS)
      .setEditFirst(true);
    editTree.setEdit();
    editTree.setOnChange(() => this.emitChange());
    editTree.setOnFormCreation(({ cont }) => this.styleFormCloseButton(cont));
    this.editTree = editTree;
    const self = this;
    card.setOnCardUpdate(function (this: HTMLElement, d: { data: CardDatum }) {
      self.decorateCard(this, d.data);
    });
  }

  private decorateCard(element: HTMLElement, datum: CardDatum) {
    if (datum._new_rel_data) return;
    if (this.editTree?.isRemovingRelative()) return;
    if (element.querySelector('.f3-card-edit-btn')) return;
    const card = element.querySelector<HTMLElement>('.card-inner') ?? element;
    card.appendChild(this.createCardButton('edit', datum));
    card.appendChild(this.createCardButton('add', datum));
  }

  private createCardButton(
    kind: 'edit' | 'add',
    datum: CardDatum,
  ): HTMLElement {
    const button = document.createElement('div');
    button.className =
      kind === 'edit'
        ? 'f3-svg-circle-hover f3-card-edit-btn'
        : 'f3-svg-circle-hover f3-card-add-btn';
    button.style.cssText = `cursor:pointer;width:24px;height:24px;position:absolute;top:4px;${
      kind === 'edit' ? 'right:4px' : 'right:32px'
    };z-index:10;`;
    button.innerHTML =
      kind === 'edit' ? icons.userEditSvgIcon() : icons.userPlusSvgIcon();
    const svg = button.querySelector('svg');
    if (svg) {
      svg.style.padding = '0';
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
    }
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.editTree) return;
      this.editTree.open(datum);
      if (kind === 'add') {
        document.querySelector<HTMLElement>('.f3-add-relative-btn')?.click();
      }
    });
    return button;
  }

  private handleCardClick(e: MouseEvent, d: { data: CardDatum }) {
    const editTree = this.editTree;
    if (editTree?.isAddingRelative()) {
      if (d.data._new_rel_data) {
        editTree.open(d.data);
        return;
      }
      editTree.addRelativeInstance.onCancel?.();
      editTree.closeForm();
    } else if (editTree?.isRemovingRelative()) {
      editTree.open(d.data);
      return;
    }
    this.card?.onCardClickDefault?.(
      e,
      d as unknown as Parameters<TreeCard['onCardClickDefault']>[1],
    );
    this.emitPersonClick(String(d.data.id));
  }

  private styleFormCloseButton(formCont: HTMLElement) {
    const closeBtn = formCont.querySelector<HTMLElement>('.f3-close-btn');
    if (!closeBtn || closeBtn.querySelector('svg')) return;
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  }

  private emitChange() {
    const data = this.editTree?.exportData();
    if (!Array.isArray(data)) return;
    this.dispatchEvent(
      new CustomEvent('tree-changed', {
        bubbles: true,
        composed: true,
        detail: { persons: data as unknown as Person[] },
      }),
    );
  }

  private destroyChart() {
    if (this.editTree) {
      try {
        this.editTree.destroy();
      } catch {
        // chart may already be torn down
      }
    }
    this.editTree = undefined;
    if (this.chartContainer) {
      this.chartContainer.innerHTML = '';
    }
    this.chart = undefined;
    this.chartContainer = undefined;
    this.card = undefined;
  }

  private emitPersonClick(id: string) {
    const person = this.filtered().find((p) => p.id === id);
    if (!person) return;
    this.dispatchEvent(
      new CustomEvent('person-click', {
        bubbles: true,
        composed: true,
        detail: { person },
      }),
    );
  }

  private handleSearchInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    this.query = value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.focusMatch(value), 300);
  };

  private focusMatch(value: string) {
    const q = value.trim().toLowerCase();
    if (!q || !this.chart) return;
    const match = this.filtered().find((p) =>
      getFullName(p).toLowerCase().includes(q),
    );
    if (!match) return;
    this.chart.updateMainId(match.id);
    this.chart.updateTree({ tree_position: 'main_to_middle' });
  }

  private handleReset = () => {
    this.query = '';
    if (!this.chart) return;
    if (this.mainPersonId) {
      this.chart.updateMainId(this.mainPersonId);
    }
    this.chart.updateTree({ tree_position: 'fit' });
  };

  private toggleMobileSearch = () => {
    this.mobileSearchOpen = !this.mobileSearchOpen;
  };

  override render() {
    const hasData = this.filtered().length > 0;
    return html`
      <div
        class="relative flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900"
      >
        <div
          class="hidden lg:flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <input
            type="text"
            class="tree-search px-5 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm flex-1 max-w-xs bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            .value=${this.query}
            @input=${this.handleSearchInput}
            placeholder=${this.t('tree.search')}
          />
          <button
            type="button"
            class="tree-reset px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium flex-shrink-0 transition-colors"
            @click=${this.handleReset}
          >
            ${this.t('tree.reset')}
          </button>
        </div>
        <button
          type="button"
          class="tree-toggle-search lg:hidden absolute top-3 right-3 z-30 p-2.5 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm transition-colors"
          aria-label=${this.t('tree.search')}
          @click=${this.toggleMobileSearch}
        >
          🔍
        </button>
        <div
          class="tree-mobile-toolbar lg:hidden absolute top-14 left-3 right-3 z-30 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-2 p-2 transform transition-all duration-300 ${
            this.mobileSearchOpen
              ? ''
              : '-translate-y-full opacity-0 pointer-events-none'
          }"
        >
          <input
            type="text"
            class="tree-search-mobile px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex-1 min-w-0 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            .value=${this.query}
            @input=${this.handleSearchInput}
            placeholder=${this.t('tree.search')}
          />
          <button
            type="button"
            class="tree-reset-mobile px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium flex-shrink-0 transition-colors"
            @click=${this.handleReset}
          >
            ${this.t('tree.reset')}
          </button>
        </div>
        <div
          class="tree-viewport relative flex-1 min-h-0 ${
            hasData ? 'bg-gray-900' : 'bg-gray-50 dark:bg-gray-900'
          }"
        >
          ${
            hasData
              ? html`<div class="tree-chart f3 w-full h-full"></div>`
              : html`<app-empty-state
                class="h-full flex items-center justify-center"
                icon="🌳"
                message=${this.t('tree.noData')}
              ></app-empty-state>`
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-family-tree': AppFamilyTree;
  }
}
