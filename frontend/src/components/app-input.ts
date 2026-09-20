import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type FieldType = 'text' | 'number' | 'date' | 'url';
export type InputSize = 'md' | 'lg';

const baseInputClasses =
  'w-full border bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

const sizeInputClasses: Record<InputSize, string> = {
  md: 'mt-1 rounded-lg border-gray-300 px-3 py-2.5 text-sm text-gray-800 sm:px-4',
  lg: 'mt-2 rounded-xl border-gray-300 px-5 py-3 text-base text-gray-800',
};

const sizeLabelClasses: Record<InputSize, string> = {
  md: 'text-xs text-gray-600 sm:text-sm dark:text-gray-300',
  lg: 'text-sm text-gray-600 dark:text-gray-300',
};

@customElement('app-input')
export class AppInput extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) type: FieldType = 'text';
  @property({ type: String }) size: InputSize = 'md';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'block';
  }

  private handleInput = (e: Event) => {
    this.value = (e.target as HTMLInputElement).value;
  };

  override render() {
    return html`
      <div>
        ${
          this.label
            ? html`<label
              class="${sizeLabelClasses[this.size] || sizeLabelClasses.md}"
              >${this.label}</label
            >`
            : html``
        }
        <input
          type="${this.type}"
          class="${baseInputClasses} ${sizeInputClasses[this.size] || sizeInputClasses.md}"
          value=${this.value}
          placeholder=${this.placeholder}
          aria-label=${this.label}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @input=${this.handleInput}
        />
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-input': AppInput;
  }
}
