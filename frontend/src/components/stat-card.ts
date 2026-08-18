import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type StatCardColor = 'blue' | 'amber' | 'green' | 'purple';

const COLORS: Record<StatCardColor, string> = {
  blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900',
  amber: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900',
  green: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900',
  purple:
    'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-900',
};

@customElement('app-stat-card')
export class StatCard extends LitElement {
  @property({ type: String }) icon = '';
  @property({ type: String }) label = '';
  @property({ type: String }) value = '';
  @property({ type: String }) color: StatCardColor = 'blue';
  @property({ type: String }) classes = '';

  override createRenderRoot() {
    return this;
  }

  override render() {
    const color = COLORS[this.color] ?? COLORS.blue;
    return html`
      <div
        class="stat-card rounded-xl p-4 lg:p-5 border ${color} ${this.classes}"
      >
        <p class="text-sm text-gray-500 mb-2 dark:text-gray-400">${this.icon} ${this.label}</p>
        <p
          class="stat-card-value font-semibold text-gray-800 text-base leading-snug dark:text-gray-100"
          >${this.value}</p
        >
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-stat-card': StatCard;
  }
}
