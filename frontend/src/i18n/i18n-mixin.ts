import { ContextConsumer } from '@lit/context';
import type { LitElement } from 'lit';
import {
  DEFAULT_LOCALE,
  type Locale,
  type LocaleState,
  localeContext,
} from './context.js';
import { translate } from './translate.js';

// biome-ignore lint/suspicious/noExplicitAny: required by the TS mixin pattern
type Constructor<T = object> = new (...args: any[]) => T;

export function I18nMixin<T extends Constructor<LitElement>>(Base: T) {
  return class I18nElement extends Base {
    localeState: LocaleState = { locale: DEFAULT_LOCALE };

    // biome-ignore lint/suspicious/noExplicitAny: required by the TS mixin pattern
    constructor(...args: any[]) {
      super(...args);
      new ContextConsumer(this, {
        context: localeContext,
        subscribe: true,
        callback: (state) => {
          this.localeState = state;
        },
      });
    }

    get locale(): Locale {
      return this.localeState.locale;
    }

    t(key: string, params?: Record<string, string | number>): string {
      return translate(this.localeState.locale, key, params);
    }
  };
}
