import { html, type TemplateResult } from 'lit';

export type AuthMode = 'login' | 'register';

const baseTab =
  'flex-1 rounded-xl py-3 text-center text-sm font-medium transition-colors';
const activeTab = 'bg-emerald-600 text-white';
const inactiveTab =
  'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';

export function authTabs(
  active: AuthMode,
  t: (key: string) => string,
): TemplateResult {
  const tab = (mode: AuthMode, href: string, label: string) => {
    const style = active === mode ? activeTab : inactiveTab;
    return html`
      <a href=${href} class="${baseTab} ${style}">${t(label)}</a>
    `;
  };
  return html`
    <div class="mb-6 flex gap-2">
      ${tab('login', '/login', 'auth.login')} ${tab('register', '/register', 'auth.register')}
    </div>
  `;
}
