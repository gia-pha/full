import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../components/app-button.js';
import { I18nMixin } from '../i18n/i18n-mixin.js';
import { iconFingerprint } from '../icons/index.js';
import '../layouts/app-auth-layout.js';
import { login } from '../services/passkey.js';
import { authTabs } from './auth-tabs.js';

@customElement('login-page')
export class LoginPage extends I18nMixin(LitElement) {
  @state() private accessor busy = false;
  @state() private accessor error = '';
  @state() private accessor message = '';

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    super.connectedCallback();
    this.style.display = 'flex';
    this.style.flexDirection = 'column';
    this.style.minHeight = '100dvh';
  }

  private async handleLogin() {
    if (this.busy) return;
    this.busy = true;
    this.error = '';
    this.message = '';
    try {
      await login();
      this.message = this.t('auth.loginSuccess');
      window.dispatchEvent(new Event('auth-success'));
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.busy = false;
    }
  }

  override render() {
    return html`
      <app-auth-layout
        class="flex-1"
        title=${this.t('app.title')}
        description=${this.t('app.description')}
        footer=${`Gia Phả © ${new Date().getFullYear()}`}
        .content=${html`
          ${authTabs('login', (key) => this.t(key))}
          <div class="space-y-4">
            <div class="py-8 text-center">
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              >
                ${iconFingerprint}
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                ${this.t('auth.loginWithPasskey')}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                ${this.t('auth.tapToUseDeviceOrFingerprint')}
              </p>
            </div>
            ${
              this.error
                ? html`<p
                    class="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400"
                    role="alert"
                  >
                    ${this.error}
                  </p>`
                : html``
            }
            ${
              this.message
                ? html`<p
                    class="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    role="status"
                  >
                    ${this.message}
                  </p>`
                : html``
            }
            <app-button
              class="w-full"
              variant="primary"
              size="lg"
              icon="🔐"
              label=${
                this.busy
                  ? this.t('auth.waitingForPasskey')
                  : this.t('auth.usePasskey')
              }
              ?disabled=${this.busy}
              @click=${this.handleLogin}
            ></app-button>
          </div>
        `}
      ></app-auth-layout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-page': LoginPage;
  }
}
