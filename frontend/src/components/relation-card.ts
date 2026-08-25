import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Person } from '../types/index.js';
import { getFullName, getGenderSymbol } from '../utils/format.js';

export type RelationCardColor = 'pink' | 'blue' | 'green';

const CARD: Record<RelationCardColor, string> = {
  pink: 'border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950',
  blue: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950',
  green: 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950',
};
const HOVER: Record<RelationCardColor, string> = {
  pink: 'hover:bg-pink-100 dark:hover:bg-pink-900',
  blue: 'hover:bg-blue-100 dark:hover:bg-blue-900',
  green: 'hover:bg-green-100 dark:hover:bg-green-900',
};
const LABEL: Record<RelationCardColor, string> = {
  pink: 'text-pink-500 dark:text-pink-300',
  blue: 'text-blue-500 dark:text-blue-300',
  green: 'text-green-500 dark:text-green-300',
};
const NAME: Record<RelationCardColor, string> = {
  pink: 'text-pink-700 dark:text-pink-200',
  blue: 'text-blue-700 dark:text-blue-200',
  green: 'text-green-700 dark:text-green-200',
};

@customElement('app-relation-card')
export class RelationCard extends LitElement {
  @property({ type: String }) label = '';
  @property({ type: Object }) declare person: Person;
  @property({ type: String }) color: RelationCardColor = 'blue';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'block';
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
    const card = CARD[this.color] ?? CARD.blue;
    const hover = HOVER[this.color] ?? HOVER.blue;
    const label = LABEL[this.color] ?? LABEL.blue;
    const name = NAME[this.color] ?? NAME.blue;
    const person = this.person;
    const { birthYear, deathYear } = person?.data ?? {};
    const fullName = person ? getFullName(person) : '';
    const text = birthYear
      ? `${fullName} (${birthYear}${deathYear ? ` - ${deathYear}` : ''})`
      : fullName;
    const genderColor =
      person?.data.gender === 'M' ? 'text-blue-500' : 'text-pink-500';
    return html`
      <button
        type="button"
        class="relation-card block w-full p-4 rounded-xl border text-left transition-colors ${card} ${hover}"
        @click=${this.handleClick}
      >
        <span class="block text-xs ${label} mb-2">${this.label}</span>
        <span class="flex items-center gap-2 font-semibold ${name}">
          ${
            person
              ? html`<span class="text-lg ${genderColor}"
                  >${getGenderSymbol(person)}</span
                >`
              : html``
          }
          <span class="truncate">${text}</span>
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-relation-card': RelationCard;
  }
}
