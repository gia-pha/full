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
    gedcom += `1 NAME ${person.data['first name']} /${person.data['last name']}/\n`;
    gedcom += `1 SEX ${person.data.gender === 'M' ? 'M' : 'F'}\n`;

    if (person.data.birthday) {
      gedcom += `1 BIRT\n`;
      gedcom += `2 DATE ${person.data.birthday}\n`;
    }

    if (person.data['death year']) {
      gedcom += `1 DEAT\n`;
      gedcom += `2 DATE ${person.data['death year']}\n`;
    }

    if (person.data.notes) {
      gedcom += `1 NOTE ${person.data.notes}\n`;
    }

    gedcom += '\n';
  });

  const families = new Set();
  const familyMap = {};
  const byId = {};
  persons.forEach(p => byId[p.id] = p);

  persons.forEach((person) => {
    if (person.rels.spouses[0]) {
      const spouse = persons.find(p => p.id === person.rels.spouses[0]);
      if (spouse) {
        const familyKey = [person.id, person.rels.spouses[0]].sort().join('|');
        if (!families.has(familyKey)) {
          families.add(familyKey);
          const familyIdx = families.size;
          const familyId = `@F${familyIdx}@`;
          familyMap[familyKey] = familyId;

          const male = person.data.gender === 'M' ? person : spouse;
          const female = person.data.gender === 'F' ? person : spouse;

          gedcom += `0 ${familyId} FAM\n`;
          gedcom += `1 HUSB ${idMap[male.id] || '@UNKNOWN@'}\n`;
          gedcom += `1 WIFE ${idMap[female.id] || '@UNKNOWN@'}\n`;

          const childrenIds = person.rels.children || [];
          childrenIds.forEach(childId => {
            if (idMap[childId]) {
              gedcom += `1 CHIL ${idMap[childId]}\n`;
            }
          });

          gedcom += '\n';
        }
      }
    }
  });

  persons.forEach((person) => {
    if (person.rels.parents && person.rels.parents.length > 0) {
      const parentIds = person.rels.parents.map(pid => byId[pid]?.id).filter(Boolean);
      if (parentIds.length >= 2) {
        const familyKey = [...parentIds].sort().join('|');
        const familyId = familyMap[familyKey];
        if (familyId) {
          gedcom += `0 ${idMap[person.id]} FAMC\n`;
          gedcom += `1 FAMC ${familyId}\n\n`;
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
  const idMap = {};
  let personCounter = 0;

  for (const line of lines) {
    const parts = line.match(/^(\d+)\s+(.+)$/);
    if (!parts) continue;

    const level = parseInt(parts[1]);
    const content = parts[2];

    if (level === 0) {
      if (currentRecord && currentType === 'INDI') {
        const newId = `imported-person-${personCounter++}`;
        idMap[currentRecord.id] = newId;
        persons.push({
          id: newId,
          data: {
            'first name': currentRecord.firstName || '',
            'last name': currentRecord.lastName || '',
            gender: currentRecord.gender === 'male' ? 'M' : 'F',
            birthday: currentRecord.birthYear ? String(currentRecord.birthYear) : '',
            'death year': currentRecord.deathYear ? String(currentRecord.deathYear) : '',
            generation: 0,
            role: 'member',
            notes: currentRecord.notes || '',
            avatar: '',
            clanId: ''
          },
          rels: {
            spouses: currentRecord.spouses || [],
            children: currentRecord.children || [],
            parents: currentRecord.parents || []
          }
        });
      } else if (currentRecord && (currentType === 'FAMS' || currentType === 'FAM')) {
        families.push(currentRecord);
      }
      const match = content.match(/^(.+?)\s+(INDI|FAMS|FAM|FAMC|SUBM)$/);
      if (match) {
        currentRecord = {
          id: match[1],
          firstName: '',
          lastName: '',
          gender: 'male',
          birthYear: null,
          deathYear: null,
          notes: '',
          spouses: [],
          children: [],
          parents: []
        };
        currentType = match[2];
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
          } else {
            currentRecord.lastName = content.substring(5);
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
          currentRecord.children.push(content.substring(5));
        } else if (content.startsWith('FAMC ')) {
          currentRecord._familyC = content.substring(5);
        } else if (content.startsWith('FAMS ')) {
          currentRecord._familyS = content.substring(5);
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
    const newId = `imported-person-${personCounter++}`;
    idMap[currentRecord.id] = newId;
    persons.push({
      id: newId,
      data: {
        'first name': currentRecord.firstName || '',
        'last name': currentRecord.lastName || '',
        gender: currentRecord.gender === 'male' ? 'M' : 'F',
        birthday: currentRecord.birthYear ? String(currentRecord.birthYear) : '',
        'death year': currentRecord.deathYear ? String(currentRecord.deathYear) : '',
        generation: 0,
        role: 'member',
        notes: currentRecord.notes || '',
        avatar: '',
        clanId: ''
      },
      rels: {
        spouses: currentRecord.spouses || [],
        children: currentRecord.children || [],
        parents: currentRecord.parents || []
      }
    });
  }

  // Resolve family relationships
  const familyMap = {};
  families.forEach(fam => {
    familyMap[fam.id] = fam;
    if (fam.husbandId) {
      const husbPerson = persons.find(p => p.id === idMap[fam.husbandId]);
      const wifePerson = fam.wifeId ? persons.find(p => p.id === idMap[fam.wifeId]) : null;
      if (husbPerson) {
        if (wifePerson && !husbPerson.rels.spouses.includes(wifePerson.id)) {
          husbPerson.rels.spouses.push(wifePerson.id);
        }
        fam.children?.forEach(childGedcomId => {
          const childPerson = persons.find(p => p.id === idMap[childGedcomId]);
          if (childPerson && !husbPerson.rels.children.includes(childPerson.id)) {
            husbPerson.rels.children.push(childPerson.id);
          }
        });
      }
      if (wifePerson) {
        if (!wifePerson.rels.spouses.includes(husbPerson.id)) {
          wifePerson.rels.spouses.push(husbPerson.id);
        }
        fam.children?.forEach(childGedcomId => {
          const childPerson = persons.find(p => p.id === idMap[childGedcomId]);
          if (childPerson && !wifePerson.rels.children.includes(childPerson.id)) {
            wifePerson.rels.children.push(childPerson.id);
          }
        });
      }
    }
  });

  // Link children to parents via FAMC
  persons.forEach(p => {
    const gedcomRecord = families.find(f => f._familyC === p._familyC || false);
  });

  return { persons, families };
}

export { buildGedcom, parseGedcom };
