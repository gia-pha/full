import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-public-layout')
export class AppPublicLayout extends LitElement {
  @property({ type: Boolean, reflect: true }) noHero = false;
  @property({ type: Object }) hero?: TemplateResult;
  @property({ type: Object }) content?: TemplateResult;
  @property({ type: Object }) footer?: TemplateResult;
  @property({ type: String }) footerText = '';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'block';
    this.style.minHeight = '100%';
  }

  override render() {
    return html`
      <div class="min-h-full bg-white dark:bg-gray-900">
        ${
          !this.noHero && this.hero
            ? html`
              <div class="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div class="mx-auto max-w-4xl px-6 py-16 lg:px-8 lg:py-24">
                  ${this.hero}
                </div>
              </div>
            `
            : html``
        }
        <main
          class="mx-auto max-w-4xl space-y-12 px-6 py-12 lg:space-y-16 lg:px-8 lg:py-16"
        >
          ${this.content}
        </main>
        <footer
          class="border-t border-gray-200 bg-gray-50 py-6 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800"
        >
          ${this.footer}
          ${this.footerText}
        </footer>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-public-layout': AppPublicLayout;
  }
}
