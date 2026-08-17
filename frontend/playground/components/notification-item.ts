import type { TemplateResult } from 'lit';
import { html } from 'lit';
import { notify, state, updateNotification } from '../state.js';

export function notificationItemSection(): TemplateResult {
  const notification = updateNotification();

  return html`
    <section
      class="bg-white os-dark:bg-gray-800 lg:col-span-2 rounded-xl shadow p-6 space-y-6"
    >
      <h2
        class="text-lg font-semibold text-gray-800 os-dark:text-gray-100 border-b border-gray-200 pb-2"
      >
        &lt;notification-item&gt;
      </h2>

      <div class="${state.dark ? 'dark' : ''}">
        <div class="min-h-[100px] bg-white dark:bg-gray-900 rounded-xl p-4">
          <notification-item .notification=${notification}></notification-item>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Type</label
          >
          <select
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.notifType}"
            @change=${(e: Event) => {
              state.notifType = (e.target as HTMLSelectElement).value;
              notify();
            }}
          >
            <option value="fund_change">Fund Change</option>
            <option value="new_event">New Event</option>
            <option value="memorial_reminder">Memorial Reminder</option>
            <option value="member_joins">Member Joins</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Timestamp</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.notifTimestamp}"
            @input=${(e: Event) => {
              state.notifTimestamp = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div>
          <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
            >Title</label
          >
          <input
            type="text"
            class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
            value="${state.notifTitle}"
            @input=${(e: Event) => {
              state.notifTitle = (e.target as HTMLInputElement).value;
              notify();
            }}
          />
        </div>

        <div class="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="notif-read"
            ?checked=${state.notifRead}
            @change=${(e: Event) => {
              state.notifRead = (e.target as HTMLInputElement).checked;
              notify();
            }}
            class="rounded border-gray-300"
          />
          <label
            for="notif-read"
            class="text-sm text-gray-700 os-dark:text-gray-300"
            >Read</label
          >
        </div>
      </div>

      <div>
        <label class="block text-xs text-gray-500 os-dark:text-gray-400 mb-1"
          >Message</label
        >
        <textarea
          class="w-full px-3 py-2 text-sm border border-gray-300 os-dark:border-gray-600 rounded-lg bg-white os-dark:bg-gray-700 text-gray-800 os-dark:text-gray-200"
          rows="2"
          @input=${(e: Event) => {
            state.notifMessage = (e.target as HTMLTextAreaElement).value;
            notify();
          }}
        >${state.notifMessage}</textarea>
      </div>

      <div class="flex flex-wrap gap-3 pt-2">
        <button
          class="px-4 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          @click=${() => {
            Object.assign(state, {
              notifType: 'fund_change' as const,
              notifTitle: 'Đóng góp quỹ họ tộc',
              notifMessage:
                'Nguyễn Văn A đã đóng góp 1,000,000₫ vào quỹ họ tộc.',
              notifTimestamp: '2025-01-15',
              notifRead: false,
            });
            notify();
          }}
        >
          Fund Change
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-blue-100 hover:bg-blue-200 os-dark:bg-blue-900 os-dark:hover:bg-blue-800 text-blue-700 os-dark:text-blue-300 transition-colors"
          @click=${() => {
            Object.assign(state, {
              notifType: 'new_event' as const,
              notifTitle: 'Sự kiện mới: Họp mặt gia đình',
              notifMessage:
                'Sự kiện "Họp mặt gia đình 2025" đã được tạo. Hãy tham gia và xác nhận tham dự.',
              notifTimestamp: '2025-02-01',
              notifRead: false,
            });
            notify();
          }}
        >
          New Event
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-amber-100 hover:bg-amber-200 os-dark:bg-amber-900 os-dark:hover:bg-amber-800 text-amber-700 os-dark:text-amber-300 transition-colors"
          @click=${() => {
            Object.assign(state, {
              notifType: 'memorial_reminder' as const,
              notifTitle: 'Nhắc nhở: Lễ giỗ tổ',
              notifMessage:
                'Lễ giỗ tổ sẽ diễn ra vào ngày 15/03/2025. Hãy chuẩn bị và tham gia.',
              notifTimestamp: '2025-03-01',
              notifRead: false,
            });
            notify();
          }}
        >
          Memorial Reminder
        </button>
        <button
          class="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 os-dark:bg-gray-700 os-dark:hover:bg-gray-600 text-gray-700 os-dark:text-gray-300 transition-colors"
          @click=${() => {
            Object.assign(state, {
              notifType: 'member_joins' as const,
              notifTitle: 'Thành viên mới tham gia',
              notifMessage: 'Lê Văn Thắng đã được thêm vào sổ họ tộc.',
              notifTimestamp: '2025-01-25',
              notifRead: true,
            });
            notify();
          }}
        >
          Member Joins (Read)
        </button>
      </div>
    </section>
  `;
}
