import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { getFullName, isDeceased } from '../utils/format.js';
import './person-avatar.js';

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  treasurer:
    'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  member: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

@customElement('member-item')
export class MemberItem extends LitElement {
  @property({ type: Object }) declare person: Person;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: String }) honorific = '';
  @property({ type: String }) roleLabel = '';
  @property({ type: Boolean }) showButtons = false;
  @property({ type: Boolean }) isCurrentPerson = false;
  @property({ type: Boolean }) locked = false;

  override createRenderRoot() {
    return this;
  }

  override render() {
    const person = this.person;
    if (!person) return html``;

    const deceased = isDeceased(person);
    const fullName = getFullName(person);
    const role = person.data.role || 'member';
    const roleClass = roleColors[role] || roleColors.member;
    const displayRole = this.roleLabel || role;

    const years = person.data.birthYear
      ? `${person.data.birthYear}${deceased ? `-${person.data.deathYear}` : ''}`
      : '';

    return html`
      <button
        class="member-item w-full text-left p-4 rounded-xl border transition-all ${
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
                this.isCurrentPerson
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
            <span class="px-3 py-1 rounded-full text-xs font-medium ${roleClass}">${displayRole}</span>
            ${this.locked ? html`<span class="text-gray-400">🔒</span>` : ''}
            ${
              this.showButtons
                ? html`
                  <div class="flex items-center gap-1">
                    <button class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400" title="View">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400" title="Edit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  </div>
                `
                : ''
            }
          </div>
        </div>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'member-item': MemberItem;
  }
}
