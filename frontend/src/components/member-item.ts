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
      display: block;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.15s;
    }

    .item:hover {
      background-color: rgb(243 244 246 / 1);
    }

    .dark .item:hover {
      background-color: rgb(55 65 81 / 1);
    }

    .item[selected] {
      background-color: rgb(219 234 254 / 1);
    }

    .dark .item[selected] {
      background-color: rgb(30 58 138 / 1);
    }

    .info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .name {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(31 41 55 / 1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dark .name {
      color: rgb(229 231 235 / 1);
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: rgb(107 114 128 / 1);
    }

    .dark .meta {
      color: rgb(156 163 175 / 1);
    }

    .role {
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.6875rem;
      font-weight: 500;
      background-color: rgb(219 234 254 / 1);
      color: rgb(37 99 235 / 1);
    }

    .dark .role {
      background-color: rgb(30 58 138 / 1);
      color: rgb(147 197 253 / 1);
    }

    .deceased {
      color: rgb(156 163 175 / 1);
    }
  `;

  override render() {
    const person = this.person;
    if (!person) return html``;

    const deceased = isDeceased(person);

    return html`
      <div class="item" ?selected=${this.selected}>
        <person-avatar
          .person=${person}
          size="sm"
          shape="circle"
          ?show-deceased=${false}
        ></person-avatar>
        <div class="info">
          <span class="name">${getFullName(person)}</span>
          <div class="meta">
            ${
              this.showRole && person.data.role
                ? html`<span class="role">${person.data.role}</span>`
                : ''
            }
            ${
              deceased
                ? html`<span class="deceased">✝ ${person.data.deathYear}</span>`
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
