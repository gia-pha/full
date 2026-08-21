import { afterEach, describe, expect, it, vi } from 'vitest';
import { html, type TemplateResult } from 'lit';
import '../../src/components/modal.js';
import type { Modal } from '../../src/components/modal.js';

const sampleBody = html`<p class="modal-test-body">Hello body</p>`;

async function renderComponent(opts?: {
  title?: string;
  open?: boolean;
  body?: TemplateResult;
}): Promise<Modal> {
  const el = document.createElement('app-modal');
  if (opts?.title !== undefined) el.title = opts.title;
  if (opts?.body !== undefined) el.body = opts.body;
  document.body.appendChild(el);
  if (opts?.open !== undefined) el.open = opts.open;
  await el.updateComplete;
  return el;
}

function getContent(el: Modal): string {
  return el.innerHTML;
}

function awaitClose(el: Modal): Promise<CustomEvent> {
  return new Promise((resolve) => {
    el.addEventListener('close', (e) => resolve(e as CustomEvent), {
      once: true,
    });
  });
}

function tick(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

afterEach(() => {
  document.querySelectorAll('app-modal').forEach((el) => el.remove());
});

describe('Modal', () => {
  describe('basic rendering', () => {
    it('renders nothing when closed', async () => {
      const el = await renderComponent({ open: false, title: 'Title' });
      expect(el.querySelector('.modal-overlay')).toBeNull();
      expect(el.querySelector('.modal-content')).toBeNull();
    });

    it('renders nothing when open is not set', async () => {
      const el = await renderComponent({ title: 'Title' });
      expect(el.querySelector('.modal-overlay')).toBeNull();
    });

    it('renders overlay and content when open', async () => {
      const el = await renderComponent({ open: true, title: 'Title' });
      expect(el.querySelector('.modal-overlay')).not.toBeNull();
      expect(el.querySelector('.modal-content')).not.toBeNull();
    });

    it('reflects open attribute', async () => {
      const el = await renderComponent({ open: true });
      expect(el.hasAttribute('open')).toBe(true);
      el.open = false;
      await el.updateComplete;
      expect(el.hasAttribute('open')).toBe(false);
    });

    it('renders title in header', async () => {
      const el = await renderComponent({ open: true, title: 'Edit member' });
      const rendered = getContent(el);
      expect(rendered).toContain('<h3');
      expect(rendered).toContain('Edit member');
    });

    it('renders body template inside content area', async () => {
      const el = await renderComponent({ open: true, body: sampleBody });
      const rendered = getContent(el);
      expect(rendered).toContain('Hello body');
      expect(el.querySelector('.modal-test-body')).not.toBeNull();
    });

    it('renders empty content area when no body provided', async () => {
      const el = await renderComponent({ open: true });
      const content = el.querySelector('.modal-content')!;
      expect(content.querySelectorAll('div').length).toBe(2);
      const bodyArea = content.querySelector('div.overflow-y-auto');
      expect(bodyArea).not.toBeNull();
      expect(bodyArea?.textContent).toBe('');
      expect(bodyArea?.querySelectorAll('*').length).toBe(0);
    });

    it('renders close button with ✕ character', async () => {
      const el = await renderComponent({ open: true });
      const close = el.querySelector('.modal-close');
      expect(close).not.toBeNull();
      expect(getContent(el)).toContain('✕');
      expect(close?.getAttribute('aria-label')).toBe('Close');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent({ open: true });
      expect(el.shadowRoot).toBeNull();
    });
  });

  describe('close button', () => {
    it('dispatches close event on click', async () => {
      const el = await renderComponent({ open: true });
      const closeEvent = awaitClose(el);
      (el.querySelector('.modal-close') as HTMLButtonElement).click();
      const event = await closeEvent;
      expect(event.type).toBe('close');
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
    });
  });

  describe('overlay click', () => {
    it('dispatches close event when clicking overlay', async () => {
      const el = await renderComponent({ open: true });
      const closeEvent = awaitClose(el);
      (el.querySelector('.modal-overlay') as HTMLElement).click();
      const event = await closeEvent;
      expect(event.type).toBe('close');
    });

    it('does not dispatch close when clicking content', async () => {
      const el = await renderComponent({ open: true });
      let closed = false;
      el.addEventListener('close', () => {
        closed = true;
      });
      (el.querySelector('.modal-content') as HTMLElement).click();
      await tick();
      expect(closed).toBe(false);
    });
  });

  describe('escape key', () => {
    it('dispatches close event on Escape when open', async () => {
      const el = await renderComponent({ open: true });
      const closeEvent = awaitClose(el);
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );
      const event = await closeEvent;
      expect(event.type).toBe('close');
    });

    it('does not dispatch close on Escape when closed', async () => {
      const el = await renderComponent({ open: false });
      let closed = false;
      el.addEventListener('close', () => {
        closed = true;
      });
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );
      await tick();
      expect(closed).toBe(false);
    });

    it('does not dispatch close on other keys when open', async () => {
      const el = await renderComponent({ open: true });
      let closed = false;
      el.addEventListener('close', () => {
        closed = true;
      });
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      await tick();
      expect(closed).toBe(false);
    });
  });

  describe('enter animation', () => {
    it('sets hidden start state on the first frame', async () => {
      const rafs: FrameRequestCallback[] = [];
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafs.push(cb);
        return 0;
      });
      try {
        const el = document.createElement('app-modal');
        el.title = 'Title';
        document.body.appendChild(el);
        el.open = true;
        await el.updateComplete;
        const content = el.querySelector('.modal-content') as HTMLElement;
        expect(content.style.transform).toBe('');
        expect(rafs.length).toBe(1);
        rafs.shift()!(0);
        expect(content.style.transform).toBe('translateY(100%)');
        expect(content.style.opacity).toBe('0');
        expect(rafs.length).toBe(1);
      } finally {
        vi.restoreAllMocks();
      }
    });

    it('applies transition and visible end state on the second frame', async () => {
      const rafs: FrameRequestCallback[] = [];
      vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafs.push(cb);
        return 0;
      });
      try {
        const el = document.createElement('app-modal');
        el.title = 'Title';
        document.body.appendChild(el);
        el.open = true;
        await el.updateComplete;
        const content = el.querySelector('.modal-content') as HTMLElement;
        rafs.shift()!(0);
        rafs.shift()!(0);
        expect(content.style.transform).toBe('translateY(0)');
        expect(content.style.opacity).toBe('1');
        expect(content.style.transition).toContain('transform');
        expect(content.style.transition).toContain('opacity');
      } finally {
        vi.restoreAllMocks();
      }
    });

    it('does not re-animate when other properties change while open', async () => {
      const el = await renderComponent({ open: true, title: 'A' });
      await new Promise((r) => setTimeout(r, 50));
      const content = el.querySelector('.modal-content') as HTMLElement;
      expect(content.style.transform).toBe('translateY(0)');
      el.title = 'B';
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 50));
      expect(content.style.transform).toBe('translateY(0)');
      expect(content.style.opacity).toBe('1');
    });
  });
});
