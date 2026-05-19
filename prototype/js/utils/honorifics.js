function calculateRelationship(personA, personB, allPersons) {
  if (!personA || !personB) return null;
  if (personA.id === personB.id) return { type: 'self', distance: 0 };

  const byId = {};
  allPersons.forEach(p => byId[p.id] = p);

  function findPath(startId, targetId, visited = new Set()) {
    if (startId === targetId) return [];
    visited.add(startId);
    const start = byId[startId];
    if (!start) return null;

    const neighbors = [];
    if (start.spouseId && !visited.has(start.spouseId)) neighbors.push({ id: start.spouseId, rel: 'spouse' });
    if (start.parentId && !visited.has(start.parentId)) neighbors.push({ id: start.parentId, rel: 'parent' });
    (start.childrenIds || []).forEach(cid => {
      if (!visited.has(cid)) neighbors.push({ id: cid, rel: 'child' });
    });

    for (const neighbor of neighbors) {
      const path = findPath(neighbor.id, targetId, new Set(visited));
      if (path !== null) {
        return [{ from: startId, to: neighbor.id, relation: neighbor.rel }, ...path];
      }
    }
    return null;
  }

  const path = findPath(personA.id, personB.id);
  if (!path || path.length > 6) return { type: 'distant', distance: path?.length || 99 };

  let current = personA;
  let genDiff = 0;
  let viaSpouse = false;
  let viaPaternal = true;

  for (const step of path) {
    if (step.relation === 'parent') {
      genDiff++;
      const parent = byId[step.to];
      const siblingOfSpouse = current.spouseId && byId[current.spouseId]?.parentId === parent.id;
      if (siblingOfSpouse) viaPaternal = false;
    } else if (step.relation === 'child') {
      genDiff--;
    } else if (step.relation === 'spouse') {
      viaSpouse = true;
    }
    current = byId[step.to];
  }

  return { type: 'related', distance: path.length, genDiff, viaSpouse, viaPaternal, path };
}

function getVietnameseHonorific(relationship, currentPerson, targetPerson, t) {
  const h = t?.honorifics || {};
  if (!relationship || relationship.type === 'self') return '';
  if (relationship.type === 'distant') return '';

  const { genDiff, viaSpouse, viaPaternal, path } = relationship;
  const isMale = targetPerson.gender === 'male';
  const currentUserMale = currentPerson.gender === 'male';

  if (targetPerson.id === currentPerson.spouseId) {
    return currentUserMale ? h.wife : h.husband;
  }

  if (currentPerson.parentId === targetPerson.id) {
    return targetPerson.gender === 'male' ? h.father : h.mother;
  }

  if (genDiff > 0) {
    if (genDiff === 2) {
      if (isMale) return viaPaternal ? h.grandfather : h.grandfatherMaternal;
      return viaPaternal ? h.grandmother : h.grandmotherMaternal;
    }
    if (genDiff === 1) {
      if (isMale) {
        return viaPaternal ? h.uncle : h.uncleMaternal;
      } else {
        return viaPaternal ? h.aunt : h.auntMaternal;
      }
    }
    if (genDiff === 3) {
      if (isMale) return viaPaternal ? h.greatGrandfather : h.greatGrandfatherMaternal;
      return viaPaternal ? h.greatGrandmother : h.greatGrandmotherMaternal;
    }
    if (genDiff >= 4) {
      if (isMale) return viaPaternal ? h.greatGreatGrandfather : h.greatGreatGrandfatherMaternal;
      return viaPaternal ? h.greatGreatGrandmother : h.greatGreatGrandmotherMaternal;
    }
  }

  if (genDiff === 0) {
    if (viaSpouse) {
      if (isMale) return targetPerson.birthYear < currentPerson.birthYear ? h.brotherInLawOlder : h.brotherInLawYounger;
      return targetPerson.birthYear < currentPerson.birthYear ? h.sisterInLawOlder : h.sisterInLawYounger;
    }
    const siblingOrder = getSiblingOrder(currentPerson, targetPerson);
    if (isMale) {
      if (siblingOrder === 'older') return h.brotherOlder;
      return h.brotherYounger;
    } else {
      if (siblingOrder === 'older') return h.sisterOlder;
      return h.sisterYounger;
    }
  }

  if (genDiff < 0) {
    const absGen = Math.abs(genDiff);
    if (absGen === 1) {
      return isMale ? h.son : h.daughter;
    }
    if (absGen === 2) {
      return viaPaternal
        ? (isMale ? h.grandson : h.granddaughter)
        : (isMale ? h.grandsonMaternal : h.granddaughterMaternal);
    }
    if (absGen === 3) {
      return viaPaternal
        ? (isMale ? h.greatGrandson : h.greatGranddaughter)
        : (isMale ? h.greatGrandsonMaternal : h.greatGranddaughterMaternal);
    }
    if (absGen >= 4) {
      return viaPaternal
        ? (isMale ? h.greatGreatGrandson : h.greatGreatGranddaughter)
        : (isMale ? h.greatGreatGrandsonMaternal : h.greatGreatGranddaughterMaternal);
    }
  }

  return '';
}

function getSiblingOrder(personA, personB, allPersons) {
  if (!personA.parentId || personA.parentId !== personB.parentId) return '';
  return personA.birthYear > personB.birthYear ? 'younger' : 'older';
}

function getRelationshipLabel(relationship, t) {
  if (!relationship) return '';
  if (relationship.type === 'self') return t.tree.currentPerson;
  if (relationship.type === 'distant') return t.member.limitedAccess || 'Xa';
  const labels = {
    spouse: 'Vo/Chong',
    parent: 'Cha/Me',
    child: 'Con',
    grandparent: 'O/Ba',
    grandchild: 'Chau'
  };
  return labels[relationship.type] || 'Nguoi nha';
}

export { calculateRelationship, getVietnameseHonorific, getSiblingOrder, getRelationshipLabel };
