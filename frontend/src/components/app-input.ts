import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type FieldType = 'text' | 'number' | 'date' | 'url';

const inputClasses =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

@customElement('app-input')
export class AppInput extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: String }) type: FieldType = 'text';
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;

  override createRenderRoot() {
    return this;
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
              class="text-xs text-gray-600 sm:text-sm dark:text-gray-300"
              >${this.label}</label
            >`
            : html``
        }
        <input
          type="${this.type}"
          class="${inputClasses}"
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
