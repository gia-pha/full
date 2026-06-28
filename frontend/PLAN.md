# Gia Phả Frontend — Implementation Plan

## Stack

| Concern | Choice | Version | Why |
|---|---|---|---|
| Language | TypeScript | 7 RC | Latest experimental, strict mode |
| Package manager | pnpm | latest | Fast, disk-efficient, strict deps |
| Build tool | Vite | latest | Native ESM, HMR, minimal config |
| State management | nanostores | latest | ~500B, typed signals, zero boilerplate, auto TS inference, no actions/reducers |
| Routing | nanorouter | latest | Tiny, composable, pairs with nanostores |
| Rendering | lit-html (standalone) | latest | `render(html\`...\`, node)` — simple diff-patch, no custom elements/shadow DOM, 6KB |
| Security (Passkey) | @simplewebauthn/browser | latest | Clean WebAuthn API, compatible with existing Go backend |
| Persistence | idb-keyval | latest | IndexedDB wrapper, ~1KB, async, offline-first |
| CSS | Tailwind CSS | latest | Utility-first, matches prototype |
| Family tree | family-chart | latest | Existing library from prototype |
| Testing | Vitest + jsdom | latest | Native Vite integration, fast, zero-config, shares transformer |
| i18n | Custom (nanostores + JSON) | — | No runtime dependency, reactive via `$language` store, tree-shakeable per locale |

### Why nanostores over redux

- **Size**: 500B vs 8KB
- **Boilerplate**: Zero vs actions + reducers + dispatch + middleware
- **TS inference**: Automatic per-store vs requires `configureStore`, `AppDispatch`, `AppSelector`
- **Philosophy**: Small independent reactive signals vs single immutable tree
- For a raw TS project (no React/Vue), redux's ecosystem (thunk, saga, devtools) adds weight without framework integration. Nanostores gives reactive stores with ~10 lines of setup.

### Why lit-html over hyperhtml / raw fragments

- **API**: `render(html\`...\`, container)` is the simplest mental model — matches the prototype's `render()` pattern exactly
- **No overhead**: Used standalone (not full Lit framework), no custom elements or shadow DOM
- **Reliability**: Battle-tested, maintained by Google, automatic node reuse and cleanup
- hyperhtml's `wire()` is clever but less conventional; raw `innerHTML` / `DocumentFragment` requires manual event re-binding on every render

## Project Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── pnpm-lock.yaml
├── src/
│   ├── main.ts                    # Entry: mount app, start router
│   ├── app.ts                     # App shell: layout, store init, data load
│   │
│   ├── types/
│   │   └── index.ts               # All interfaces: Person, Clan, Event, Fund, etc.
│   │
│   ├── stores/                    # nanostores
│   │   ├── index.ts               # Re-export all stores
│   │   ├── data.ts                # $data: full app data (clans, persons, events, funds)
│   │   ├── ui.ts                  # $currentPage, $selectedPersonId, $modalOpen, $modalData, $sidebarOpen
│   │   ├── auth.ts                # $authenticated, $currentPersonId
│   │   ├── i18n.ts                # $language, computed $t (translation fn)
│   │   ├── calendar.ts            # $calendarMonth, $calendarYear, $calendarType
│   │   └── tree.ts                # $expandedNodes, $treeZoom, $treePan, $searchQuery
│   │
│   ├── router/
│   │   └── routes.ts              # Route definitions, auth guards, page → component map
│   │
│   ├── components/                # One file per component, lit-html templates
│   │   ├── sidebar.ts
│   │   ├── member-card.ts
│   │   ├── modal.ts
│   │   ├── auth.ts
│   │   ├── tree/
│   │   │   └── tree-renderer.ts   # family-chart integration
│   │   ├── members-list.ts
│   │   ├── clan-info.ts
│   │   ├── events.ts
│   │   ├── calendar.ts
│   │   ├── fund.ts
│   │   ├── admin.ts
│   │   ├── notifications.ts
│   │   ├── profile.ts
│   │   ├── invite.ts
│   │   └── public-page.ts
│   │
│   ├── services/
│   │   ├── passkey.ts             # WebAuthn: register(), login(), logout()
│   │   ├── api.ts                 # fetch wrapper, API base URL, interceptors
│   │   └── storage.ts             # IndexedDB: save/load app data, sync strategy
│   │
│   ├── utils/
│   │   ├── honorifics.ts          # calculateRelationship(), getVietnameseHonorific()
│   │   ├── lunar.ts               # solarToLunar(), formatLunarDate*, calendar helpers
│   │   ├── gedcom.ts              # buildGedcom(), parseGedcom()
│   │   ├── format.ts              # formatCurrency, formatDate, debounce, generateId, downloadFile
│   │   └── data-converter.ts      # toFamilyChartData()
│   │
│   ├── i18n/
│   │   ├── vi.json
│   │   └── en.json
│   │
│   └── styles/
│       └── main.css               # Tailwind directives + custom styles
│
└── public/
    └── data/
        ├── sample-data.json       # Dev seed data
        └── i18n.json              # (migrated to src/i18n/)
