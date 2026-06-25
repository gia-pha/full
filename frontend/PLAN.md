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

### Phase 2 — Auth & Passkey
7. Create `passkey.ts` service wrapping `@simplewebauthn/browser`
8. Connect to Go backend `/api/passkey/registerStart`, `/registerFinish`, `/loginStart`, `/loginFinish`
9. Build `AuthComponent`: login/register tabs, passkey flow, error handling
10. Persist auth state, protect routes

### Phase 3 — Core Pages
11. `TreeRenderer` — port family tree, `family-chart` integration, search, zoom/pan
12. `MembersListComponent` — search, honorifics, distance sorting, click → select
13. `ClanInfoComponent` — clan details, notable figures, image gallery
14. `EventsComponent` — upcoming/past tabs, event cards, CRUD modals, Google Calendar
15. `CalendarComponent` — solar/lunar grid, event dots, month navigation
16. `FundComponent` — balance cards, bar chart, transaction table, CRUD

### Phase 4 — Remaining Pages
17. `AdminComponent` — member list, role management, GEDCOM import/export
18. `NotificationsComponent` — inbox, mark read/all, preferences
19. `ProfileComponent` — view/edit profile, clan membership, delete account
20. `InviteComponent` — QR code, copy link, native share, invite history
21. `PublicPageComponent` — public clan landing page
22. `ModalComponent` — generic modal: edit person, edit clan, event, fund, role
23. `SidebarComponent` — desktop sidebar + mobile drawer + bottom nav
24. `MemberCardComponent` — detail panel for selected person

### Phase 5 — Polish
25. i18n reactivity: store subscription → re-render all components on language change
26. Dark mode: CSS class toggle, persisted
27. Responsive polish: mobile gestures, safe areas
28. IndexedDB persistence: auto-save on data mutation, load on init
29. Build optimization: code splitting per route, lazy-load heavy components (tree, calendar)

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
