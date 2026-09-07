import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultRoles } from '../consts/index.js';
import { t } from '../i18n.js';
import type { Person } from '../types/index.js';
import { getFullName, isDeceased } from '../utils/format.js';
import './info-card.js';
import './relation-card.js';
import type { RelationCardColor } from './relation-card.js';
import './person-avatar.js';

@customElement('member-card')
export class MemberCard extends LitElement {
  @property({ type: Object }) declare person: Person;
  @property({ type: Array }) persons: Person[] = [];
  @property({ type: String }) currentPersonId = '';
  @property({ type: String }) honorific = '';
  @property({ type: String }) roleLabel = '';
  @property({ type: Boolean }) locked = false;
  @property({ type: String }) locale = 'vi';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'flex';
    this.style.width = '100%';
    this.style.height = '100%';
  }

  private findPerson(id: string): Person | undefined {
    return this.persons.find((p) => p.id === id);
  }

  private dispatchClose() {
    this.dispatchEvent(
      new CustomEvent('close', { bubbles: true, composed: true }),
    );
  }

  private dispatchSelect(id: string) {
    this.dispatchEvent(
      new CustomEvent('select', {
        bubbles: true,
        composed: true,
        detail: { id },
      }),
    );
  }

  private handleRelationSelect = (e: Event) => {
    e.stopPropagation();
    const { person } = (e as CustomEvent).detail as { person: Person };
    this.dispatchSelect(person.id);
  };

  private renderRelationGroup(
    groupLabel: string,
    cardLabel: string,
    people: Person[],
    color: RelationCardColor,
  ): TemplateResult {
    if (people.length === 0) return html``;
    return html`
      <div>
        <p class="mb-3 text-sm text-gray-400 dark:text-gray-500">
          ${groupLabel} (${people.length})
        </p>
        <div class="space-y-2">
          ${people.map(
            (p) => html`
              <app-relation-card
                label=${cardLabel}
                .person=${p}
                color=${color}
                @select=${this.handleRelationSelect}
              ></app-relation-card>
            `,
          )}
        </div>
      </div>
    `;
  }

  override render() {
    if (!this.person) return html``;

    const person = this.person;
    const content = this.renderContent(person);

    return html`
      <div
        class="member-card-panel flex h-full w-full flex-col overflow-hidden bg-white dark:bg-gray-800"
      >
        <div
          class="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700"
        >
          <h3 class="font-semibold text-gray-800 dark:text-gray-100">
            ${t(this.locale, 'members.title')}
          </h3>
          <button
            type="button"
            class="member-close flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 active:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            @click=${this.dispatchClose}
          >
            ✕
          </button>
        </div>
        <div class="flex-1 overflow-y-auto">${content}</div>
      </div>
    `;
  }

  private renderContent(person: Person): TemplateResult {
    const isSelf = person.id === this.currentPersonId;
    const deceased = isDeceased(person);
    const spouses = person.rels.spouses
      .map((id) => this.findPerson(id))
      .filter((p): p is Person => Boolean(p));
    const parents = person.rels.parents
      .map((id) => this.findPerson(id))
      .filter((p): p is Person => Boolean(p));
    const children = (person.rels.children || [])
      .map((id) => this.findPerson(id))
      .filter((p): p is Person => Boolean(p));
    const notes = person.data.notes as string | undefined;
    const role = defaultRoles.find((r) => r.name === person.data.role);
    const roleText =
      this.roleLabel ||
      (role ? t(this.locale, `roles.${role.name}`) : person.data.role) ||
      '-';
    const genderText =
      person.data.gender === 'M'
        ? t(this.locale, 'common.male')
        : t(this.locale, 'common.female');
    const canEdit =
      person.data.role === 'editor' || person.data.role === 'admin';

    return html`
      <div class="space-y-5 p-5 lg:p-6">
        <div class="flex items-center gap-4">
          <person-avatar .person=${person} size="xl"></person-avatar>
          <div class="min-w-0 flex-1">
            <h2
              class="truncate text-lg font-bold text-gray-800 dark:text-gray-100 lg:text-xl"
            >
              ${getFullName(person)}
            </h2>
            ${
              this.honorific
                ? html`<p
                    class="mt-0.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                  >
                    ${t(this.locale, 'members.honorific', {
                      value: this.honorific,
                    })}
                  </p>`
                : html``
            }
            <div class="mt-1.5 flex items-center gap-2">
              ${
                isSelf
                  ? html`<span
                      class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      >${t(this.locale, 'members.you')}</span
                    >`
                  : html``
              }
              ${
                deceased
                  ? html`<span
                      class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      >✝ ${t(this.locale, 'members.deceased')}</span
                    >`
                  : html``
              }
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <app-info-card
            label=${t(this.locale, 'members.birthYear')}
            value=${person.data.birthYear || '-'}
            color="blue"
          ></app-info-card>
          <app-info-card
            label=${t(this.locale, 'members.gender')}
            value=${genderText}
            color=${person.data.gender === 'M' ? 'blue' : 'pink'}
          ></app-info-card>
          <app-info-card
            label=${t(this.locale, 'members.generation')}
            value=${String(person.data.generation)}
            color="purple"
          ></app-info-card>
          <app-info-card
            label=${t(this.locale, 'members.role')}
            value=${roleText}
            color="amber"
          ></app-info-card>
        </div>

        ${this.renderRelationGroup(
          t(this.locale, 'members.spouses'),
          t(this.locale, 'members.spouse'),
          spouses,
          'pink',
        )}
        ${this.renderRelationGroup(
          t(this.locale, 'members.parents'),
          t(this.locale, 'members.parent'),
          parents,
          'blue',
        )}
        ${this.renderRelationGroup(
          t(this.locale, 'members.children'),
          t(this.locale, 'members.child'),
          children,
          'green',
        )}

        ${
          this.locked && !isSelf
            ? html`<div
                class="rounded-xl bg-gray-100 p-4 text-center dark:bg-gray-700/50"
              >
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  🔒 ${t(this.locale, 'members.limitedAccess')}
                </p>
              </div>`
            : notes
              ? html`<div
                  class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950"
                >
                  <p class="mb-1 text-xs text-amber-500">
                    ${t(this.locale, 'members.notes')}
                  </p>
                  <p class="text-gray-700 dark:text-gray-200">${notes}</p>
                </div>`
              : html``
        }

        <div class="flex gap-3 pt-2">
          ${
            canEdit
              ? html`<button
                  type="button"
                  class="member-edit flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                  @click=${() =>
                    this.dispatchEvent(
                      new CustomEvent('edit', {
                        bubbles: true,
                        composed: true,
                      }),
                    )}
                >
                  ✏️ ${t(this.locale, 'common.edit')}
                </button>`
              : html``
          }
          ${
            !isSelf
              ? html`<button
                  type="button"
                  class="member-delete rounded-xl bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                  @click=${() =>
                    this.dispatchEvent(
                      new CustomEvent('delete', {
                        bubbles: true,
                        composed: true,
                      }),
                    )}
                >
                  🗑️ ${t(this.locale, 'common.delete')}
                </button>`
              : html``
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'member-card': MemberCard;
  }
}
