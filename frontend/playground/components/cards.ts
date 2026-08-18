import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { InfoCardColor } from '../../src/components/info-card.js';
import type { RelationCardColor } from '../../src/components/relation-card.js';
import type { StatCardColor } from '../../src/components/stat-card.js';
import { notify, state } from '../state.js';

interface StatDemo {
  icon: string;
  label: string;
  value: string;
  color: StatCardColor;
  span?: boolean;
}

interface InfoDemo {
  label: string;
  value: string;
  color: InfoCardColor;
}

interface RelationDemo {
  label: string;
  name: string;
  birthYear: string;
  deathYear: string;
  color: RelationCardColor;
}

const statDemos: StatDemo[] = [
  { icon: '📍', label: 'Origin', value: 'Hà Nội', color: 'blue' },
  {
    icon: '🕯️',
    label: 'Memorial date',
    value: '15th of the 1st lunar month',
    color: 'amber',
  },
  {
    icon: '🏠',
    label: 'Clan house',
    value: 'Nguyen clan ancestral house, Soc Son district',
    color: 'green',
    span: true,
  },
  {
    icon: '🏘️',
    label: 'Village',
    value: 'Xuan Dinh hamlet, Hoang Giau commune',
    color: 'purple',
    span: true,
  },
];

const infoDemos: InfoDemo[] = [
  { label: 'Birth year', value: '1985', color: 'blue' },
  { label: 'Gender', value: 'Male', color: 'pink' },
  { label: 'Generation', value: '5', color: 'purple' },
  { label: 'Role', value: 'Administrator', color: 'amber' },
];

const relationDemos: RelationDemo[] = [
  {
    label: 'Spouse',
    name: 'Nguyễn Thị B',
    birthYear: '1988',
    deathYear: '',
    color: 'pink',
  },
  {
    label: 'Parent',
    name: 'Nguyễn Văn Ông',
    birthYear: '1955',
    deathYear: '2010',
    color: 'blue',
  },
];

export function cardsSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        &lt;app-stat-card&gt; · &lt;app-info-card&gt; ·
        &lt;app-relation-card&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-4 space-y-8">
          <div>
            <h3
              class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3"
              >Stat card — clan info</h3
            >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${statDemos.map(
                (card) => html`
                  <app-stat-card
                    icon=${card.icon}
                    label=${card.label}
                    value=${card.value}
                    color=${card.color}
                    class=${card.span ? 'sm:col-span-2' : null}
                  ></app-stat-card>
                `,
              )}
            </div>
          </div>

          <div>
            <h3
              class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3"
              >Info card — member details</h3
            >
            <div class="grid grid-cols-2 gap-3">
              ${infoDemos.map(
                (card) => html`
                  <app-info-card
                    label=${card.label}
                    value=${card.value}
                    color=${card.color}
                  ></app-info-card>
                `,
              )}
            </div>
          </div>

          <div>
            <h3
              class="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3"
              >Relation card — clickable, emits select</h3
            >
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              ${relationDemos.map(
                (card) => html`
                  <app-relation-card
                    label=${card.label}
                    name=${card.name}
                    birth-year=${card.birthYear}
                    death-year=${card.deathYear}
                    color=${card.color}
                    @select=${() => {
                      state.lastEvent = `app-relation-card select → "${card.label}: ${card.name}"`;
                      notify();
                    }}
                  ></app-relation-card>
                `,
              )}
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-400">
        Last event:
        <span class="font-mono"
          >${state.lastEvent || '— click a relation card'}</span
        >
      </p>
    </section>
  `;
}
