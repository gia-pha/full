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