```

## Features (from prototype)

### Auth & Security
- Passkey login/register via WebAuthn (`@simplewebauthn/browser`)
- Talks to existing Go backend at `/api/passkey/*`
- Session persistence: cookie + IndexedDB fallback
- Auth guard on all routes except public page

### Pages (routes)
1. **Tree** (`/tree`) — Interactive family tree with `family-chart`
2. **Members** (`/members`) — Searchable member list, honorifics, relationship distance
3. **Clan Info** (`/clan-info`) — History, origin, notable figures, images, public URL
4. **Events** (`/events`) — Upcoming/past events, CRUD, Google Calendar integration
5. **Calendar** (`/calendar`) — Solar/lunar calendar grid, event dots, month navigation
6. **Funds** (`/funds`) — Balance cards, monthly bar chart, transaction table, CRUD
7. **Admin** (`/admin`) — Member list, role management, GEDCOM import/export
8. **Notifications** (`/notifications`) — Inbox, mark read, preferences toggles
9. **Profile** (`/profile`) — Edit profile, clan membership, delete account
10. **Invite** (`/invite`) — QR code, copy link, share, invite history
11. **Public Page** (`/public-page`) — Public-facing clan landing page

### Shared UI
- **Sidebar** — Desktop collapsible sidebar + mobile drawer + mobile bottom nav
- **Member Card** — Detail panel when a person is selected
- **Modal** — Generic modal system: edit person, edit clan, add/edit event, fund transaction, change role

### Utilities
- Vietnamese honorific system (40+ relationship terms, paternal/maternal distinction)
- Solar ↔ Lunar calendar conversion (1901–2100)
- GEDCOM import/export
- i18n: Vietnamese / English

### Cross-cutting
- Dark mode toggle
- Language switch (vi/en)
- Clan switcher (multi-clan support: father's line, mother's line, spouse's line)
- Responsive: mobile-first, desktop sidebar at `lg` breakpoint
- Offline-first: IndexedDB persistence, sync with backend when online

## Implementation Phases

### Phase 1 — Skeleton
1. Init project with pnpm, Vite, TypeScript 7 RC, Tailwind
2. Define all TypeScript interfaces in `types/index.ts`
3. Create nanostores: `$data`, `$ui`, `$auth`, `$i18n`, `$calendar`, `$tree`
4. Set up nanorouter with route definitions and auth guards
5. Create app shell layout: sidebar root, content root, member card root, modal root
6. Wire store subscriptions → re-render pattern
7. **Test**: Init Vitest + jsdom, `vitest.config.ts`, smoke test for each store

### Phase 2 — Auth & Passkey
8. Create `passkey.ts` service wrapping `@simplewebauthn/browser`
9. Connect to Go backend `/api/passkey/registerStart`, `/registerFinish`, `/loginStart`, `/loginFinish`
10. Build `AuthComponent`: login/register tabs, passkey flow, error handling
11. Persist auth state, protect routes
12. **Test**: `auth.test.ts` — state transitions, route guards; `passkey.test.ts` — mocked WebAuthn flow

### Phase 3 — Core Pages
13. `TreeRenderer` — port family tree, `family-chart` integration, search, zoom/pan
14. `MembersListComponent` — search, honorifics, distance sorting, click → select
15. `ClanInfoComponent` — clan details, notable figures, image gallery
16. `EventsComponent` — upcoming/past tabs, event cards, CRUD modals, Google Calendar
17. `CalendarComponent` — solar/lunar grid, event dots, month navigation
18. `FundComponent` — balance cards, bar chart, transaction table, CRUD
19. **Test**: `honorifics.test.ts`, `lunar.test.ts`, `format.test.ts` — full coverage on utils; component render tests for each page

### Phase 4 — Remaining Pages
20. `AdminComponent` — member list, role management, GEDCOM import/export
21. `NotificationsComponent` — inbox, mark read/all, preferences
22. `ProfileComponent` — view/edit profile, clan membership, delete account
23. `InviteComponent` — QR code, copy link, native share, invite history
24. `PublicPageComponent` — public clan landing page
25. `ModalComponent` — generic modal: edit person, edit clan, event, fund, role
26. `SidebarComponent` — desktop sidebar + mobile drawer + bottom nav
27. `MemberCardComponent` — detail panel for selected person
28. **Test**: `gedcom.test.ts` — round-trip build/parse; `api.test.ts`, `storage.test.ts`; remaining component tests

### Phase 5 — Polish
29. i18n reactivity: store subscription → re-render all components on language change
30. Dark mode: CSS class toggle, persisted
31. Responsive polish: mobile gestures, safe areas
32. IndexedDB persistence: auto-save on data mutation, load on init
33. Build optimization: code splitting per route, lazy-load heavy components (tree, calendar)
34. **Test**: `i18n.test.ts` — key parity vi/en, fallback, interpolation; `stores/i18n.test.ts`; coverage gate at CI (≥80%)

## Component Pattern

Each component follows the prototype pattern, adapted for nanostores + lit-html:

```typescript
// Example: src/components/members-list.ts
import { html, render } from 'lit-html';
import { $currentPage, $selectedPersonId } from '../stores/ui.js';
import { $data } from '../stores/data.js';
import { $language } from '../stores/i18n.js';

export class MembersListComponent {
  constructor(container: HTMLElement) {
    this.container = container;
    this.subscribe();
  }

  private subscribe() {
    // Re-render when relevant stores change
    $currentPage.subscribe(() => this.render());
    $selectedPersonId.subscribe(() => this.render());
    $language.subscribe(() => this.render());
  }

  private render() {
    const t = /* computed from $language */;
    const members = /* from $data */;

    render(html`
      <div class="h-full overflow-y-auto bg-white">
        <!-- lit-html template -->
      </div>
    `, this.container);
  }
}
```

## Testing

### Framework

- **Vitest** — shares Vite's config and transformer, no extra setup, native ESM
- **jsdom** — lightweight DOM environment for component rendering tests
- No Playwright/Cypress — the app is data-driven with clear store → render boundaries; unit + integration tests cover the surface efficiently

### Test Structure

```
frontend/
├── src/
│   ├── __tests__/                  # Tests mirror src/ structure
│   │   ├── stores/
│   │   │   ├── data.test.ts        # Store mutations, computed values
│   │   │   ├── ui.test.ts          # Page navigation, modal state
│   │   │   ├── auth.test.ts        # Auth state transitions
│   │   │   ├── i18n.test.ts        # Translation lookup, fallback, missing keys
│   │   │   ├── calendar.test.ts    # Month/year transitions
│   │   │   └── tree.test.ts        # Expanded nodes, zoom/pan state
│   │   │
│   │   ├── components/
│   │   │   ├── sidebar.test.ts     # Render links, active state, mobile toggle
│   │   │   ├── member-card.test.ts # Person data display, honorifics
│   │   │   ├── modal.test.ts       # Open/close, data pass-through
│   │   │   ├── auth.test.ts        # Login/register tabs, error display
│   │   │   ├── members-list.test.ts# Search filter, sort order, click select
│   │   │   ├── events.test.ts      # CRUD flow, tab switching
│   │   │   ├── calendar.test.ts    # Grid render, lunar/solar toggle
│   │   │   ├── fund.test.ts        # Balance cards, transaction table
│   │   │   └── ...
│   │   │
│   │   ├── services/
│   │   │   ├── api.test.ts         # Fetch wrapper, interceptors, error handling
│   │   │   └── storage.test.ts     # IndexedDB save/load, sync strategy
│   │   │
│   │   └── utils/
│   │       ├── honorifics.test.ts  # Relationship calculation, edge cases
│   │       ├── lunar.test.ts       # Solar↔lunar conversion, boundary dates
│   │       ├── gedcom.test.ts      # Build/parse round-trip, malformed input
│   │       ├── format.test.ts      # Currency, date formatting, debounce
│   │       └── data-converter.test.ts # toFamilyChartData correctness
│   │
│   └── i18n/
│       └── __tests__/
│           └── translations.test.ts # Key parity (vi ↔ en), no missing keys
│
└── vitest.config.ts                 # Extends vite.config.ts
```

### Strategy

| Layer | What | How |
|---|---|---|
| **Utils** | Pure functions: honorifics, lunar, gedcom, format | Unit tests, 100% coverage target |
| **Stores** | State transitions, computed values | Unit tests, assert store `.get()` after mutations |
| **Services** | API calls, storage, passkey flow | Unit tests with `vi.fn()` mocks, no real network |
| **Components** | Render output, event handlers, store reactivity | Render in jsdom, assert DOM output, simulate clicks, verify store calls |
| **i18n** | Key parity, fallback behavior | Snapshot all keys, assert vi/en parity at CI time |

### CI

```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode for dev
pnpm test:coverage # Coverage report
```

### What NOT to test

- `family-chart` rendering — black box, trust the library
- Passkey hardware flow — mock `@simplewebauthn/browser` at the service layer
- CSS/layout — visual, not testable in jsdom

## i18n

### Architecture

```
src/i18n/
├── vi.json          # Vietnamese translations (primary, default)
├── en.json          # English translations
└── index.ts         # loadTranslations(), getT() factory
```

### Translation File Format

Nested keys matching the UI structure:

```json
{
  "sidebar": {
    "tree": "Cây gia phả",
    "members": "Thành viên",
    "events": "Sự kiện",
    "funds": "Quỹ"
  },
  "members": {
    "searchPlaceholder": "Tìm kiếm thành viên...",
    "noResults": "Không tìm thấy thành viên nào",
    "relationship": {
      "father": "Cha",
      "mother": "Mẹ",
      "spouse": "Vợ/Chồng"
    }
  },
  "common": {
    "save": "Lưu",
    "cancel": "Hủy",
    "delete": "Xóa",
    "loading": "Đang tải..."
  }
}
```

### Store (`stores/i18n.ts`)

```typescript
import { atom, computed } from 'nanostores';
import { getT } from '../i18n/index.js';

