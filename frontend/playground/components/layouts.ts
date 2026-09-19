import type { TemplateResult } from 'lit';
import { html } from 'lit';
import '../../src/layouts/app-page-layout.js';
import '../../src/layouts/app-auth-layout.js';
import '../../src/layouts/app-public-layout.js';
import '../../src/components/app-button.js';
import type { NavItem } from '../../src/components/sidebar.js';
import '../../src/components/sidebar.js';
import { defaultRoles } from '../../src/consts/index.js';
import { notify, sidebarClans, state } from '../state.js';

function demoSidebar(): TemplateResult {
  const clans = sidebarClans();
  const navItems: NavItem[] = [
    { id: 'tree', icon: '🌳', labelKey: 'app.sidebar.tree' },
    { id: 'members', icon: '👥', labelKey: 'app.sidebar.members' },
    { id: 'events', icon: '📅', labelKey: 'app.sidebar.events' },
    { id: 'funds', icon: '💰', labelKey: 'app.sidebar.funds' },
    {
      id: 'notifications',
      icon: '🔔',
      labelKey: 'app.sidebar.notifications',
      unreadBadge: true,
    },
    { id: 'profile', icon: '👤', labelKey: 'app.sidebar.profile' },
  ];
  const person = {
    id: 'sb-p1',
    data: {
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      gender: 'M' as const,
      generation: 5,
      role: state.sidebarRole,
    },
    rels: { parents: [], spouses: [], children: [] },
  };
  const roleLabel =
    defaultRoles.find((r) => r.name === state.sidebarRole)?.label ?? '';
  return html`
    <app-sidebar
      .clans=${clans}
      .navItems=${navItems}
      .mobileNavItems=${navItems.slice(0, 5)}
      .currentClanId=${state.sidebarClanId}
      .currentPage=${state.sidebarPage}
      ?sidebarOpen=${state.sidebarOpen}
      .unreadCount=${state.sidebarUnread}
      .currentPerson=${person}
      .roleLabel=${roleLabel}
      @clan-select=${(e: CustomEvent) => {
        state.sidebarClanId = e.detail.id as string;
        notify();
      }}
      @page-select=${(e: CustomEvent) => {
        state.sidebarPage = e.detail.page as string;
        notify();
      }}
      @toggle-language=${() => {
        state.language = state.language === 'vi' ? 'en' : 'vi';
        notify();
      }}
    ></app-sidebar>
  `;
}

function demoFrame(
  label: string,
  content: TemplateResult,
  frameClass = 'h-[480px]',
): TemplateResult {
  return html`
    <div>
      <p class="mb-2 text-xs text-gray-500 os-dark:text-gray-400">${label}</p>
      <div
        class="${frameClass} overflow-hidden rounded-xl border-2 border-dashed border-gray-300 os-dark:border-gray-600"
      >
        ${content}
      </div>
    </div>
  `;
}

function canvasContent(): TemplateResult {
  const node =
    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm dark:border-emerald-700 dark:bg-gray-800 dark:text-gray-200';
  const line = 'absolute bg-gray-300 dark:bg-gray-600';
  return html`
    <div class="relative h-full w-full overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:18px_18px] dark:[background-image:radial-gradient(circle,rgba(255,255,255,0.10)_1px,transparent_1px)]"
      ></div>
      <div
        class="absolute inset-x-0 top-0 flex items-center gap-2 border-b border-gray-200 bg-white/80 px-3 py-2 text-xs text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400"
      >
        🔍 Tìm trong cây phả hệ
        <span class="ml-auto hidden sm:inline">
          kéo để di chuyển · cuộn để thu phóng
        </span>
      </div>
      <div class="${line} left-1/2 top-[30%] h-[12%] w-px"></div>
      <div class="${line} left-[30%] top-[42%] h-px w-[40%]"></div>
      <div class="${line} left-[30%] top-[42%] h-[10%] w-px"></div>
      <div class="${line} left-[70%] top-[42%] h-[10%] w-px"></div>
      <div class="${node} left-1/2 top-[30%]">👴 Cụ Ông</div>
      <div class="${node} left-[30%] top-[52%]">👨 Cha</div>
      <div class="${node} left-[70%] top-[52%]">👩 Mẹ</div>
      <div
        class="absolute bottom-3 right-3 flex flex-col divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-500 shadow dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
      >
        <span class="grid h-8 w-8 place-items-center">＋</span>
        <span class="grid h-8 w-8 place-items-center">−</span>
        <span class="grid h-8 w-8 place-items-center">⟳</span>
      </div>
    </div>
  `;
}

export function layoutsSection(): TemplateResult {
  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 os-dark:border-gray-700 pb-2"
      >
        Layouts
      </h2>

      <div class="${state.dark ? 'dark' : ''} space-y-6">
        ${demoFrame(
          '<app-page-layout>',
          html`
            <app-page-layout
              title="Thành Viên"
              .sidebar=${demoSidebar()}
              .actions=${html`
                <app-button label="+ Thêm"></app-button>
              `}
              .content=${html`
                <div class="space-y-3">
                  <div
                    class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300"
                  >
                    👤 Nguyễn Văn An · Thế hệ 1
                  </div>
                  <div
                    class="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300"
                  >
                    👤 Nguyễn Thị Bình · Thế hệ 2
                  </div>
                </div>
              `}
            ></app-page-layout>
          `,
        )}
        ${demoFrame(
          '<app-page-layout variant="centered">',
          html`
            <app-page-layout
              variant="centered"
              title="Hồ Sơ Cá Nhân"
              .sidebar=${demoSidebar()}
              .actions=${html`
                <app-button label="✏️ Sửa"></app-button>
              `}
              .content=${html`
                <div
                  class="h-32 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                ></div>
              `}
            ></app-page-layout>
          `,
        )}
        ${demoFrame(
          '<app-page-layout variant="canvas">',
          html`
            <app-page-layout
              variant="canvas"
              .sidebar=${demoSidebar()}
              .content=${canvasContent()}
            ></app-page-layout>
          `,
        )}
        ${demoFrame(
          '<app-auth-layout>',
          html`
            <app-auth-layout
              title="Gia Phả"
              description="Kết nối các thế hệ"
              footer="Gia Phả © 2025"
              .content=${html`
                <div class="space-y-4">
                  <div
                    class="flex h-16 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700 text-sm text-gray-500 dark:text-gray-300"
                  >
                    🔐 passkey form
                  </div>
                </div>
              `}
            ></app-auth-layout>
          `,
          'h-[480px]',
        )}
        ${demoFrame(
          '<app-public-layout>',
          html`
            <app-public-layout
              footerText="Họ Nguyễn © 2026"
              .hero=${html`
                <h1 class="mb-4 text-3xl font-bold">Họ Nguyễn</h1>
                <p class="max-w-2xl text-emerald-100">
                  Lịch sử dòng họ Nguyễn — truyền thống hiếu học và khoa bảng.
                </p>
              `}
              .content=${html`
                <section
                  class="rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300"
                >
                  ⭐ Danh nhân
                </section>
                <section
                  class="rounded-2xl bg-gray-50 dark:bg-gray-800 p-6 text-sm text-gray-600 dark:text-gray-300"
                >
                  📅 Sự kiện sắp tới
                </section>
              `}
            ></app-public-layout>
          `,
          'h-[560px]',
        )}
      </div>
    </section>
  `;
}
