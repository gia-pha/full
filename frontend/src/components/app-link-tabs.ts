import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nMixin } from '../i18n/i18n-mixin.js';

export interface LinkTab {
  readonly href: string;
  readonly label: string;
}

const baseTab =
  'flex-1 rounded-xl py-3 text-center text-sm font-medium transition-colors';
const activeTab = 'bg-emerald-600 text-white';
const inactiveTab =
  'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';

@customElement('app-link-tabs')
export class AppLinkTabs extends I18nMixin(LitElement) {
  @property({ type: Array }) tabs: LinkTab[] = [];
  @property({ type: String }) active = '';

  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <div class="mb-6 flex gap-2">
        ${this.tabs.map((tab) => {
          const style = tab.href === this.active ? activeTab : inactiveTab;
          return html`
            <a href=${tab.href} class="${baseTab} ${style}"
              >${this.t(tab.label)}</a
            >
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-link-tabs': AppLinkTabs;
  }
}
