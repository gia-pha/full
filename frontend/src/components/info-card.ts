import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type InfoCardColor = 'blue' | 'pink' | 'purple' | 'amber';

const COLORS: Record<InfoCardColor, string> = {
  blue: 'bg-blue-50 dark:bg-blue-950',
  pink: 'bg-pink-50 dark:bg-pink-950',
  purple: 'bg-purple-50 dark:bg-purple-950',
  amber: 'bg-amber-50 dark:bg-amber-950',
};

@customElement('app-info-card')
export class InfoCard extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) color: InfoCardColor = 'blue';

  override createRenderRoot() {
    return this;
  }

  override render() {
    const color = COLORS[this.color] ?? COLORS.blue;
    return html`
      <div class="info-card rounded-xl p-3 lg:p-4 ${color}">
        <p class="text-xs text-gray-400 mb-1 dark:text-gray-500">${this.label}</p>
        <p
          class="info-card-value font-semibold text-gray-800 dark:text-gray-100"
          >${this.value}</p
        >
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-info-card': InfoCard;
  }
}
