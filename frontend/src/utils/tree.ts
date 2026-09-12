import type { Person } from '../types/index.js';

export interface FamilyChartDatum {
  id: string;
  data: {
    gender: 'M' | 'F';
    [key: string]: unknown;
  };
  rels: {
    parents: string[];
    spouses: string[];
    children: string[];
  };
}

export function toFamilyChartData(
  persons: Person[],
  clanId?: string,
  currentPersonId?: string,
): FamilyChartDatum[] {
  return persons
    .filter((p) => !clanId || p.data.clanId === clanId)
    .map((p) => {
      const rest: Record<string, unknown> = { ...p.data };
      delete rest.clanId;
      delete rest.notificationPreferences;
      return {
        id: p.id,
        data: {
          ...rest,
          id: p.id,
          avatar: (rest.avatar as string | undefined) ?? '',
          isCurrentUser: p.id === currentPersonId,
        } as unknown as FamilyChartDatum['data'],
        rels: {
          parents: [...p.rels.parents],
          spouses: [...p.rels.spouses],
          children: [...p.rels.children],
        },
      };
    });
}
