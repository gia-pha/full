import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface SelectOption {
  value: string;
  label: string;
}

const selectClasses =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 sm:px-4 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

@customElement('app-select')
export class AppSelect extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: Array }) options: SelectOption[] = [];
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;

  override createRenderRoot() {
    return this;
  }

  private handleChange = (e: Event) => {
    this.value = (e.target as HTMLSelectElement).value;
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
        <select
          class="${selectClasses}"
          aria-label=${this.label}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @change=${this.handleChange}
        >
          ${
            this.placeholder
              ? html`<option value="">${this.placeholder}</option>`
              : html``
          }
          ${this.options.map(
            (opt) =>
              html`<option
                value="${opt.value}"
                ?selected=${opt.value === this.value}
                >${opt.label}</option
              >`,
          )}
        </select>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-select': AppSelect;
  }
}
