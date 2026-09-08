import { provide } from '@lit/context';
import { LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import {
  DEFAULT_LOCALE,
  type Locale,
  type LocaleState,
  localeContext,
} from './context.js';

@customElement('i18n-provider')
export class I18nProvider extends LitElement {
  @provide({ context: localeContext })
  localeState: LocaleState = { locale: DEFAULT_LOCALE };

  get locale(): Locale {
    return this.localeState.locale;
  }

  set locale(locale: Locale) {
    this.localeState = { locale };
  }

  override createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'i18n-provider': I18nProvider;
  }
}
