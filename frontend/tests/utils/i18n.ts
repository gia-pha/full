import '../../src/i18n/provider.js';
import type { Locale } from '../../src/i18n/context.js';

export function mountWithLocale(el: HTMLElement, locale?: Locale): void {
  if (locale === undefined) {
    document.body.appendChild(el);
    return;
  }
  const provider = document.createElement('i18n-provider');
  provider.locale = locale;
  provider.appendChild(el);
  document.body.appendChild(provider);
}
