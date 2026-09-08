import { createContext } from '@lit/context';

export type Locale = 'vi' | 'en';

export interface LocaleState {
  locale: Locale;
}

export const DEFAULT_LOCALE: Locale = 'vi';

export const localeContext = createContext<LocaleState>('app-locale');
