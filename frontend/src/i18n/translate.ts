import data from './translations.json';

type TranslationNode = string | { [key: string]: TranslationNode };

export const translations = data as Record<string, TranslationNode>;

export function translate(
  locale: string,
  key: string,
  params?: Record<string, string | number>,
): string {
  let node: TranslationNode | undefined = translations[locale];
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return key;
    node = node[part];
  }
  if (typeof node !== 'string') return key;
  if (!params) return node;
  return node.replace(/\{(\w+)\}/g, (token, name: string) =>
    name in params ? String(params[name]) : token,
  );
}
