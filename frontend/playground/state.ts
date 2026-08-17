import type { FieldType } from '../src/components/app-input.js';
import type { SelectOption } from '../src/components/app-select.js';
import type { AvatarSize } from '../src/components/person-avatar.js';
import type { TabDef } from '../src/components/tabs.js';
import type {
  Event as CalendarEvent,
  Notification,
  Person,
  Transaction,
} from '../src/types/index.js';

export interface PlaygroundState {
  dark: boolean;
  avatarSize: AvatarSize;
  selected: boolean;
  honorific: string;
  locked: boolean;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventDescription: string;
  eventStatus: 'upcoming' | 'past';
  eventType: string;
  eventLunarDate: string;
  eventMapUrl: string;
  eventImages: string;
  eventCanEdit: boolean;
  txnType: 'contribution' | 'expense';
  txnAmount: number;
  txnDate: string;
  txnDescription: string;
  txnPersonName: string;
  txnEventName: string;
  txnCurrency: string;
  notifType: string;
  notifTitle: string;
  notifMessage: string;
  notifTimestamp: string;
  notifRead: boolean;
  modalOpen: boolean;
  modalTitle: string;
  modalName: string;
  modalBirthYear: string;
  fieldLabel: string;
  fieldType: FieldType;
  fieldValue: string;
  fieldPlaceholder: string;
  fieldRequired: boolean;
  fieldDisabled: boolean;
  selectValue: string;
  selectShowPlaceholder: boolean;
  textareaValue: string;
  textareaRows: number;
  toggleChecked: boolean;
  tabsValue: string;
  emptyIcon: string;
  emptyMessage: string;
  emptyVisible: boolean;
  lastEvent: string;
}

export const state: PlaygroundState = {
  dark: false,
  avatarSize: 'md',
  selected: false,
  honorific: 'Bố',
  locked: false,
  eventTitle: 'Family Reunion',
  eventDate: '2024-02-10',
  eventLocation: 'Ho Chi Minh City, Vietnam',
  eventDescription:
    'Annual family gathering for the Lunar New Year celebration.',
  eventStatus: 'upcoming',
  eventType: 'reunion',
  eventLunarDate: '2024-01-10',
  eventMapUrl: 'https://maps.google.com/?q=ho+chi+minh+city',
  eventImages:
    'https://picsum.photos/seed/img1/300/200,https://picsum.photos/seed/img2/300/200',
  eventCanEdit: true,
  txnType: 'contribution',
  txnAmount: 5000000,
  txnDate: '2025-01-15',
  txnDescription: 'Đóng góp quỹ họ tộc',
  txnPersonName: 'Nguyễn Văn A',
  txnEventName: '',
  txnCurrency: 'VND',
  notifType: 'fund_change',
  notifTitle: 'Payment received',
  notifMessage: '1,000,000₫ contribution from Nguyễn Văn A',
  notifTimestamp: '2025-01-15',
  notifRead: false,
  modalOpen: false,
  modalTitle: 'Edit member',
  modalName: 'Nguyễn Văn A',
  modalBirthYear: '1985',
  fieldLabel: 'Name',
  fieldType: 'text',
  fieldValue: 'Nguyễn Văn A',
  fieldPlaceholder: 'Enter full name',
  fieldRequired: false,
  fieldDisabled: false,
  selectValue: 'reunion',
  selectShowPlaceholder: false,
  textareaValue: 'Annual family gathering for the Lunar New Year.',
  textareaRows: 3,
  toggleChecked: true,
  tabsValue: 'upcoming',
  emptyIcon: '📭',
  emptyMessage: 'No events yet',
  emptyVisible: true,
  lastEvent: '',
};

export const tabOptions: TabDef[] = [
  { id: 'upcoming', label: '📅 Upcoming (3)' },
  { id: 'past', label: '📋 Past (12)' },
];

export const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];

export const eventTypeOptions: SelectOption[] = [
  { value: 'memorial', label: 'Memorial' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'anniversary', label: 'Anniversary' },
];

export const fieldTypeOptions: FieldType[] = ['text', 'number', 'date', 'url'];

export function updatePerson(): Person {
  return {
    id: 'playground',
    data: {
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      gender: 'M',
      birthYear: '1985',
      generation: 5,
      role: 'admin',
    },
    rels: { parents: [], spouses: [], children: [] },
  };
}

export function demoPersons(): Person[] {
  return [
    updatePerson(),
    {
      id: 'attendee-1',
      data: {
        firstName: 'Hương',
        lastName: 'Trần',
        gender: 'F',
        generation: 5,
      },
      rels: { parents: [], spouses: [], children: [] },
    },
    {
      id: 'attendee-2',
      data: {
        firstName: 'Thắng',
        lastName: 'Lê',
        gender: 'M',
        generation: 6,
      },
      rels: { parents: [], spouses: [], children: [] },
    },
    {
      id: 'attendee-3',
      data: {
        firstName: 'Mai',
        lastName: 'Phạm',
        gender: 'F',
        generation: 6,
        avatar: 'https://picsum.photos/seed/mai/32/32',
      },
      rels: { parents: [], spouses: [], children: [] },
    },
  ];
}

export function updateEvent(persons: Person[]): CalendarEvent {
  return {
    id: 'playground-event',
    title: state.eventTitle,
    date: state.eventDate,
    location: state.eventLocation,
    description: state.eventDescription,
    status: state.eventStatus,
    type: state.eventType || undefined,
    lunarDate: state.eventLunarDate || undefined,
    mapUrl: state.eventMapUrl || undefined,
    images: state.eventImages
      ? state.eventImages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined,
    attendees: persons.map((p) => p.id),
  };
}

export function updateTransaction(): Transaction {
  return {
    id: 'playground-txn',
    type: state.txnType,
    amount: state.txnAmount,
    date: state.txnDate,
    description: state.txnDescription,
    personId: state.txnPersonName ? 'playground-person' : undefined,
    eventId: state.txnEventName ? 'playground-event' : undefined,
  };
}

export function updateNotification(): Notification {
  return {
    id: 'playground-notif',
    type: state.notifType,
    title: state.notifTitle,
    message: state.notifMessage,
    date: state.notifTimestamp,
    read: state.notifRead,
  };
}

type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}
