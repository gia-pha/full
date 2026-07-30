import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { notificationTypes } from '../consts/index.js';
import { t } from '../i18n.js';
import type { Notification } from '../types/index.js';
import { formatDate } from '../utils/format.js';

@customElement('notification-item')
export class NotificationItem extends LitElement {
  @property({ type: Object }) declare notification: Notification;
  @property({ type: Boolean, reflect: true }) dismissed = false;
  @property({ type: String }) locale = 'vi';

  override createRenderRoot() {
    return this;
  }

  private handleDismiss(e: Event) {
    e.stopPropagation();
    this.dismissed = true;
    this.dispatchEvent(
      new CustomEvent('dismiss', { bubbles: true, composed: true }),
    );
  }

  private handleMarkRead(e: Event) {
    e.stopPropagation();
    if (this.notification) {
      this.notification.read = true;
      this.dispatchEvent(
        new CustomEvent('mark-read', { bubbles: true, composed: true }),
      );
    }
  }

  override render() {
    if (!this.notification || this.dismissed) return html``;

    const n = this.notification;
    const icon = notificationTypes.find((t) => t.name === n.type)?.icon || '📌';
    const unread = !n.read;
    const bgClass = unread
      ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800'
      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';

    return html`
      <div class="flex items-start gap-4 p-4 lg:p-5 rounded-xl border ${bgClass}">
        <div class="text-2xl flex-shrink-0 mt-0.5">${icon}</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-3">
            <h4 class="font-semibold text-gray-800 dark:text-gray-200 truncate">${n.title}</h4>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-xs text-gray-400 dark:text-gray-500">${formatDate(n.date)}</span>
              ${unread ? html`<span class="w-2.5 h-2.5 bg-emerald-500 rounded-full flex-shrink-0"></span>` : ''}
              <button
                class="p-1 text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition-colors"
                title="Delete"
                @click=${this.handleDismiss}
              >✕</button>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">${n.message}</p>
          ${unread ? html`<button class="mt-2 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium" @click=${this.handleMarkRead}>${t(this.locale, 'notifications.markRead')}</button>` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notification-item': NotificationItem;
  }
}
