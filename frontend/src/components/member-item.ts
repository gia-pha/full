import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { MemberAction, Person } from '../types/index.js';
import { getFullName, isDeceased } from '../utils/format.js';
import './person-avatar.js';
import './role-badge.js';

@customElement('member-item')
export class MemberItem extends LitElement {
  @property({ type: Object }) declare person: Person;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: String }) honorific = '';
  @property({ type: Boolean }) locked = false;
  @property({ type: Array }) actions: MemberAction[] = [];

  override createRenderRoot() {
    return this;
  }

  override render() {
    const person = this.person;
    if (!person) return html``;

    const deceased = isDeceased(person);
    const fullName = getFullName(person);
    const years = person.data.birthYear
      ? `${person.data.birthYear}${deceased ? `-${person.data.deathYear}` : ''}`
      : '';

    return html`
      <div
        class="member-item w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
          this.selected
            ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700'
            : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/20'
        }"
      >
        <div class="flex items-center gap-4">
          <person-avatar
            .person=${person}
            size="sm"
          ></person-avatar>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-800 text-base truncate dark:text-gray-200">${fullName}</span>
              ${
                this.selected
                  ? html`<span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium flex-shrink-0 dark:bg-emerald-900 dark:text-emerald-300">You</span>`
                  : ''
              }
              ${
                deceased
                  ? html`<span class="text-gray-400 flex-shrink-0">✝</span>`
                  : ''
              }
            </div>
            <div class="flex items-center gap-3 mt-1 flex-wrap">
              ${
                this.honorific
                  ? html`<span class="text-xs text-emerald-600 font-medium dark:text-emerald-400">${this.honorific}</span>`
                  : ''
              }
              ${
                years
                  ? html`<span class="text-xs text-gray-400">${years}</span>`
                  : ''
              }
              <span class="text-xs text-gray-400">Gen ${person.data.generation}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <role-badge name="${person.data.role || ''}"></role-badge>
            ${this.locked ? html`<span class="text-gray-400">🔒</span>` : ''}
            ${this.actions.map((action) => html`
              <button
                class="p-1.5 rounded-lg transition-colors ${action.color || 'bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'}"
                title="${action.label}"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  action.onClick();
                }}
              >
                ${action.icon}
              </button>
            `)}
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
