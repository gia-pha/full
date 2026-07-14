import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { getFullName, isDeceased } from '../utils/format.js';
import './person-avatar.js';

@customElement('member-item')
export class MemberItem extends LitElement {
  @property({ type: Object }) declare person: Person;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean }) showRole = false;

  static override styles = css`
    :host {
      @apply block;
    }

    .item[selected] {
      @apply bg-blue-100;
    }

    .dark .item[selected] {
      @apply bg-blue-900;
    }
  `;

  override render() {
    const person = this.person;
    if (!person) return html``;

    const deceased = isDeceased(person);

    return html`
      <div
        class="item flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        ?selected=${this.selected}
      >
        <person-avatar
          .person=${person}
          size="sm"
          shape="circle"
          ?show-deceased=${false}
        ></person-avatar>
        <div class="flex flex-col min-w-0">
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">${getFullName(person)}</span>
          <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            ${
              this.showRole && person.data.role
                ? html`<span class="px-1.5 py-0.5 rounded text-[0.6875rem] font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">${person.data.role}</span>`
                : ''
            }
            ${
              deceased
                ? html`<span class="text-gray-400">✝ ${person.data.deathYear}</span>`
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'member-item': MemberItem;
  }
}
