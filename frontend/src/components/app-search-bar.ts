import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { iconClose, iconSearch } from '../icons/index.js';

export type SearchDetail = {
  readonly value: string;
};

const inputClasses =
  'w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100';

@customElement('app-search-bar')
export class AppSearchBar extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) ariaLabel = 'Search';
  @property({ type: Number }) debounce = 200;
  @property({ type: Boolean }) autofocus = false;

  private timer?: ReturnType<typeof setTimeout>;

  override createRenderRoot() {
    return this;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timer) clearTimeout(this.timer);
  }

  private emit(value: string) {
    this.dispatchEvent(
      new CustomEvent<SearchDetail>('search', {
        bubbles: true,
        composed: true,
        detail: { value },
      }),
    );
  }

  private handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    this.value = value;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.emit(value), this.debounce);
  };

  private handleSubmit = (e: Event) => {
    e.preventDefault();
    if (this.timer) clearTimeout(this.timer);
    this.emit(this.value);
  };

  private handleClear = () => {
    if (this.timer) clearTimeout(this.timer);
    this.value = '';
    this.emit('');
    this.renderRoot.querySelector<HTMLInputElement>('input')?.focus();
  };

  override render() {
    return html`
      <form class="relative" @submit=${this.handleSubmit}>
        <span
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
        >
          ${iconSearch}
        </span>
        <input
          type="search"
          class="${inputClasses}"
          .value=${this.value}
          placeholder=${this.placeholder}
          aria-label=${this.ariaLabel}
          ?autofocus=${this.autofocus}
          @input=${this.handleInput}
        />
        ${
          this.value
            ? html`<button
              type="button"
              class="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Clear search"
              @click=${this.handleClear}
            >
              ${iconClose}
            </button>`
            : ''
        }
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-search-bar': AppSearchBar;
  }
}
