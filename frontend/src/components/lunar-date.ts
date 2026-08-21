import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { LunarDate as LunarDateData } from '../utils/lunar.js';
import {
  formatLunarDateEn,
  formatLunarDateVi,
  solarToLunar,
} from '../utils/lunar.js';

export type LunarDateLang = 'vi' | 'en';
export type LunarDateVariant = 'full' | 'compact';

const COMPACT_MONTHS = [
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

@customElement('app-lunar-date')
export class LunarDate extends LitElement {
  @property({ type: String }) date = '';
  @property({ type: String }) lang: LunarDateLang = 'vi';
  @property({ type: String }) variant: LunarDateVariant = 'full';

  override createRenderRoot() {
    return this;
  }

  private getLunarDate(): LunarDateData | null {
    const parts = this.date.split('-').map(Number);
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    if (!year || !month || !day) return null;
    const d = new Date(year, month - 1, day);
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    return solarToLunar(year, month, day);
  }

  override render() {
    const lunar = this.getLunarDate();
    if (!lunar) return html``;

    if (this.variant === 'compact') {
      const monthName = COMPACT_MONTHS[lunar.month] || String(lunar.month);
      return html`<span
        class="lunar-date text-[9px] leading-none text-amber-500 dark:text-amber-400"
        >${lunar.day}/${monthName}</span
      >`;
    }

    const text =
      this.lang === 'en'
        ? formatLunarDateEn(
            lunar.year,
            lunar.month,
            lunar.day,
            lunar.isLeapMonth,
          )
        : formatLunarDateVi(
            lunar.year,
            lunar.month,
            lunar.day,
            lunar.isLeapMonth,
          );

    return html`<span class="lunar-date inline-flex items-center gap-2 text-amber-600 dark:text-amber-400">
      <span aria-hidden="true">🌙</span>
      <span class="lunar-date-text">${text}</span>
    </span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-lunar-date': LunarDate;
  }
}
