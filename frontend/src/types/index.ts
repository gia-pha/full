export interface Person {
  id: string;
  data: {
    firstName: string;
    lastName: string;
    gender: 'M' | 'F';
    birthYear?: string;
    deathYear?: string;
    generation: number;
    role?: string;
    avatar?: string;
    [key: string]: string | number | undefined;
  };
  rels: {
    parents: string[];
    spouses: string[];
    children: string[];
  };
}

export interface Clan {
  id: string;
  name: string;
  origin: string;
  history: string;
  notableFigures: string[];
  images: string[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  lunarDate?: string;
  location: string;
  description: string;
  status: 'upcoming' | 'past';
  type?: string;
  mapUrl?: string;
  images?: string[];
  attendees?: string[];
}

export interface FundTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  personId?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'contribution' | 'expense';
  amount: number;
  description: string;
  personId?: string;
  eventId?: string;
}

export interface AppData {
  clans: Clan[];
  persons: Person[];
  events: Event[];
  funds: FundTransaction[];
}

import type { SVGTemplateResult } from 'lit';

export interface MemberAction {
  label: string;
  icon: SVGTemplateResult;
  color?: string;
  onClick: () => void;
}

export interface Role {
  name: string;
  label: string;
  color: string;
}

export interface NotificationType {
  name: string;
  icon: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  date: string;
  read?: boolean;
}
