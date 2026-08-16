import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-modal')
export class Modal extends LitElement {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) title = '';
  @property({ type: Object }) body?: TemplateResult;

  override createRenderRoot() {
    return this;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.open) this.dispatchClose();
  };

  private dispatchClose() {
    this.dispatchEvent(
      new CustomEvent('close', { bubbles: true, composed: true }),
    );
  }

  private handleOverlayClick = (e: Event) => {
    if (e.target === e.currentTarget) this.dispatchClose();
  };

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.handleKeyDown);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('open') && this.open) this.animateIn();
  }

  private animateIn() {
    const content = this.querySelector<HTMLElement>('.modal-content');
    if (!content) return;
    requestAnimationFrame(() => {
      if (!content.isConnected) return;
      content.style.transform = 'translateY(100%)';
      content.style.opacity = '0';
      requestAnimationFrame(() => {
        if (!content.isConnected) return;
        content.style.transition =
          'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s';
        content.style.transform = 'translateY(0)';
        content.style.opacity = '1';
      });
    });
  }

  override render() {
    if (!this.open) return html``;

    return html`
      <div
        class="modal-overlay fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
        @click=${this.handleOverlayClick}
      >
        <div
          class="modal-content flex w-full max-h-[90vh] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl dark:bg-gray-800 sm:m-4 sm:max-w-lg sm:rounded-2xl"
        >
          <div
            class="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6 sm:py-4"
          >
            <h3
              class="text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-lg"
              >${this.title}</h3
            >
            <button
              type="button"
              class="modal-close flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500 transition-colors hover:bg-gray-200 active:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Close"
              @click=${this.dispatchClose}
            >
              ✕
            </button>
          </div>
          <div class="overflow-y-auto p-4 sm:p-6">${this.body ?? html``}</div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-modal': Modal;
  }
}
