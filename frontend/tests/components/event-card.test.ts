import { describe, expect, it, vi } from 'vitest';
import '../../src/components/event-card.js';
import type { EventCard } from '../../src/components/event-card.js';
import type { Event, Person } from '../../src/types/index.js';

const makeEvent = (overrides?: Partial<Event>): Event => ({
  id: 'event-1',
  title: 'Test Event',
  date: '2024-01-15',
  location: 'Hanoi, Vietnam',
  description: 'A test event description',
  status: 'upcoming',
  ...overrides,
});

const makePerson = (overrides?: Partial<Person['data']>): Person => ({
  id: 'person-1',
  data: {
    firstName: 'Văn',
    lastName: 'Nguyễn',
    gender: 'M',
    generation: 1,
    ...overrides,
  },
  rels: { parents: [], spouses: [], children: [] },
});

async function renderComponent(
  event: Event,
  opts?: {
    canEdit?: boolean;
    persons?: Person[];
  },
): Promise<EventCard> {
  const el = document.createElement('event-card');
  el.event = event;
  if (opts?.canEdit !== undefined) el.canEdit = opts.canEdit;
  if (opts?.persons) el.persons = opts.persons;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

function getContent(el: EventCard): string {
  return el.innerHTML;
}

describe('EventCard', () => {
  describe('basic rendering', () => {
    it('renders event title', async () => {
      const el = await renderComponent(makeEvent({ title: 'Wedding Anniversary' }));
      const rendered = getContent(el);
      expect(rendered).toContain('Wedding Anniversary');
    });

    it('renders event description', async () => {
      const el = await renderComponent(makeEvent({ description: 'A family gathering' }));
      const rendered = getContent(el);
      expect(rendered).toContain('A family gathering');
    });

    it('renders event location with map pin icon', async () => {
      const el = await renderComponent(makeEvent({ location: 'Ho Chi Minh City' }));
      const rendered = getContent(el);
      expect(rendered).toContain('📍');
      expect(rendered).toContain('Ho Chi Minh City');
    });

    it('renders formatted event date', async () => {
      const el = await renderComponent(makeEvent({ date: '2024-01-15' }));
      const rendered = getContent(el);
      expect(rendered).toContain('📅');
    });

    it('renders without shadow DOM', async () => {
      const el = await renderComponent(makeEvent());
      expect(el.shadowRoot).toBeNull();
    });

    it('renders nothing when event is not set', async () => {
      const el = document.createElement('event-card');
      document.body.appendChild(el);
      await el.updateComplete;
      expect(el.querySelector('.event-card')).toBeNull();
    });
  });

  describe('status badge', () => {
    it('shows Upcoming badge with green background for upcoming event', async () => {
      const el = await renderComponent(makeEvent({ status: 'upcoming' }));
      const rendered = getContent(el);
      expect(rendered).toContain('Upcoming');
      expect(rendered).toContain('bg-emerald-100');
      expect(rendered).toContain('text-emerald-700');
    });

    it('shows Past badge with gray background for past event', async () => {
      const el = await renderComponent(makeEvent({ status: 'past' }));
      const rendered = getContent(el);
      expect(rendered).toContain('Past');
      expect(rendered).toContain('bg-gray-100');
      expect(rendered).toContain('text-gray-500');
    });
  });

  describe('type category badge', () => {
    it('shows memorial type badge with amber color', async () => {
      const el = await renderComponent(makeEvent({ type: 'memorial' }));
      const rendered = getContent(el);
      expect(rendered).toContain('memorial');
      expect(rendered).toContain('bg-amber-100');
      expect(rendered).toContain('text-amber-700');
    });

    it('shows meeting type badge with blue color', async () => {
      const el = await renderComponent(makeEvent({ type: 'meeting' }));
      const rendered = getContent(el);
      expect(rendered).toContain('meeting');
      expect(rendered).toContain('bg-blue-100');
      expect(rendered).toContain('text-blue-700');
    });

    it('shows reunion type badge with emerald color', async () => {
      const el = await renderComponent(makeEvent({ type: 'reunion' }));
      const rendered = getContent(el);
      expect(rendered).toContain('reunion');
      expect(rendered).toContain('bg-emerald-100');
      expect(rendered).toContain('text-emerald-700');
    });

    it('shows anniversary type badge with purple color', async () => {
      const el = await renderComponent(makeEvent({ type: 'anniversary' }));
      const rendered = getContent(el);
      expect(rendered).toContain('anniversary');
      expect(rendered).toContain('bg-purple-100');
      expect(rendered).toContain('text-purple-700');
    });

    it('does not show type badge when type is undefined', async () => {
      const el = await renderComponent(makeEvent({ type: undefined }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('bg-amber-100');
      expect(rendered).not.toContain('bg-blue-100');
    });

    it('falls back to gray for unknown type', async () => {
      const el = await renderComponent(makeEvent({ type: 'custom' }));
      const rendered = getContent(el);
      expect(rendered).toContain('custom');
    });
  });

  describe('edit and delete actions', () => {
    it('shows edit and delete buttons when canEdit is true', async () => {
      const el = await renderComponent(makeEvent(), { canEdit: true });
      const rendered = getContent(el);
      expect(rendered).toContain('✏️');
      expect(rendered).toContain('🗑️');
    });

    it('does not show edit and delete buttons when canEdit is false', async () => {
      const el = await renderComponent(makeEvent(), { canEdit: false });
      const rendered = getContent(el);
      expect(rendered).not.toContain('✏️');
      expect(rendered).not.toContain('🗑️');
    });

    it('calls onEdit when edit button is clicked', async () => {
      const onEdit = vi.fn();
      const el = await renderComponent(makeEvent(), { canEdit: true });
      el.onEdit = onEdit;
      await el.updateComplete;
      el.querySelector('.event-edit')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onEdit).toHaveBeenCalledOnce();
    });

    it('calls onDelete when delete button is clicked', async () => {
      const onDelete = vi.fn();
      const el = await renderComponent(makeEvent(), { canEdit: true });
      el.onDelete = onDelete;
      await el.updateComplete;
      el.querySelector('.event-delete')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onDelete).toHaveBeenCalledOnce();
    });
  });

  describe('map link', () => {
    it('shows map link and add to calendar button when mapUrl is provided', async () => {
      const el = await renderComponent(
        makeEvent({ mapUrl: 'https://maps.google.com/?q=hanoi' }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('https://maps.google.com/?q=hanoi');
      expect(rendered).toContain('View Map');
      expect(rendered).toContain('Add to Calendar');
    });

    it('does not show map link when mapUrl is not provided', async () => {
      const el = await renderComponent(makeEvent({ mapUrl: undefined }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('View Map');
    });

    it('calls onAddToCalendar when add to calendar button is clicked', async () => {
      const onAddToCalendar = vi.fn();
      const el = await renderComponent(
        makeEvent({ mapUrl: 'https://maps.google.com' }),
      );
      el.onAddToCalendar = onAddToCalendar;
      await el.updateComplete;
      const buttons = el.innerHTML.match(/Add to Calendar/g);
      expect(buttons).not.toBeNull();
      const calendarBtn = Array.from(el.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Add to Calendar'),
      );
      expect(calendarBtn).toBeDefined();
      calendarBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(onAddToCalendar).toHaveBeenCalledOnce();
    });
  });

  describe('image gallery', () => {
    it('shows image gallery when images are provided', async () => {
      const el = await renderComponent(
        makeEvent({ images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'] }),
      );
      const text = el.textContent;
      expect(text).toContain('Images');
      const imgs = el.querySelectorAll('img[src*="example.com"]');
      expect(imgs.length).toBe(2);
    });

    it('does not show image gallery when images are empty', async () => {
      const el = await renderComponent(makeEvent({ images: [] }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('Images');
    });

    it('does not show image gallery when images are undefined', async () => {
      const el = await renderComponent(makeEvent({ images: undefined }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('Images');
    });
  });

  describe('attendees', () => {
    it('shows attendee count when attendees are provided', async () => {
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1', 'person-2', 'person-3'] }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('3 attendees');
    });

    it('shows attendee avatars when persons are provided', async () => {
      const persons = [makePerson({ firstName: 'Văn', lastName: 'Nguyễn' })];
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1'] }),
        { persons },
      );
      const rendered = getContent(el);
      expect(rendered).toContain('Văn Nguyễn');
    });

    it('does not show attendees section when attendees are undefined', async () => {
      const el = await renderComponent(makeEvent({ attendees: undefined }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('attendees');
    });

    it('does not show attendees section when attendees array is empty', async () => {
      const el = await renderComponent(makeEvent({ attendees: [] }));
      const rendered = getContent(el);
      expect(rendered).not.toContain('attendees');
    });
  });

  describe('lunar date display', () => {
    it('shows lunar date as secondary when lunarDate is provided', async () => {
      const el = await renderComponent(
        makeEvent({ date: '2024-01-15', lunarDate: '2024-01-10' }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('🌙');
      expect(rendered).toContain('2024-01-10');
      expect(rendered).toContain('text-amber-600');
    });

    it('does not show lunar date section when lunarDate is not provided', async () => {
      const el = await renderComponent(
        makeEvent({ date: '2024-01-15', lunarDate: undefined }),
      );
      const rendered = getContent(el);
      expect(rendered).not.toContain('text-amber-600');
    });

    it('always shows solar date first regardless of lunarDate', async () => {
      const el = await renderComponent(
        makeEvent({ date: '2024-01-15', lunarDate: '2024-01-10' }),
      );
      const rendered = getContent(el);
      expect(rendered).toContain('📅');
    });
  });

  describe('attendee avatars', () => {
    it('shows gender icon avatar when person has no avatar URL', async () => {
      const persons = [makePerson({ gender: 'M', firstName: 'Văn', lastName: 'Nguyễn' })];
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1'] }),
        { persons },
      );
      expect(el.shadowRoot).toBeNull();
      const rendered = getContent(el);
      expect(rendered).toContain('w-8 h-8 rounded-full');
    });

    it('shows female avatar with pink colors when no avatar URL', async () => {
      const persons = [makePerson({ gender: 'F', firstName: 'Hương', lastName: 'Trần' })];
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1'] }),
        { persons },
      );
      const rendered = getContent(el);
      expect(rendered).toContain('bg-pink-100');
    });

    it('shows male avatar with blue colors when no avatar URL', async () => {
      const persons = [makePerson({ gender: 'M', firstName: 'Văn', lastName: 'Nguyễn' })];
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1'] }),
        { persons },
      );
      const rendered = getContent(el);
      expect(rendered).toContain('bg-blue-100');
    });

    it('shows avatar image for attendees with avatar URL', async () => {
      const persons = [makePerson({ avatar: 'https://example.com/avatar.jpg' })];
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1'] }),
        { persons },
      );
      const rendered = getContent(el);
      expect(rendered).toContain('https://example.com/avatar.jpg');
    });

    it('shows multiple attendee avatars with mixed avatar types', async () => {
      const p1: Person = {
        id: 'person-1',
        data: { firstName: 'Văn', lastName: 'Nguyễn', gender: 'M', generation: 1 },
        rels: { parents: [], spouses: [], children: [] },
      };
      const p2: Person = {
        id: 'person-2',
        data: { firstName: 'Hương', lastName: 'Trần', gender: 'F', generation: 1, avatar: 'https://example.com/avatar.jpg' },
        rels: { parents: [], spouses: [], children: [] },
      };
      const p3: Person = {
        id: 'person-3',
        data: { firstName: 'Thắng', lastName: 'Lê', gender: 'M', generation: 2 },
        rels: { parents: [], spouses: [], children: [] },
      };
      const el = await renderComponent(
        makeEvent({ attendees: ['person-1', 'person-2', 'person-3'] }),
        { persons: [p1, p2, p3] },
      );
      const rendered = getContent(el);
      expect(rendered).toContain('3 attendees');
      expect(rendered).toContain('https://example.com/avatar.jpg');
      expect(rendered).toContain('Văn Nguyễn');
    });
  });

  describe('styling', () => {
    it('has rounded-2xl border classes', async () => {
      const el = await renderComponent(makeEvent());
      const rendered = getContent(el);
      expect(rendered).toContain('rounded-2xl');
      expect(rendered).toContain('border');
    });

    it('has hover shadow classes', async () => {
      const el = await renderComponent(makeEvent());
      const rendered = getContent(el);
      expect(rendered).toContain('hover:shadow-lg');
      expect(rendered).toContain('transition-shadow');
    });

    it('has white background', async () => {
      const el = await renderComponent(makeEvent());
      const rendered = getContent(el);
      expect(rendered).toContain('bg-white');
    });
  });
});
