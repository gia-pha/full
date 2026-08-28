import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { type AvatarSize, sizes } from './person-avatar.js';

const overflowText: Record<AvatarSize, string> = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-xs',
  lg: 'text-sm',
  xl: 'text-sm',
};

@customElement('app-avatar-stack')
export class AvatarStack extends LitElement {
  @property({ type: Array }) people: Person[] = [];
  @property({ type: Number }) max = 5;
  @property({ type: String, reflect: true }) size: AvatarSize = 'sm';
  @property({ type: String }) label = '';
  @property({ type: Boolean }) showOverflow = true;

  override createRenderRoot() {
    return this;
  }

  override render() {
    const shown = this.people.slice(0, this.max);
    const hidden = this.people.length - shown.length;
    return html`
      <div class="flex items-center gap-3">
        <div class="flex -space-x-2">
          ${shown.map(
            (p) =>
              html`<div class="rounded-full border-2 border-white dark:border-gray-900 flex-shrink-0">
                <person-avatar .person=${p} size=${this.size}></person-avatar>
              </div>`,
          )}
          ${
            hidden > 0 && this.showOverflow
              ? html`<div class="rounded-full border-2 border-white dark:border-gray-900 flex-shrink-0">
                  <div
                    class="${sizes[this.size].dim} rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 ${overflowText[this.size]} font-medium flex items-center justify-center flex-shrink-0"
                    >+${hidden}</div
                  >
                </div>`
              : ''
          }
        </div>
        ${
          this.label
            ? html`<span class="text-sm text-gray-400">${this.label}</span>`
            : ''
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-avatar-stack': AvatarStack;
  }
}
