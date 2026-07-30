import data from './i18n/translations.json';

export const translations = data as Record<
  string,
  Record<string, Record<string, string>>
>;

export function t(locale: string, key: string): string {
  const [section, item] = key.split('.');
  return translations[locale]?.[section]?.[item] ?? key;
}
