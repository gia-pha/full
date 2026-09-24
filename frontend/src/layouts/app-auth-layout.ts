import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('app-auth-layout')
export class AppAuthLayout extends LitElement {
  @property({ type: String }) title = '';
  @property({ type: String }) description = '';
  @property({ type: String }) logo = 'GP';
  @property({ type: Object }) content?: TemplateResult;
  @property({ type: String }) footer = '';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.minHeight = '100%';
  }

  override render() {
    return html`
      <div
        class="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-gray-900 dark:to-gray-800"
      >
        <div class="w-full max-w-md">
          <div class="mb-8 text-center">
            ${
              this.logo
                ? html`<div
                    class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white"
                  >
                    ${this.logo}
                  </div>`
                : html``
            }
            ${
              this.title
                ? html`<h1
                    class="text-2xl font-bold text-gray-800 dark:text-gray-100"
                  >
                    ${this.title}
                  </h1>`
                : html``
            }
            ${
              this.description
                ? html`<p class="mt-2 text-gray-500 dark:text-gray-400">
                    ${this.description}
                  </p>`
                : html``
            }
          </div>
          <div class="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
            ${this.content}
          </div>
          ${
            this.footer
              ? html`<p class="mt-6 text-center text-sm text-gray-400">
                  ${this.footer}
                </p>`
              : html``
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-auth-layout': AppAuthLayout;
  }
}
