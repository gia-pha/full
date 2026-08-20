import type { ButtonVariant } from '../src/components/app-button.js';
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
  stackMax: number;
  stackLabel: string;
  stackShowOverflow: boolean;
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
  buttonVariant: ButtonVariant;
  buttonIcon: string;
  buttonLabel: string;
  buttonFullWidth: boolean;
  buttonDisabled: boolean;
  chartScenario: 'sample' | 'usd' | 'empty';
  chartTitle: string;
  chartShowLegend: boolean;
  chartSlashedLabels: boolean;
  lastEvent: string;
}

export const state: PlaygroundState = {
  dark: false,
  avatarSize: 'md',
  stackMax: 3,
  stackLabel: '4 người tham gia',
  stackShowOverflow: true,
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
  buttonVariant: 'primary',
  buttonIcon: '',
  buttonLabel: 'Save changes',
  buttonFullWidth: false,
  buttonDisabled: false,
  chartScenario: 'sample',
  chartTitle: 'Biểu đồ theo tháng',
  chartShowLegend: true,
  chartSlashedLabels: false,
  lastEvent: '',
};

const chartSample: Transaction[] = [
  {
    id: 'fc-1',
    date: '2024-12-05',
    type: 'expense',
    amount: 2_000_000,
    description: 'Sửa bàn thờ tổ',
  },
  {
    id: 'fc-2',
    date: '2025-01-15',
    type: 'contribution',
    amount: 10_000_000,
    description: 'Đóng góp quý I',
  },
  {
    id: 'fc-3',
    date: '2025-01-25',
    type: 'contribution',
    amount: 5_000_000,
    description: 'Hương công khuyến mãi',
  },
  {
    id: 'fc-4',
    date: '2025-02-10',
    type: 'expense',
    amount: 15_000_000,
    description: 'Lễ giỗ tổ 2025',
  },
  {
    id: 'fc-5',
    date: '2025-02-20',
    type: 'contribution',
    amount: 8_000_000,
    description: 'Đóng góp quý I (đợt 2)',
  },
  {
    id: 'fc-6',
    date: '2025-03-05',
    type: 'contribution',
    amount: 12_000_000,
    description: 'Đóng góp quý II',
  },
  {
    id: 'fc-7',
    date: '2025-03-18',
    type: 'expense',
    amount: 3_000_000,
    description: 'In sao lục gia phả',
  },
];

const chartUsd: Transaction[] = [
  {
    id: 'fc-u1',
    date: '2025-01-10',
    type: 'contribution',
    amount: 250,
    description: 'Family fund contribution',
  },
  {
    id: 'fc-u2',
    date: '2025-01-22',
    type: 'expense',
    amount: 90,
    description: 'Ancestral hall repairs',
  },
  {
    id: 'fc-u3',
    date: '2025-02-14',
    type: 'contribution',
    amount: 400,
    description: 'Annual meeting fund',
  },
];

export function chartTransactions(): Transaction[] {
  if (state.chartScenario === 'empty') return [];
  if (state.chartScenario === 'usd') return chartUsd;
  return chartSample;
}

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
