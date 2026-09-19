import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type PageVariant = 'default' | 'centered' | 'canvas';

@customElement('app-page-layout')
export class AppPageLayout extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: Object }) actions?: TemplateResult;
  @property({ type: Object }) content?: TemplateResult;
  @property({ type: Object }) sidebar?: TemplateResult;
  @property({ type: String, reflect: true }) variant: PageVariant = 'default';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'block';
    this.style.height = '100%';
  }

  override render() {
    const centered = this.variant === 'centered';
    const canvas = this.variant === 'canvas';
    return html`
      <div class="relative flex h-full w-full overflow-hidden">
        <div class="layout-sidebar flex h-full flex-shrink-0">
          ${this.sidebar}
        </div>
        <div
          class="layout-main flex min-w-0 flex-1 flex-col overflow-hidden pt-[60px] pb-[70px] ${
            centered || canvas ? 'bg-gray-50' : 'bg-white'
          } dark:bg-gray-900 lg:pt-0 lg:pb-0"
        >
          <div
            class="page flex h-full min-w-0 flex-1 flex-col overflow-hidden ${
              centered ? 'mx-auto w-full max-w-4xl' : 'w-full'
            }"
          >
            ${
              this.title || this.actions
                ? html`
                  <header
                    class="flex flex-shrink-0 items-center justify-between gap-4 border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6 lg:p-8"
                  >
                    ${
                      this.title
                        ? html`<h2
                            class="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl"
                          >
                            ${this.title}
                          </h2>`
                        : html``
                    }
                    <div class="flex flex-shrink-0 items-center gap-2">
                      ${this.actions}
                    </div>
                  </header>
                `
                : html``
            }
            ${
              canvas
                ? html`<div
                    class="tree-viewport relative min-h-0 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900"
                  >
                    ${this.content}
                  </div>`
                : html`<div
                    class="page-content min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
                  >
                    ${this.content}
                  </div>`
            }
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-page-layout': AppPageLayout;
  }
}
