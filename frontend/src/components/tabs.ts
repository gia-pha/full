import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface TabDef {
  readonly id: string;
  readonly label: string;
}

export type TabsDetail = {
  readonly id: string;
};

@customElement('app-tabs')
export class AppTabs extends LitElement {
  @property({ type: Array }) tabs: TabDef[] = [];
  @property({ type: String }) value = '';

  override createRenderRoot() {
    return this;
  }

  private handleClick = (e: Event, id: string) => {
    e.preventDefault();
    if (id === this.value) return;
    this.value = id;
    this.dispatchEvent(
      new CustomEvent<TabsDetail>('change', {
        bubbles: true,
        composed: true,
        detail: { id },
      }),
    );
  };

  override render() {
    return html`
      <div class="flex gap-3 flex-wrap" role="tablist">
        ${this.tabs.map(
          (tab) => html`
            <button
              type="button"
              role="tab"
              aria-selected=${tab.id === this.value}
              class="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${tab.id === this.value ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
              @click=${(e: Event) => this.handleClick(e, tab.id)}
            >
              ${tab.label}
            </button>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-tabs': AppTabs;
  }
}
