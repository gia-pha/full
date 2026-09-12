import type { TemplateResult } from 'lit';
import { html } from 'lit';
import type { Person } from '../../src/types/index.js';
import { notify, state } from '../state.js';

const person = (
  id: string,
  clanId: string,
  firstName: string,
  lastName: string,
  gender: 'M' | 'F',
  birthYear: string,
  generation: number,
  rels: Person['rels'] = { parents: [], spouses: [], children: [] },
): Person => ({
  id,
  data: { firstName, lastName, gender, birthYear, generation, clanId },
  rels,
});

const nguyenClan: Person[] = [
  person('ng1a', 'nguyen', 'Văn Khoan', 'Nguyễn', 'M', '1920', 3, {
    parents: [],
    spouses: ['ng1b'],
    children: ['ng2a', 'ng2b', 'ng2c'],
  }),
  person('ng1b', 'nguyen', 'Thị Hòa', 'Trần', 'F', '1925', 3, {
    parents: [],
    spouses: ['ng1a'],
    children: ['ng2a', 'ng2b', 'ng2c'],
  }),
  person('ng2a', 'nguyen', 'Văn Bình', 'Nguyễn', 'M', '1950', 4, {
    parents: ['ng1a', 'ng1b'],
    spouses: ['ng2d'],
    children: ['ng3a', 'ng3b'],
  }),
  person('ng2d', 'nguyen', 'Thị Lan', 'Lê', 'F', '1953', 4, {
    parents: [],
    spouses: ['ng2a'],
    children: ['ng3a', 'ng3b'],
  }),
  person('ng2b', 'nguyen', 'Thị Mai', 'Nguyễn', 'F', '1955', 4, {
    parents: ['ng1a', 'ng1b'],
    spouses: [],
    children: [],
  }),
  person('ng2c', 'nguyen', 'Văn Đức', 'Nguyễn', 'M', '1958', 4, {
    parents: ['ng1a', 'ng1b'],
    spouses: ['ng2e'],
    children: ['ng3c', 'ng3d'],
  }),
  person('ng2e', 'nguyen', 'Thị Hạnh', 'Phạm', 'F', '1960', 4, {
    parents: [],
    spouses: ['ng2c'],
    children: ['ng3c', 'ng3d'],
  }),
  person('ng3a', 'nguyen', 'Văn Hùng', 'Nguyễn', 'M', '1980', 5, {
    parents: ['ng2a', 'ng2d'],
    spouses: [],
    children: [],
  }),
  person('ng3b', 'nguyen', 'Thị Hương', 'Nguyễn', 'F', '1985', 5, {
    parents: ['ng2a', 'ng2d'],
    spouses: [],
    children: [],
  }),
  person('ng3c', 'nguyen', 'Văn Tuấn', 'Nguyễn', 'M', '1983', 5, {
    parents: ['ng2c', 'ng2e'],
    spouses: ['ng3e'],
    children: ['ng4a', 'ng4b'],
  }),
  person('ng3e', 'nguyen', 'Thị Trang', 'Hoàng', 'F', '1985', 5, {
    parents: [],
    spouses: ['ng3c'],
    children: ['ng4a', 'ng4b'],
  }),
  person('ng3d', 'nguyen', 'Văn Nam', 'Nguyễn', 'M', '1990', 5, {
    parents: ['ng2c', 'ng2e'],
    spouses: [],
    children: [],
  }),
  person('ng4a', 'nguyen', 'Văn Minh', 'Nguyễn', 'M', '2010', 6, {
    parents: ['ng3c', 'ng3e'],
    spouses: [],
    children: [],
  }),
  person('ng4b', 'nguyen', 'Thị An', 'Nguyễn', 'F', '2013', 6, {
    parents: ['ng3c', 'ng3e'],
    spouses: [],
    children: [],
  }),
];

