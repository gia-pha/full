import { store } from '../store.js';

function toFamilyChartData(clanId) {
  const data = store.state.data;
  if (!data) return [];

  const clanPersons = data.persons.filter(p => p.clanId === clanId);
  const byId = {};
  clanPersons.forEach(p => byId[p.id] = p);

  return clanPersons.map(person => {
    const parents = [];
    if (person.parentId && byId[person.parentId]) {
      parents.push(person.parentId);
    }

    const spouse = person.spouseId && byId[person.spouseId] ? [person.spouseId] : [];
    const children = (person.childrenIds || []).filter(cid => byId[cid]);

    return {
      id: person.id,
      data: {
        gender: person.gender === 'male' ? 'M' : 'F',
        'first name': person.firstName,
        'last name': person.lastName,
        'birth year': person.birthYear || '',
        'death year': person.deathYear || '',
        generation: person.generation,
        notes: person.notes || '',
        role: person.role || 'member',
        avatar: person.photo || '',
        isCurrentUser: person.id === store.state.currentPersonId
      },
      rels: {
        parents,
        spouses: spouse,
        children
      }
    };
  });
}

export { toFamilyChartData };
