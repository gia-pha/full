import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { getFullName } from '../utils/format.js';

export type RelationCardColor = 'pink' | 'blue';

const CARD: Record<RelationCardColor, string> = {
  pink: 'border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950',
  blue: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
};
const LABEL: Record<RelationCardColor, string> = {
  pink: 'text-pink-500 dark:text-pink-300',
  blue: 'text-blue-500 dark:text-blue-300',
};
const NAME: Record<RelationCardColor, string> = {
  pink: 'text-pink-700 dark:text-pink-200',
  blue: 'text-blue-700 dark:text-blue-200',
};

@customElement('app-relation-card')
export class RelationCard extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: Object }) declare person: Person;
  @property({ type: String }) color: RelationCardColor = 'blue';

  override createRenderRoot() {
    return this;
  }

  private handleClick = () => {
    this.dispatchEvent(
      new CustomEvent('select', {
        bubbles: true,
        composed: true,
        detail: { person: this.person },
      }),
    );
  };

  override render() {
    const color = CARD[this.color] ?? CARD.blue;
    const label = LABEL[this.color] ?? LABEL.blue;
    const name = NAME[this.color] ?? NAME.blue;
    const person = this.person;
    const { birthYear, deathYear } = person?.data ?? {};
    const fullName = person ? getFullName(person) : '';
    const text = birthYear
      ? `${fullName} (${birthYear}${deathYear ? ` - ${deathYear}` : ''})`
      : fullName;
    return html`
      <div class="relation-card p-4 rounded-xl border ${color}">
        <p class="text-xs ${label} mb-2">${this.label}</p>
        <button
          type="button"
          class="relation-card-link font-semibold ${name} hover:underline"
          @click=${this.handleClick}
        >${text}</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-relation-card': RelationCard;
  }
}
