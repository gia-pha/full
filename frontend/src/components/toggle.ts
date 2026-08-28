import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ToggleDetail = {
  readonly checked: boolean;
};

@customElement('app-toggle')
export class AppToggle extends LitElement {
  @property({ type: Boolean }) checked = false;
  @property({ type: String }) label = '';
  @property({ type: Boolean }) disabled = false;

  override createRenderRoot() {
    return this;
  }

  private handleSwitch = () => {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent<ToggleDetail>('change', {
        bubbles: true,
        composed: true,
        detail: { checked: this.checked },
      }),
    );
  };

  override render() {
    return html`
      <label
        class="inline-flex items-center justify-between gap-4 select-none ${this.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
      >
        ${
          this.label
            ? html`<span class="text-gray-700 dark:text-gray-300"
              >${this.label}</span
            >`
            : html``
        }
        <button
          type="button"
          role="switch"
          aria-checked=${this.checked}
          aria-label=${this.label}
          ?disabled=${this.disabled}
          class="relative inline-flex h-[26px] w-12 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${this.checked ? 'bg-emerald-600' : 'bg-gray-300 dark:bg-gray-600'}"
          @click=${this.handleSwitch}
        >
          <span
            class="absolute top-0.5 left-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${this.checked ? 'translate-x-5' : 'translate-x-0'}"
          ></span>
        </button>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-toggle': AppToggle;
  }
}
