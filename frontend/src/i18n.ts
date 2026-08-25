import data from './i18n/translations.json';

type TranslationNode = string | { [key: string]: TranslationNode };

export const translations = data as Record<string, TranslationNode>;

export function t(locale: string, key: string): string {
  let node: TranslationNode | undefined = translations[locale];
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return key;
    node = node[part];
  }
  return typeof node === 'string' ? node : key;
}