const tranClan: Person[] = [
  person('tr1a', 'tran', 'Văn Mận', 'Trần', 'M', '1930', 3, {
    parents: [],
    spouses: ['tr1b'],
    children: ['tr2a', 'tr2b'],
  }),
  person('tr1b', 'tran', 'Thị Nở', 'Đặng', 'F', '1935', 3, {
    parents: [],
    spouses: ['tr1a'],
    children: ['tr2a', 'tr2b'],
  }),
  person('tr2a', 'tran', 'Văn Hoàng', 'Trần', 'M', '1960', 4, {
    parents: ['tr1a', 'tr1b'],
    spouses: ['tr2c'],
    children: ['tr3a', 'tr3b'],
  }),
  person('tr2c', 'tran', 'Thị Thu', 'Vũ', 'F', '1962', 4, {
    parents: [],
    spouses: ['tr2a'],
    children: ['tr3a', 'tr3b'],
  }),
  person('tr2b', 'tran', 'Văn Đào', 'Trần', 'M', '1965', 4, {
    parents: ['tr1a', 'tr1b'],
    spouses: [],
    children: [],
  }),
  person('tr3a', 'tran', 'Văn Long', 'Trần', 'M', '1990', 5, {
    parents: ['tr2a', 'tr2c'],
    spouses: [],
    children: [],
  }),
  person('tr3b', 'tran', 'Thị Phong', 'Trần', 'F', '1995', 5, {
    parents: ['tr2a', 'tr2c'],
    spouses: [],
    children: [],
  }),
];

const ALL_PERSONS: Person[] = [...nguyenClan, ...tranClan];

const CLANS: { id: string; label: string; mainPersonId: string }[] = [
  { id: 'nguyen', label: 'Họ Nguyễn (14 người)', mainPersonId: 'ng1a' },
  { id: 'tran', label: 'Họ Trần (7 người)', mainPersonId: 'tr1a' },
];

export function familyTreeSection(): TemplateResult {
  const activeClan = CLANS.find((c) => c.id === state.treeClan) ?? CLANS[0];
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-4"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;app-family-tree&gt;
      </h2>

      <p class="text-sm text-gray-500 os-dark:text-gray-400">
        Click a card to emit
        <code class="text-emerald-700">person-click</code>. Search centers the
        tree on the first name match. Enable
        <strong>Editable</strong> to edit people and add relatives from card
        buttons (emits <code class="text-emerald-700">tree-changed</code>).
      </p>

      <div class="flex flex-wrap items-center gap-2">
        ${CLANS.map(
          (clan) => html`
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                state.treeClan === clan.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 os-dark:bg-gray-700 text-gray-700 os-dark:text-gray-200 hover:bg-gray-200 os-dark:hover:bg-gray-600'
              }"
              @click=${() => {
                state.treeClan = clan.id;
                notify();
              }}
            >
              ${clan.label}
            </button>
          `,
        )}
        <label
          class="ml-auto flex items-center gap-2 text-sm text-gray-600 os-dark:text-gray-300 cursor-pointer"
        >
          <input
            type="checkbox"
            class="accent-emerald-600"
            .checked=${state.treeEditable}
            @change=${(e: Event) => {
              state.treeEditable = (e.target as HTMLInputElement).checked;
              notify();
            }}
          />
          Editable
        </label>
      </div>

      ${
        state.treeEvent
          ? html`<p class="text-sm text-emerald-700">${state.treeEvent}</p>`
          : ''
      }

      <div class="h-[560px] rounded-xl overflow-hidden border border-gray-200">
        <app-family-tree
          class="h-full"
          .persons=${ALL_PERSONS}
          .clanId=${activeClan.id}
          .mainPersonId=${activeClan.mainPersonId}
          .editable=${state.treeEditable}
          @person-click=${(e: CustomEvent<{ person: Person }>) => {
            const { firstName, lastName } = e.detail.person.data;
            state.treeEvent = `person-click: ${lastName} ${firstName}`;
            notify();
          }}
          @tree-changed=${(e: CustomEvent<{ persons: Person[] }>) => {
            state.treeEvent = `tree-changed: ${e.detail.persons.length} people`;
            notify();
          }}
        ></app-family-tree>
      </div>
    </section>
  `;
}
