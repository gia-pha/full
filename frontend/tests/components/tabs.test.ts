import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/tabs.js';
import type {
  AppTabs,
  TabDef,
  TabsDetail,
} from '../../src/components/tabs.js';

const defaultTabs: TabDef[] = [
  { id: 'upcoming', label: '📅 Upcoming (3)' },
  { id: 'past', label: '📋 Past (12)' },
];

async function renderComponent(opts?: {
  tabs?: TabDef[];
  value?: string;
}): Promise<AppTabs> {
  const el = document.createElement('app-tabs');
  if (opts?.tabs !== undefined) el.tabs = opts.tabs;
  if (opts?.value !== undefined) el.value = opts.value;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getTabButtons(el: AppTabs): HTMLButtonElement[] {
  return Array.from(el.querySelectorAll<HTMLButtonElement>('button[role="tab"]'));
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-tabs').forEach((el) => el.remove());
});

describe('AppTabs', () => {
  describe('basic rendering', () => {
    it('renders one button per tab', async () => {
      const el = await renderComponent({ tabs: defaultTabs });
      const buttons = getTabButtons(el);
      expect(buttons).toHaveLength(2);
      expect(buttons[0].textContent!.trim()).toBe('📅 Upcoming (3)');
      expect(buttons[1].textContent!.trim()).toBe('📋 Past (12)');
    });

    it('renders nothing when tabs is empty', async () => {
      const el = await renderComponent({ tabs: [] });
      expect(getTabButtons(el)).toHaveLength(0);
    });

    it('renders a tablist container', async () => {
      const el = await renderComponent({ tabs: defaultTabs });
      expect(el.querySelector('[role="tablist"]')).not.toBeNull();
    });

    it('marks active tab with aria-selected', async () => {
      const el = await renderComponent({
        tabs: defaultTabs,
        value: 'past',
      });
      const buttons = getTabButtons(el);
      expect(buttons[0].getAttribute('aria-selected')).toBe('false');
      expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    });

    it('styles the active tab distinct from inactive tabs', async () => {
      const el = await renderComponent({
        tabs: defaultTabs,
        value: 'upcoming',
      });
      const buttons = getTabButtons(el);
      expect(buttons[0].className).toContain('bg-emerald-600');
      expect(buttons[1].className).not.toContain('bg-emerald-600');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ tabs: defaultTabs });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('interaction', () => {
    it('selects a tab on click and dispatches change', async () => {
      const el = await renderComponent({
        tabs: defaultTabs,
        value: 'upcoming',
      });
      const events: TabsDetail[] = [];
      el.addEventListener('change', (e) =>
        events.push((e as CustomEvent<TabsDetail>).detail),
      );
      getTabButtons(el)[1].click();
      await el.updateComplete;
      expect(el.value).toBe('past');
      expect(events).toEqual([{ id: 'past' }]);
      expect(
        getTabButtons(el)[1].getAttribute('aria-selected'),
      ).toBe('true');
    });

    it('does not dispatch when clicking the already-active tab', async () => {
      const el = await renderComponent({
        tabs: defaultTabs,
        value: 'upcoming',
      });
      let changed = false;
      el.addEventListener('change', () => {
        changed = true;
      });
      getTabButtons(el)[0].click();
      await el.updateComplete;
      await tick();
      expect(changed).toBe(false);
    });

    it('keeps externally set value in sync after parent re-render', async () => {
      const el = await renderComponent({
        tabs: defaultTabs,
        value: 'upcoming',
      });
      el.value = 'past';
      await el.updateComplete;
      const buttons = getTabButtons(el);
      expect(buttons[0].getAttribute('aria-selected')).toBe('false');
      expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    });
  });
});
