import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { getGenderSymbol, getInitials, isDeceased } from '../utils/format.js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'rounded';

const sizes: Record<AvatarSize, { dim: string; font: string; symbol: string }> =
  {
    xs: { dim: 'w-6 h-6', font: 'text-xs', symbol: 'text-sm' },
    sm: { dim: 'w-8 h-8', font: 'text-sm', symbol: 'text-base' },
    md: { dim: 'w-12 h-12', font: 'text-lg', symbol: 'text-2xl' },
    lg: { dim: 'w-16 h-16', font: 'text-xl', symbol: 'text-3xl' },
    xl: { dim: 'w-20 h-20', font: 'text-2xl', symbol: 'text-4xl' },
  };

const shapes = { circle: 'rounded-full', rounded: 'rounded-2xl' };

function getColors(gender: string): string {
  if (gender === 'M')
    return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
  if (gender === 'F')
    return 'bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300';
  return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300';
}

@customElement('person-avatar')
export class PersonAvatar extends LitElement {
  @property({ type: Object }) declare person: Person;
  @property({ type: String, reflect: true }) size: AvatarSize = 'md';
  @property({ type: String, reflect: true }) shape: AvatarShape = 'circle';
  @property({ type: Boolean, reflect: true }) showDeceased = false;
  @property({ type: Boolean, reflect: true }) withName = false;

  override createRenderRoot() {
    return this;
  }

  override render() {
    const s = sizes[this.size];
    const isDeceasedPerson = isDeceased(this.person);

    return html`
      <div class="flex flex-col items-center gap-1">
        <div class="relative ${s.dim} ${shapes[this.shape]} ${getColors(this.person.data.gender)} flex items-center justify-center font-bold flex-shrink-0">
          ${
            this.shape === 'rounded'
              ? html`<span class="${s.symbol}">${getGenderSymbol(this.person)}</span>`
              : html`<span class="${s.font}">${getInitials(this.person)}</span>`
          }
          ${
            this.showDeceased && isDeceasedPerson
              ? html`<span class="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 text-white text-[10px] rounded-full flex items-center justify-center">✝</span>`
              : ''
          }
        </div>
        ${
          this.withName
            ? html`<span class="text-xs text-gray-600 dark:text-gray-400 truncate">${this.person.data.firstName} ${this.person.data.lastName}</span>`
            : ''
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'person-avatar': PersonAvatar;
  }
}
