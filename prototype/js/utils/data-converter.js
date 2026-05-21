import { store } from '../store.js';

function toFamilyChartData(clanId) {
  const data = store.state.data;
  if (!data || !data.persons) return [];

  const currentPersonId = store.state.currentPersonId;

  // Deep clone to prevent f3 library from mutating original data
  const result = JSON.parse(JSON.stringify(data.persons))
    .filter(p => p.data.clanId === clanId)
    .map(p => {
      const { clanId: _, notificationPreferences: __, ...rest } = p.data;
      return {
        id: p.id,
        data: {
          id: p.id,
          ...rest,
          'birth year': p.data.birthday || '',
          photo: p.data.avatar || '',
          isCurrentUser: p.id === currentPersonId
        },
        rels: {
          parents: p.rels.parents || [],
          spouses: p.rels.spouses || [],
          children: p.rels.children || []
        }
      };
    });

  return result;
}

export { toFamilyChartData };
