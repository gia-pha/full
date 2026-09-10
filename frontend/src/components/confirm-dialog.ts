import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nMixin } from '../i18n/i18n-mixin.js';
import './modal.js';

@customElement('app-confirm-dialog')
export class ConfirmDialog extends I18nMixin(LitElement) {
  @property({ type: Boolean, reflect: true }) open = false;
  @property({ type: String }) title = '';
  @property({ type: String }) message = '';
  @property({ type: String }) confirmLabel = '';
  @property({ type: String }) cancelLabel = '';
  @property({ type: Boolean }) danger = false;

  override createRenderRoot() {
    return this;
  }

  private handleConfirm = () => {
    this.dispatchEvent(
      new CustomEvent('confirm', { bubbles: true, composed: true }),
    );
  };

  private handleCancel = () => {
    this.dispatchEvent(
      new CustomEvent('cancel', { bubbles: true, composed: true }),
    );
  };

  override render() {
    const confirmText = this.confirmLabel || this.t('dialog.confirm');
    const cancelText = this.cancelLabel || this.t('common.cancel');

    const body = html`
      <p class="confirm-message text-sm text-gray-600 dark:text-gray-300">
        ${this.message}
      </p>
      <div class="mt-5 flex gap-3">
        <button
          type="button"
          class="confirm-cancel flex-1 rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          @click=${this.handleCancel}
        >
          ${cancelText}
        </button>
        <button
          type="button"
          class="confirm-ok flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors ${
            this.danger
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }"
          @click=${this.handleConfirm}
        >
          ${confirmText}
        </button>
      </div>
    `;

    return html`
      <app-modal
        ?open=${this.open}
        .title=${this.title}
        .body=${body}
        @close=${this.handleCancel}
      ></app-modal>
    `;
  }
}

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const el = document.createElement('app-confirm-dialog') as ConfirmDialog;
    el.title = options.title ?? '';
    el.message = options.message;
    if (options.confirmLabel !== undefined)
      el.confirmLabel = options.confirmLabel;
    if (options.cancelLabel !== undefined) el.cancelLabel = options.cancelLabel;
    el.danger = options.danger ?? false;

    const cleanup = (result: boolean) => {
      el.removeEventListener('confirm', onConfirm);
      el.removeEventListener('cancel', onCancel);
      el.remove();
      resolve(result);
    };
    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);

    el.addEventListener('confirm', onConfirm);
    el.addEventListener('cancel', onCancel);
    document.body.appendChild(el);
    el.open = true;
  });
}

declare global {
  interface HTMLElementTagNameMap {
    'app-confirm-dialog': ConfirmDialog;
  }
}
