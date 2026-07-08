import type { Person } from '../types/index.js';

export function getFullName(person: Person): string {
  return `${person.data.firstName} ${person.data.lastName}`.trim();
}

export function isDeceased(person: Person): boolean {
  const y = person.data.deathYear;
  return y != null && y !== '';
}

export function getInitials(person: Person): string {
  return (
    person.data.lastName?.charAt(0) || person.data.firstName?.charAt(0) || '?'
  );
}

export function getGenderSymbol(person: Person): string {
  return person.data.gender === 'M' ? '♂' : '♀';
}
