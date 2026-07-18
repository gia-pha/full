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
  type: 'upcoming' | 'past';
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

export const defaultRoles: Role[] = [
  {
    name: 'admin',
    label: 'Admin',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  {
    name: 'treasurer',
    label: 'Treasurer',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  {
    name: 'editor',
    label: 'Editor',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  {
    name: 'member',
    label: 'Member',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  },
];
