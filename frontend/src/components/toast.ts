import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

const VARIANTS: Record<
  ToastVariant,
  { bg: string; icon: string; role: 'status' | 'alert' }
> = {
  success: { bg: 'bg-emerald-600', icon: '✅', role: 'status' },
  error: { bg: 'bg-red-600', icon: '❌', role: 'alert' },
  warning: { bg: 'bg-amber-600', icon: '⚠️', role: 'status' },
  info: { bg: 'bg-gray-800 dark:bg-gray-700', icon: 'ℹ️', role: 'status' },
};

@customElement('app-toast')
export class AppToast extends LitElement {
  @property({ type: String }) message = '';
  @property({ type: String }) variant: ToastVariant = 'success';
  @property({ type: Number }) duration = 3000;

  private timer?: ReturnType<typeof setTimeout>;

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.startTimer();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.timer);
  }

  override firstUpdated() {
    this.animateIn();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('duration')) this.startTimer();
  }

  private startTimer() {
    clearTimeout(this.timer);
    if (this.duration > 0) {
      this.timer = setTimeout(() => this.dismiss(), this.duration);
    }
  }

  private animateIn() {
    const pill = this.querySelector<HTMLElement>('.toast');
    if (!pill) return;
    pill.style.transform = 'translateY(-16px)';
    pill.style.opacity = '0';
    requestAnimationFrame(() => {
      if (!pill.isConnected) return;
      pill.style.transition =
        'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s';
      pill.style.transform = 'translateY(0)';
      pill.style.opacity = '1';
    });
  }

  private dismiss = () => {
    clearTimeout(this.timer);
    this.dispatchEvent(
      new CustomEvent('dismiss', { bubbles: true, composed: true }),
    );
  };

  override render() {
    const variant = VARIANTS[this.variant] ?? VARIANTS.success;
    return html`
      <div
        class="toast pointer-events-auto flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${variant.bg}"
        role=${variant.role}
      >
        <span class="toast-icon flex-shrink-0">${variant.icon}</span>
        <span class="toast-message">${this.message}</span>
        <button
          type="button"
          class="toast-close ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center self-center rounded-full bg-white/20 text-xs transition-colors hover:bg-white/30"
          aria-label="Dismiss"
          @click=${this.dismiss}
        >
          ✕
        </button>
      </div>
    `;
  }
}

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

function getStack(): HTMLElement {
  let stack = document.querySelector<HTMLElement>('#app-toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'app-toast-stack';
    stack.className =
      'pointer-events-none fixed inset-x-0 top-0 z-[70] flex flex-col items-stretch gap-2 px-4 pt-4 sm:right-0 sm:left-auto sm:w-96 sm:max-w-[calc(100vw-2rem)] sm:px-6';
    document.body.appendChild(stack);
  }
  return stack;
}

export function toast(
  message: string,
  options: ToastOptions = {},
): Promise<void> {
  return new Promise((resolve) => {
    const el = document.createElement('app-toast') as AppToast;
    el.message = message;
    if (options.variant !== undefined) el.variant = options.variant;
    if (options.duration !== undefined) el.duration = options.duration;

    const stack = getStack();
    const cleanup = () => {
      el.removeEventListener('dismiss', onDismiss);
      el.remove();
      if (stack.children.length === 0) stack.remove();
      resolve();
    };
    const onDismiss = () => cleanup();

    el.addEventListener('dismiss', onDismiss);
    stack.appendChild(el);
  });
}

declare global {
  interface HTMLElementTagNameMap {
    'app-toast': AppToast;
  }
}
