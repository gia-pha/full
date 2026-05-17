function buildGedcom(data) {
  let gedcom = '0 HEAD\n';
  gedcom += '1 CHAR UTF8\n';
  gedcom += '1 SOUR GIA-PHAI\n';
  gedcom += '1 SUBM @SUBM@\n\n';

  gedcom += '0 @SUBM@ SUBM\n';
  gedcom += '1 NAME System\n\n';

  const persons = data.persons || [];
  const idMap = {};

  persons.forEach((person, idx) => {
    const gedcomId = `@P${idx + 1}@`;
    idMap[person.id] = gedcomId;

    gedcom += `0 ${gedcomId} INDI\n`;
    gedcom += `1 NAME ${person.firstName} /${person.lastName}/\n`;
    gedcom += `1 SEX ${person.gender === 'male' ? 'M' : 'F'}\n`;

    if (person.birthYear) {
      gedcom += `1 BIRT\n`;
      gedcom += `2 DATE ${person.birthYear}\n`;
    }

    if (person.deathYear) {
      gedcom += `1 DEAT\n`;
      gedcom += `2 DATE ${person.deathYear}\n`;
    }

    if (person.notes) {
      gedcom += `1 NOTE ${person.notes}\n`;
    }

    gedcom += '\n';
  });

  const families = new Set();
  persons.forEach((person, idx) => {
    if (person.spouseId && person.parentId) {
      const spouse = persons.find(p => p.id === person.spouseId);
      if (spouse) {
        const familyKey = [person.id, person.spouseId].sort().join('|');
        if (!families.has(familyKey)) {
          families.add(familyKey);
          const familyIdx = families.size;
          const familyId = `@F${familyIdx}@`;
          const p1Idx = persons.findIndex(p => p.id === person.id);
          const p2Idx = persons.findIndex(p => p.id === person.spouseId);

          gedcom += `0 ${familyId} FAMS\n`;
          gedcom += `1 HUSB ${idMap[person.id] || '@UNKNOWN@'}\n`;
          gedcom += `1 WIFE ${idMap[person.spouseId] || '@UNKNOWN@'}\n`;

          const childrenIds = person.childrenIds || [];
          childrenIds.forEach(childId => {
            const childIdx = persons.findIndex(p => p.id === childId);
            if (childIdx >= 0) {
              gedcom += `1 CHIL ${idMap[childId]}\n`;
            }
          });

          gedcom += '\n';

          const p1 = persons[p1Idx];
          const p2 = persons[p2Idx];
          if (p1.parentId) {
            const parentIdx = persons.findIndex(p => p.id === p1.parentId);
            if (parentIdx >= 0) {
              gedcom += `0 ${familyId} FAMC\n`;
              gedcom += `1 FAMS @F999@\n\n`;
            }
          }
        }
      }
    }
  });

  return gedcom;
}

function parseGedcom(text) {
  const lines = text.split('\n').map(l => l.trim());
  const persons = [];
  const families = [];
  let currentRecord = null;
  let currentType = null;

  for (const line of lines) {
    const parts = line.match(/^(\d+)\s+(.+)$/);
    if (!parts) continue;

    const level = parseInt(parts[1]);
    const content = parts[2];

    if (level === 0) {
      if (currentRecord && currentType === 'INDI') {
        persons.push(currentRecord);
      } else if (currentRecord && currentType === 'FAMS') {
        families.push(currentRecord);
      }
      const match = content.match(/^(.+?)\s+(INDI|FAMS|FAMC|SUBM)$/);
      if (match) {
        currentRecord = { id: match[1], name: '', gender: 'male', birthYear: null, deathYear: null, notes: '' };
        currentType = match[2];
        if (match[2] === 'FAMS') currentRecord.children = [];
        if (match[2] === 'FAMC') currentRecord.children = [];
      } else {
        currentRecord = null;
        currentType = null;
      }
    } else if (currentRecord) {
      if (level === 1) {
        if (content.startsWith('NAME ')) {
          const nameMatch = content.match(/NAME\s+(.+?)\s+\/(.+)\/$/);
          if (nameMatch) {
            currentRecord.firstName = nameMatch[1];
            currentRecord.lastName = nameMatch[2];
            currentRecord.name = `${nameMatch[1]} ${nameMatch[2]}`;
          } else {
            currentRecord.name = content.substring(5);
          }
        } else if (content === 'SEX M') {
          currentRecord.gender = 'male';
        } else if (content === 'SEX F') {
          currentRecord.gender = 'female';
        } else if (content === 'BIRT') {
          currentRecord._expectDate = 'birth';
        } else if (content === 'DEAT') {
          currentRecord._expectDate = 'death';
        } else if (content.startsWith('NOTE ')) {
          currentRecord.notes = content.substring(5);
        } else if (content.startsWith('HUSB ')) {
          currentRecord.husbandId = content.substring(5);
        } else if (content.startsWith('WIFE ')) {
          currentRecord.wifeId = content.substring(5);
        } else if (content.startsWith('CHIL ')) {
          if (!currentRecord.children) currentRecord.children = [];
          currentRecord.children.push(content.substring(5));
        }
      } else if (level === 2 && currentRecord._expectDate) {
        if (content.startsWith('DATE ')) {
          const year = parseInt(content.substring(5));
          if (!isNaN(year)) {
            if (currentRecord._expectDate === 'birth') currentRecord.birthYear = year;
            if (currentRecord._expectDate === 'death') currentRecord.deathYear = year;
          }
          currentRecord._expectDate = null;
        }
      }
    }
  }

  if (currentRecord && currentType === 'INDI') {
    persons.push(currentRecord);
  }

  return { persons, families };
}

export { buildGedcom, parseGedcom };