export const $language = atom<'vi' | 'en'>('vi');
export const $translations = atom<Record<string, any>>({});

// Reactive translation function — triggers re-render when language changes
export const $t = computed($language, $translations, (lang, translations) => {
  return getT(translations, lang);
});
```

### `getT()` Function

Returns a function `t(path: string, params?: Record<string, string>) => string`:

- **Dot notation**: `t('sidebar.tree')` → "Cây gia phả"
- **Interpolation**: `t('greeting.hello', { name: 'An' })` → "Xin chào, An" (uses `{name}` placeholder)
- **Fallback**: Missing key returns the key itself in dev (`[MISSING: sidebar.unknown]`), empty string in prod
- **Default to vi**: If key missing in `en`, falls back to `vi`

### Reactivity

Each component subscribes to `$language` (or `$t`) to re-render on switch:

```typescript
private subscribe() {
  $currentPage.subscribe(() => this.render());
  $language.subscribe(() => this.render());  // Re-render on language change
}

private render() {
  const t = $t.get();
  render(html`<button>${t('common.save')}</button>`, this.container);
}
```

### Implementation Details

- **Persistence**: Language choice saved to `localStorage` under key `gp-language`
- **Init**: `app.ts` loads persisted language on startup, sets `$language`, loads corresponding JSON
- **Lazy load**: Only load the active locale JSON; load second locale on demand when user switches
- **SSR-ready**: `getT()` is a pure function, works without stores for server-side rendering if needed later

### Key Parity Enforcement

`i18n/__tests__/translations.test.ts` runs in CI:
1. Flatten all keys from `vi.json` and `en.json`
2. Assert every key in `vi` exists in `en` (vi is the source of truth)
3. Fail CI if keys diverge — prevents untranslated strings in production

### Phase Assignment

i18n work is split across phases:

| Phase | Task |
|---|---|
| Phase 1 | Create `stores/i18n.ts`, `src/i18n/index.ts`, stub `vi.json`/`en.json` |
| Phase 3 | Add translation keys as each page component is built |
| Phase 5 | Step 25: i18n reactivity, language switcher UI, parity tests, polish |

## Auth Backend Integration

The existing Go backend (`/auth/`) provides:
- `POST /api/passkey/registerStart` — Begin WebAuthn registration
- `POST /api/passkey/registerFinish` — Complete registration
- `POST /api/passkey/loginStart` — Begin WebAuthn login
- `POST /api/passkey/loginFinish` — Complete login, sets session cookie

The frontend `passkey.ts` service will:
1. Call `startRegistration()` / `startLogin()` from `@simplewebauthn/browser`
2. Send options to backend, receive challenge
3. Trigger browser credential modal
4. Send response back to backend for verification
5. Handle session cookie + persist to IndexedDB

CORS is already configured on the backend (`CORSHandler` middleware).
