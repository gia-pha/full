import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { getGenderIcon } from '../utils/avatar.js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizes: Record<AvatarSize, { dim: string; icon: string }> = {
  xs: { dim: 'w-6 h-6', icon: 'w-4 h-4' },
  sm: { dim: 'w-8 h-8', icon: 'w-5 h-5' },
  md: { dim: 'w-12 h-12', icon: 'w-7 h-7' },
  lg: { dim: 'w-16 h-16', icon: 'w-10 h-10' },
  xl: { dim: 'w-20 h-20', icon: 'w-12 h-12' },
};

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

  override createRenderRoot() {
    return this;
  }

  override render() {
    const s = sizes[this.size];
    const avatarUrl = this.person.data.avatar;

    const avatarContent = avatarUrl
      ? html`<img src="${avatarUrl}" alt="${this.person.data.firstName} ${this.person.data.lastName}" class="w-full h-full rounded-full object-cover" />`
      : html`<div class="w-full h-full rounded-full ${getColors(this.person.data.gender)} flex items-center justify-center flex-shrink-0" style="padding: 0.4rem">
          ${getGenderIcon(this.person.data.gender)}
        </div>`;

    return html`
      <div class="${s.dim} rounded-full flex-shrink-0 overflow-hidden">
        ${avatarContent}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'person-avatar': PersonAvatar;
  }
}
