import { describe, expect, it } from 'vitest';
import '../../src/components/notification-item.js';
import type { NotificationItem } from '../../src/components/notification-item.js';
import type { Notification } from '../../src/types/index.js';

const makeNotification = (overrides?: Partial<Notification>): Notification => ({
  id: 'notif-1',
  type: 'fund_change',
  title: 'Test notification',
  message: 'This is a test message.',
  date: '2025-01-15',
  read: false,
  ...overrides,
});

async function renderComponent(
  notification: Notification,
  opts?: { dismissed?: boolean },
): Promise<NotificationItem> {
  const el = document.createElement('notification-item');
  el.notification = notification;
  if (opts?.dismissed) el.dismissed = opts.dismissed;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getContent(el: NotificationItem): string {
  return el.innerHTML;
}

describe('NotificationItem', () => {
  describe('basic rendering', () => {
    it('renders notification title', async () => {
      const el = await renderComponent(
        makeNotification({ title: 'Đóng góp quỹ họ tộc' }),
      );
      expect(getContent(el)).toContain('Đóng góp quỹ họ tộc');
    });

    it('renders notification message', async () => {
      const el = await renderComponent(
        makeNotification({ message: 'Nguyễn Văn A đã đóng góp 1,000,000₫' }),
      );
      expect(getContent(el)).toContain('Nguyễn Văn A đã đóng góp 1,000,000₫');
    });

    it('renders formatted date', async () => {
      const el = await renderComponent(
        makeNotification({ date: '2025-01-15' }),
      );
      expect(getContent(el)).toContain('15/01/2025');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent(makeNotification());
      expect(el.shadowRoot).toBeNull();
    });

    it('renders nothing when notification is not set', async () => {
      const el = document.createElement('notification-item');
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.querySelector('h4')).toBeNull();
    });

    it('renders nothing when dismissed', async () => {
      const el = await renderComponent(makeNotification(), { dismissed: true });
      expect(el.querySelector('h4')).toBeNull();
    });
  });

  describe('notification type icons', () => {
    it('shows fund_change icon', async () => {
      const el = await renderComponent(
        makeNotification({ type: 'fund_change' }),
      );
      expect(getContent(el)).toContain('💰');
    });

    it('shows new_event icon', async () => {
      const el = await renderComponent(makeNotification({ type: 'new_event' }));
      expect(getContent(el)).toContain('📅');
    });

    it('shows memorial_reminder icon', async () => {
      const el = await renderComponent(
        makeNotification({ type: 'memorial_reminder' }),
      );
      expect(getContent(el)).toContain('🕯️');
    });

    it('shows member_joins icon', async () => {
      const el = await renderComponent(
        makeNotification({ type: 'member_joins' }),
      );
      expect(getContent(el)).toContain('👤');
    });

    it('shows fallback icon for unknown type', async () => {
      const el = await renderComponent(makeNotification({ type: 'unknown' }));
      expect(getContent(el)).toContain('📌');
    });
  });

  describe('unread indicator', () => {
    it('shows green dot when unread', async () => {
      const el = await renderComponent(makeNotification({ read: false }));
      const rendered = getContent(el);
      expect(rendered).toContain('bg-emerald-500');
      expect(rendered).toContain('rounded-full');
    });

    it('hides green dot when read', async () => {
      const el = await renderComponent(makeNotification({ read: true }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('bg-emerald-500');
    });

    it('shows unread background when unread', async () => {
      const el = await renderComponent(makeNotification({ read: false }));
      const rendered = getContent(el);
      expect(rendered).toContain('bg-emerald-50');
      expect(rendered).toContain('border-emerald-200');
    });

    it('shows white background when read', async () => {
      const el = await renderComponent(makeNotification({ read: true }));
      const rendered = getContent(el);
      expect(rendered).toContain('bg-white');
      expect(rendered).toContain('border-gray-200');
    });
  });

  describe('mark read button', () => {
    it('shows mark read button when unread', async () => {
      const el = await renderComponent(makeNotification({ read: false }));
      expect(getContent(el)).toContain('Đánh dấu đã đọc');
    });

    it('hides mark read button when read', async () => {
      const el = await renderComponent(makeNotification({ read: true }));
      expect(getContent(el)).not.toContain('Đánh dấu đã đọc');
    });

    it('dispatches mark-read event on button click', async () => {
      const notification = makeNotification({ read: false });
      const el = await renderComponent(notification);
      const markReadPromise = new Promise<CustomEvent>((resolve) => {
        el.addEventListener('mark-read', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });
      const buttons = el.querySelectorAll('button');
      const markReadBtn = buttons[buttons.length - 1]!;
      markReadBtn.click();
      const event = await markReadPromise;
      expect(event.type).toBe('mark-read');
    });

    it('sets read flag on notification object', async () => {
      const notification = makeNotification({ read: false });
      const el = await renderComponent(notification);
      const buttons = el.querySelectorAll('button');
      const markReadBtn = buttons[buttons.length - 1]!;
      markReadBtn.click();
      await el.updateComplete;
      expect(notification.read).toBe(true);
    });
  });

  describe('delete button', () => {
    it('renders delete button with ✕ character', async () => {
      const el = await renderComponent(makeNotification());
      expect(getContent(el)).toContain('✕');
    });

    it('dispatches dismiss event on delete click', async () => {
      const el = await renderComponent(makeNotification());
      const dismissPromise = new Promise<CustomEvent>((resolve) => {
        el.addEventListener('dismiss', (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });
      const deleteBtn = el.querySelector(
        'button[title="Delete"]',
      ) as HTMLButtonElement;
      deleteBtn.click();
      const event = await dismissPromise;
      expect(event.type).toBe('dismiss');
    });

    it('sets dismissed flag on dismiss', async () => {
      const el = await renderComponent(makeNotification());
      const deleteBtn = el.querySelector(
        'button[title="Delete"]',
      ) as HTMLButtonElement;
      deleteBtn.click();
      await el.updateComplete;
      expect(el.dismissed).toBe(true);
    });

    it('delete button does not trigger mark-read', async () => {
      const notification = makeNotification({ read: false });
      const el = await renderComponent(notification);
      let markReadFired = false;
      el.addEventListener('mark-read', () => {
        markReadFired = true;
      });
      const deleteBtn = el.querySelector(
        'button[title="Delete"]',
      ) as HTMLButtonElement;
      deleteBtn.click();
      await el.updateComplete;
      expect(markReadFired).toBe(false);
    });
  });

  describe('dark mode', () => {
    it('has dark mode classes for unread state', async () => {
      const el = await renderComponent(makeNotification({ read: false }));
      const rendered = getContent(el);
      expect(rendered).toContain('dark:bg-emerald-900');
      expect(rendered).toContain('dark:border-emerald-800');
    });

    it('has dark mode classes for read state', async () => {
      const el = await renderComponent(makeNotification({ read: true }));
      const rendered = getContent(el);
      expect(rendered).toContain('dark:bg-gray-800');
      expect(rendered).toContain('dark:border-gray-700');
    });

    it('has dark mode text colors', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('dark:text-gray-200');
      expect(rendered).toContain('dark:text-gray-400');
    });

    it('has dark mode mark read link color', async () => {
      const el = await renderComponent(makeNotification({ read: false }));
      const rendered = getContent(el);
      expect(rendered).toContain('dark:text-emerald-400');
    });

    it('has dark mode delete button color', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('dark:text-gray-600');
      expect(rendered).toContain('dark:hover:text-red-400');
    });
  });

  describe('styling', () => {
    it('has flex layout with gap-4', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('flex');
      expect(rendered).toContain('gap-4');
    });

    it('has rounded-xl and border classes', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('rounded-xl');
      expect(rendered).toContain('border');
    });

    it('has p-4 padding on mobile, p-5 on lg', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('p-4');
      expect(rendered).toContain('lg:p-5');
    });

    it('icon has text-2xl and flex-shrink-0', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('text-2xl');
      expect(rendered).toContain('flex-shrink-0');
    });

    it('title is truncated', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('truncate');
    });

    it('message has leading-relaxed', async () => {
      const el = await renderComponent(makeNotification());
      const rendered = getContent(el);
      expect(rendered).toContain('leading-relaxed');
    });
  });

  describe('edge cases', () => {
    it('handles empty title', async () => {
      const el = await renderComponent(makeNotification({ title: '' }));
      const rendered = getContent(el);
      expect(rendered).toContain('<h4');
    });

    it('handles long message', async () => {
      const longMsg = 'A'.repeat(200);
      const el = await renderComponent(makeNotification({ message: longMsg }));
      expect(getContent(el)).toContain(longMsg);
    });

    it('handles long title with truncation class', async () => {
      const longTitle = 'A'.repeat(100);
      const el = await renderComponent(makeNotification({ title: longTitle }));
      const rendered = getContent(el);
      expect(rendered).toContain('truncate');
      expect(rendered).toContain(longTitle);
    });
  });
});
