import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type BadgeColor =
  | 'gray'
  | 'emerald'
  | 'amber'
  | 'blue'
  | 'purple'
  | 'red';
export type BadgeSize = 'sm' | 'md';

const colorClass: Record<BadgeColor, string> = {
  gray: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  emerald:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  purple:
    'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const sizeClass: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
};

@customElement('app-badge')
export class AppBadge extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) color: BadgeColor = 'gray';
  @property({ type: String }) size: BadgeSize = 'md';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'inline-block';
  }

  override render() {
    const color = colorClass[this.color] ?? colorClass.gray;
    const size = sizeClass[this.size] ?? sizeClass.md;
    return html`
      <span class="app-badge rounded-full font-medium ${size} ${color}"
        >${this.label}</span
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-badge': AppBadge;
  }
}
