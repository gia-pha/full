import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'soft-danger';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  'soft-danger':
    'bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950 dark:hover:bg-red-900 dark:text-red-400',
};

@customElement('app-button')
export class AppButton extends LitElement {
  @property({ type: String }) variant: ButtonVariant = 'primary';
  @property({ type: String }) icon = '';
  @property({ type: String }) label = '';
  @property({ type: Boolean }) disabled = false;

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'inline-block';
  }

  override render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled}
        class="inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${variantStyles[this.variant] || variantStyles.primary} ${this.disabled ? 'opacity-50 cursor-not-allowed' : ''}"
      >
        ${this.icon ? html`<span>${this.icon}</span>` : html``}
        ${this.label ? html`<span>${this.label}</span>` : html``}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-button': AppButton;
  }
}
