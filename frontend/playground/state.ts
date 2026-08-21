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
  chartScenario: 'sample' | 'usd' | 'big' | 'empty';
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
    id: 'fc-201',
    date: '2024-01-08',
    type: 'contribution',
    amount: 8_000_000,
    description: 'Đóng góp quý I',
  },
  {
    id: 'fc-202',
    date: '2024-01-28',
    type: 'expense',
    amount: 2_000_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-203',
    date: '2024-02-05',
    type: 'contribution',
    amount: 12_000_000,
    description: 'Quỹ Tết Nguyên đán',
  },
  {
    id: 'fc-204',
    date: '2024-02-12',
    type: 'expense',
    amount: 20_000_000,
    description: 'Lễ giỗ đầu năm',
  },
  {
    id: 'fc-205',
    date: '2024-03-06',
    type: 'contribution',
    amount: 9_000_000,
    description: 'Đóng góp quý I',
  },
  {
    id: 'fc-206',
    date: '2024-03-20',
    type: 'expense',
    amount: 4_500_000,
    description: 'Sửa chữa nhà thờ họ',
  },
  {
    id: 'fc-207',
    date: '2024-04-14',
    type: 'contribution',
    amount: 10_000_000,
    description: 'Đóng góp quý II',
  },
  {
    id: 'fc-208',
    date: '2024-04-26',
    type: 'expense',
    amount: 1_500_000,
    description: 'In bảng họ',
  },
  {
    id: 'fc-209',
    date: '2024-05-09',
    type: 'contribution',
    amount: 7_500_000,
    description: 'Hỗ trợ từ thành nhánh họ',
  },
  {
    id: 'fc-210',
    date: '2024-05-31',
    type: 'expense',
    amount: 6_000_000,
    description: 'Lễ kỳ yên bàn thờ tổ',
  },
  {
    id: 'fc-211',
    date: '2024-06-07',
    type: 'contribution',
    amount: 14_000_000,
    description: 'Đóng góp quý II',
  },
  {
    id: 'fc-212',
    date: '2024-06-19',
    type: 'expense',
    amount: 3_500_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-213',
    date: '2024-07-11',
    type: 'contribution',
    amount: 6_000_000,
    description: 'Hỗ trợ học bổng',
  },
  {
    id: 'fc-214',
    date: '2024-07-24',
    type: 'expense',
    amount: 9_000_000,
    description: 'Tổ chức liên hoan họ',
  },
  {
    id: 'fc-215',
    date: '2024-08-05',
    type: 'contribution',
    amount: 11_000_000,
    description: 'Đóng góp quý III',
  },
  {
    id: 'fc-216',
    date: '2024-08-18',
    type: 'expense',
    amount: 2_800_000,
    description: 'In sao lục gia phả',
  },
  {
    id: 'fc-217',
    date: '2024-09-09',
    type: 'contribution',
    amount: 8_500_000,
    description: 'Đóng góp quý III',
  },
  {
    id: 'fc-218',
    date: '2024-09-23',
    type: 'expense',
    amount: 12_000_000,
    description: 'Sửa chữa nhà thờ họ',
  },
  {
    id: 'fc-219',
    date: '2024-10-07',
    type: 'contribution',
    amount: 13_000_000,
    description: 'Quỹ xây nhà thờ họ',
  },
  {
    id: 'fc-220',
    date: '2024-10-21',
    type: 'expense',
    amount: 1_900_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-221',
    date: '2024-11-06',
    type: 'contribution',
    amount: 9_500_000,
    description: 'Đóng góp quý IV',
  },
  {
    id: 'fc-222',
    date: '2024-11-19',
    type: 'expense',
    amount: 5_000_000,
    description: 'Hỗ trợ hội viên khó khăn',
  },
  {
    id: 'fc-1',
    date: '2024-12-05',
    type: 'expense',
    amount: 2_000_000,
    description: 'Sửa bàn thờ tổ',
  },
  {
    id: 'fc-223',
    date: '2024-12-18',
    type: 'contribution',
    amount: 10_000_000,
    description: 'Đóng góp quý IV',
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
  {
    id: 'fc-224',
    date: '2025-03-22',
    type: 'expense',
    amount: 2_200_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-8',
    date: '2025-04-10',
    type: 'contribution',
    amount: 10_000_000,
    description: 'Đóng góp quý II (đợt 2)',
  },
  {
    id: 'fc-9',
    date: '2025-04-22',
    type: 'expense',
    amount: 2_500_000,
    description: 'In bảng họ',
  },
  {
    id: 'fc-225',
    date: '2025-04-29',
    type: 'contribution',
    amount: 5_000_000,
    description: 'Đóng góp thiện nguyện',
  },
  {
    id: 'fc-10',
    date: '2025-05-05',
    type: 'contribution',
    amount: 7_000_000,
    description: 'Hỗ trợ từ thành nhánh họ',
  },
  {
    id: 'fc-11',
    date: '2025-05-30',
    type: 'expense',
    amount: 18_000_000,
    description: 'Lễ kỳ yên bàn thờ tổ',
  },
  {
    id: 'fc-12',
    date: '2025-06-08',
    type: 'contribution',
    amount: 15_000_000,
    description: 'Quỹ xây nhà thờ họ',
  },
  {
    id: 'fc-13',
    date: '2025-06-25',
    type: 'contribution',
    amount: 4_000_000,
    description: 'Đóng góp thiện nguyện',
  },
  {
    id: 'fc-226',
    date: '2025-06-30',
    type: 'expense',
    amount: 1_000_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-14',
    date: '2025-07-12',
    type: 'expense',
    amount: 5_500_000,
    description: 'Sửa cổng nhà thờ họ',
  },
  {
    id: 'fc-227',
    date: '2025-07-16',
    type: 'contribution',
    amount: 4_500_000,
    description: 'Hỗ trợ học bổng',
  },
  {
    id: 'fc-15',
    date: '2025-07-28',
    type: 'contribution',
    amount: 9_000_000,
    description: 'Đóng góp quý III',
  },
  {
    id: 'fc-16',
    date: '2025-08-10',
    type: 'expense',
    amount: 1_200_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-228',
    date: '2025-08-18',
    type: 'contribution',
    amount: 10_000_000,
    description: 'Đóng góp quý III',
  },
  {
    id: 'fc-17',
    date: '2025-09-02',
    type: 'contribution',
    amount: 11_000_000,
    description: 'Đóng góp quý III (đợt 2)',
  },
  {
    id: 'fc-18',
    date: '2025-09-18',
    type: 'contribution',
    amount: 6_500_000,
    description: 'Hỗ trợ học bổng',
  },
  {
    id: 'fc-229',
    date: '2025-10-07',
    type: 'contribution',
    amount: 11_000_000,
    description: 'Đóng góp quý IV',
  },
  {
    id: 'fc-230',
    date: '2025-10-21',
    type: 'expense',
    amount: 2_400_000,
    description: 'Chi vận hành hàng tháng',
  },
  {
    id: 'fc-231',
    date: '2025-11-04',
    type: 'contribution',
    amount: 9_000_000,
    description: 'Đóng góp quý IV',
  },
  {
    id: 'fc-232',
    date: '2025-11-18',
    type: 'expense',
    amount: 8_000_000,
    description: 'Lễ giỗ tổ 2025',
  },
  {
    id: 'fc-233',
    date: '2025-12-06',
    type: 'contribution',
    amount: 16_000_000,
    description: 'Quỹ Tết Nguyên đán',
  },
  {
    id: 'fc-234',
    date: '2025-12-20',
    type: 'expense',
    amount: 3_200_000,
    description: 'In bảng họ',
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
  {
    id: 'fc-u4',
    date: '2025-03-08',
    type: 'contribution',
    amount: 350,
    description: 'Spring fund drive',
  },
  {
    id: 'fc-u5',
    date: '2025-03-21',
    type: 'expense',
    amount: 120,
    description: 'Cemetery plot maintenance',
  },
  {
    id: 'fc-u6',
    date: '2025-04-12',
    type: 'contribution',
    amount: 500,
    description: 'Family fund contribution',
  },
  {
    id: 'fc-u7',
    date: '2025-04-28',
    type: 'expense',
    amount: 310,
    description: 'Chapel roof repair',
  },
  {
    id: 'fc-u8',
    date: '2025-05-06',
    type: 'expense',
    amount: 75,
    description: 'Printing genealogy updates',
  },
  {
    id: 'fc-u9',
    date: '2025-05-19',
    type: 'contribution',
    amount: 420,
    description: 'Family fund contribution',
  },
  {
    id: 'fc-u10',
    date: '2025-06-03',
    type: 'contribution',
    amount: 180,
    description: 'Scholarship fund',
  },
  {
    id: 'fc-u11',
    date: '2025-06-24',
    type: 'expense',
    amount: 240,
    description: 'Family reunion dinner',
  },
  {
    id: 'fc-u12',
    date: '2025-07-10',
    type: 'contribution',
    amount: 275,
    description: 'Family fund contribution',
  },
  {
    id: 'fc-u13',
    date: '2025-07-25',
    type: 'expense',
    amount: 190,
    description: 'Grave site cleaning service',
  },
  {
    id: 'fc-u14',
    date: '2025-08-06',
    type: 'contribution',
    amount: 320,
    description: 'Family fund contribution',
  },
  {
    id: 'fc-u15',
    date: '2025-08-20',
    type: 'expense',
    amount: 85,
    description: 'Printing genealogy updates',
  },
  {
    id: 'fc-u16',
    date: '2025-09-03',
    type: 'contribution',
    amount: 450,
    description: 'Scholarship fund',
  },
  {
    id: 'fc-u17',
    date: '2025-09-18',
    type: 'expense',
    amount: 260,
    description: 'Chapel roof repair',
  },
  {
    id: 'fc-u18',
    date: '2025-10-05',
    type: 'contribution',
    amount: 380,
    description: 'Family fund contribution',
  },
  {
    id: 'fc-u19',
    date: '2025-10-19',
    type: 'expense',
    amount: 140,
    description: 'Cemetery plot maintenance',
  },
  {
    id: 'fc-u20',
    date: '2025-11-08',
    type: 'contribution',
    amount: 520,
    description: 'Ancestral hall restoration',
  },
  {
    id: 'fc-u21',
    date: '2025-11-22',
    type: 'expense',
    amount: 95,
    description: 'Office supplies',
  },
  {
    id: 'fc-u22',
    date: '2025-12-06',
    type: 'contribution',
    amount: 610,
    description: 'Year-end contribution drive',
  },
  {
    id: 'fc-u23',
    date: '2025-12-20',
    type: 'expense',
    amount: 300,
    description: 'Family reunion dinner',
  },
];

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad2 = (v: number): string => String(v).padStart(2, '0');

const bigContribDescriptions = [
  'Đóng góp quỹ họ',
  'Hỗ trợ từ thành nhánh họ',
  'Quỹ xây nhà thờ họ',
  'Đóng góp thiện nguyện',
  'Hỗ trợ học bổng',
];

const bigExpenseDescriptions = [
  'Sửa chữa nhà thờ họ',
  'Lễ giỗ tổ',
  'In sao lục gia phả',
  'Tổ chức liên hoan họ',
  'Hỗ trợ hội viên khó khăn',
  'Chi vận hành',
];

function generateBigChart(): Transaction[] {
  const rand = mulberry32(0x5eed);
  const pick = (items: string[]): string =>
    items[Math.floor(rand() * items.length)];
  const txns: Transaction[] = [];
  const totalMonths = 120;
  const endYear = 2026;
  const endMonth0 = 6; // 0-based, July
  let n = 0;
  for (let back = totalMonths - 1; back >= 0; back--) {
    const monthTotal = endYear * 12 + endMonth0 - back;
    const y = Math.floor(monthTotal / 12);
    const m = monthTotal % 12;
    if (rand() < 0.06) continue;
    const contribCount = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < contribCount; i++) {
      n++;
      txns.push({
        id: `fc-big-${n}`,
        date: `${y}-${pad2(m + 1)}-${pad2(1 + Math.floor(rand() * 28))}`,
        type: 'contribution',
        amount: (1 + Math.floor(rand() * 50)) * 1_000_000,
        description: pick(bigContribDescriptions),
      });
    }
    if (rand() < 0.7) {
      const expenseCount = 1 + Math.floor(rand() * 2);
      for (let i = 0; i < expenseCount; i++) {
        n++;
        txns.push({
          id: `fc-big-${n}`,
          date: `${y}-${pad2(m + 1)}-${pad2(1 + Math.floor(rand() * 28))}`,
          type: 'expense',
          amount: (1 + Math.floor(rand() * 119)) * 500_000,
          description: pick(bigExpenseDescriptions),
        });
      }
    }
  }
  return txns;
}

const chartBig: Transaction[] = generateBigChart();

export function chartTransactions(): Transaction[] {
  if (state.chartScenario === 'empty') return [];
  if (state.chartScenario === 'usd') return chartUsd;
  if (state.chartScenario === 'big') return chartBig;
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
