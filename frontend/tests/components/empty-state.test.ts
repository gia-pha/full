import { afterEach, describe, expect, it } from 'vitest';
import '../../src/components/empty-state.js';
import type { AppEmptyState } from '../../src/components/empty-state.js';

async function renderComponent(opts?: {
  icon?: string;
  message?: string;
}): Promise<AppEmptyState> {
  const el = document.createElement('app-empty-state');
  if (opts?.icon !== undefined) el.icon = opts.icon;
  if (opts?.message !== undefined) el.message = opts.message;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getIcon(el: AppEmptyState): HTMLDivElement {
  return el.querySelector('.text-5xl')!;
}

function getMessage(el: AppEmptyState): HTMLParagraphElement {
  return el.querySelector('p')!;
}

afterEach(() => {
  document.querySelectorAll('app-empty-state').forEach((el) => {
    el.remove();
  });
});

describe('AppEmptyState', () => {
  it('renders a message', async () => {
    const el = await renderComponent({ message: 'No events' });
    expect(getMessage(el).textContent).toBe('No events');
  });

  it('defaults to the inbox icon', async () => {
    const el = await renderComponent({ message: 'No events' });
    expect(getIcon(el).textContent).toBe('📭');
  });

  it('renders a custom icon', async () => {
    const el = await renderComponent({
      icon: '🔕',
      message: 'No notifications',
    });
    expect(getIcon(el).textContent).toBe('🔕');
  });

  it('renders with no message when message is empty', async () => {
    const el = await renderComponent({});
    expect(getIcon(el)).not.toBeNull();
    expect(getMessage(el).textContent).toBe('');
  });

  it('centers the content', async () => {
    const el = await renderComponent({ message: 'Nothing here' });
    expect(el.querySelector('.text-center')).not.toBeNull();
  });

  it('renders without shadow DOM', async () => {
    const el = await renderComponent({ message: 'x' });
    expect(el.shadowRoot).toBeNull();
  });
});
