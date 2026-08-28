import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-empty-state')
export class AppEmptyState extends LitElement {
  @property({ type: String }) icon = '📭';
  @property({ type: String }) message = '';

  override createRenderRoot() {
    return this;
  }

  override render() {
    return html`
      <div class="text-center py-16 text-gray-400 dark:text-gray-500">
        <div class="text-5xl mb-4">${this.icon}</div>
        <p class="text-base">${this.message}</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-empty-state': AppEmptyState;
  }
}
