import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { defaultRoles } from '../consts/index.js';
import { t } from '../i18n.js';

@customElement('role-badge')
export class RoleBadge extends LitElement {
  @property({ type: String }) name = '';
  @property({ type: String }) label = '';
  @property({ type: String }) locale = 'vi';

  override createRenderRoot() {
    return this;
  }

  override render() {
    const role = defaultRoles.find((r) => r.name === this.name);
    if (!role) return html``;

    const key = `roles.${role.name}`;
    const translated = t(this.locale, key);
    const displayLabel =
      this.label || (translated === key ? role.label : translated);

    return html`
      <span class="px-3 py-1 rounded-full text-xs font-medium ${role.color}">${displayLabel}</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'role-badge': RoleBadge;
  }
}
