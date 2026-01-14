import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FamilyMember, Relationship } from './types';

const KEYS = {
  FAMILY_MEMBERS: '@kunbaa/family_members',
  RELATIONSHIPS: '@kunbaa/relationships',
};

// Relationship types with their inverse
const RELATIONSHIP_INVERSES: Record<string, string> = {
  parent: 'child',
  child: 'parent',
  spouse: 'spouse',
  sibling: 'sibling',
};

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get all family members
export async function getAllMembers(): Promise<FamilyMember[]> {
  try {
    const value = await AsyncStorage.getItem(KEYS.FAMILY_MEMBERS);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error reading members:', error);
    return [];
  }
}

// Get all relationships
export async function getAllRelationships(): Promise<Relationship[]> {
  try {
    const value = await AsyncStorage.getItem(KEYS.RELATIONSHIPS);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error reading relationships:', error);
    return [];
  }
}

// Save all members
async function saveAllMembers(members: FamilyMember[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.FAMILY_MEMBERS, JSON.stringify(members));
}

// Save all relationships
async function saveAllRelationships(relationships: Relationship[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.RELATIONSHIPS, JSON.stringify(relationships));
}

// Add a new family member
export async function addMember(member: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyMember> {
  const members = await getAllMembers();
  const now = new Date().toISOString();
  
  const newMember: FamilyMember = {
    ...member,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  
  members.push(newMember);
  await saveAllMembers(members);
  
  return newMember;
}

// Update a family member
export async function updateMember(id: string, updates: Partial<FamilyMember>): Promise<FamilyMember | null> {
  const members = await getAllMembers();
  const index = members.findIndex(m => m.id === id);
  
  if (index === -1) return null;
  
  members[index] = {
    ...members[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  await saveAllMembers(members);
  return members[index];
}

// Delete a family member and their relationships
export async function deleteMember(id: string): Promise<void> {
  const members = await getAllMembers();
  const relationships = await getAllRelationships();
  
  const filteredMembers = members.filter(m => m.id !== id);
  const filteredRelationships = relationships.filter(
    r => r.memberId !== id && r.relatedMemberId !== id
  );
  
  await saveAllMembers(filteredMembers);
  await saveAllRelationships(filteredRelationships);
}

// Get member by ID
export async function getMemberById(id: string): Promise<FamilyMember | null> {
  const members = await getAllMembers();
  return members.find(m => m.id === id) || null;
}

/**
 * Add a bidirectional relationship between two members
 * When you add A as B's parent, B is automatically added as A's child
 */
export async function addRelationship(
  memberId: string,
  relatedMemberId: string,
  relationshipType: 'parent' | 'child' | 'spouse' | 'sibling'
): Promise<void> {
  const relationships = await getAllRelationships();
  const now = new Date().toISOString();
  
  // Check if relationship already exists
  const exists = relationships.some(
    r => (r.memberId === memberId && r.relatedMemberId === relatedMemberId && r.relationshipType === relationshipType) ||
         (r.memberId === relatedMemberId && r.relatedMemberId === memberId && r.relationshipType === RELATIONSHIP_INVERSES[relationshipType])
  );
  
  if (exists) return;
  
  // Add the primary relationship
  relationships.push({
    id: generateId(),
    memberId,
    relatedMemberId,
    relationshipType,
    createdAt: now,
  });
  
  // Add the inverse relationship (bidirectional)
  const inverseType = RELATIONSHIP_INVERSES[relationshipType] as 'parent' | 'child' | 'spouse' | 'sibling';
  relationships.push({
    id: generateId(),
    memberId: relatedMemberId,
    relatedMemberId: memberId,
    relationshipType: inverseType,
    createdAt: now,
  });
  
  await saveAllRelationships(relationships);
  
  // Update generation numbers based on relationships
  await updateGenerations();
}

/**
 * Remove a relationship (removes both directions)
 */
export async function removeRelationship(memberId: string, relatedMemberId: string): Promise<void> {
  const relationships = await getAllRelationships();
  
  const filtered = relationships.filter(
    r => !((r.memberId === memberId && r.relatedMemberId === relatedMemberId) ||
           (r.memberId === relatedMemberId && r.relatedMemberId === memberId))
  );
  
  await saveAllRelationships(filtered);
}

/**
 * Get all relationships for a specific member
 */
export async function getMemberRelationships(memberId: string): Promise<{
  parents: FamilyMember[];
  children: FamilyMember[];
  spouses: FamilyMember[];
  siblings: FamilyMember[];
}> {
  const relationships = await getAllRelationships();
  const members = await getAllMembers();
  
  const memberRelations = relationships.filter(r => r.memberId === memberId);
  
  const getMembers = (type: string) => {
    const relatedIds = memberRelations
      .filter(r => r.relationshipType === type)
      .map(r => r.relatedMemberId);
    return members.filter(m => relatedIds.includes(m.id));
  };
  
  return {
    parents: getMembers('parent'),
    children: getMembers('child'),
    spouses: getMembers('spouse'),
    siblings: getMembers('sibling'),
  };
}

/**
 * Add a parent to a member
 * Auto-links the new parent as parent to all existing siblings
 */
export async function addParent(
  childId: string,
  parentData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FamilyMember> {
  // Create the new parent
  const parent = await addMember(parentData);
  
  // Link parent to child
  await addRelationship(childId, parent.id, 'parent');
  
  // Get child's siblings and link them to the same parent
  const { siblings } = await getMemberRelationships(childId);
  for (const sibling of siblings) {
    await addRelationship(sibling.id, parent.id, 'parent');
  }
  
  return parent;
}

/**
 * Add a spouse to a member
 * Auto-links spouse bidirectionally
 */
export async function addSpouse(
  memberId: string,
  spouseData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FamilyMember> {
  const spouse = await addMember({
    ...spouseData,
    isBornIntoFamily: false, // Spouse married into family
  });
  
  await addRelationship(memberId, spouse.id, 'spouse');
  
  return spouse;
}

/**
 * Add a sibling to a member
 * If shareParents is true, links the sibling to the same parents
 */
export async function addSibling(
  memberId: string,
  siblingData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>,
  shareParents: boolean = true
): Promise<FamilyMember> {
  const sibling = await addMember(siblingData);
  
  // Link as siblings
  await addRelationship(memberId, sibling.id, 'sibling');
  
  // If sharing parents, link sibling to the same parents
  if (shareParents) {
    const { parents } = await getMemberRelationships(memberId);
    for (const parent of parents) {
      await addRelationship(sibling.id, parent.id, 'parent');
    }
  }
  
  return sibling;
}

/**
 * Add a child to a member
 * If member has a spouse, auto-links child to spouse as well
 */
export async function addChild(
  parentId: string,
  childData: Omit<FamilyMember, 'id' | 'createdAt' | 'updatedAt'>
): Promise<FamilyMember> {
  const child = await addMember(childData);
  
  // Link child to parent
  await addRelationship(child.id, parentId, 'parent');
  
  // Get parent's spouse and link child to them too
  const { spouses } = await getMemberRelationships(parentId);
  for (const spouse of spouses) {
    await addRelationship(child.id, spouse.id, 'parent');
  }
  
  return child;
}

/**
 * Update generation numbers based on relationships
 * Parents are always one generation above their children
 */
async function updateGenerations(): Promise<void> {
  const members = await getAllMembers();
  const relationships = await getAllRelationships();
  
  if (members.length === 0) return;
  
  // Build a graph of parent-child relationships
  const childToParents: Record<string, string[]> = {};
  const parentToChildren: Record<string, string[]> = {};
  
  for (const rel of relationships) {
    if (rel.relationshipType === 'parent') {
      if (!childToParents[rel.memberId]) childToParents[rel.memberId] = [];
      childToParents[rel.memberId].push(rel.relatedMemberId);
    }
    if (rel.relationshipType === 'child') {
      if (!parentToChildren[rel.memberId]) parentToChildren[rel.memberId] = [];
      parentToChildren[rel.memberId].push(rel.relatedMemberId);
    }
  }
  
  // Find root members (those with no parents)
  const roots = members.filter(m => !childToParents[m.id] || childToParents[m.id].length === 0);
  
  // BFS to assign generations
  const generations: Record<string, number> = {};
  const visited = new Set<string>();
  const queue: { id: string; gen: number }[] = roots.map(r => ({ id: r.id, gen: 1 }));
  
  while (queue.length > 0) {
    const { id, gen } = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    
    generations[id] = gen;
    
    // Process children (next generation)
    const children = parentToChildren[id] || [];
    for (const childId of children) {
      if (!visited.has(childId)) {
        queue.push({ id: childId, gen: gen + 1 });
      }
    }
  }
  
  // Update member generations
  for (const member of members) {
    if (generations[member.id] !== undefined) {
      member.generation = generations[member.id];
    }
  }
  
  await saveAllMembers(members);
}

/**
 * Get family tree rooted at a specific member (Ego View)
 * Returns members organized by their relationship to the focus person
 */
export async function getRootedTree(focusId: string): Promise<{
  focus: FamilyMember | null;
  parents: FamilyMember[];
  grandparents: FamilyMember[];
  spouses: FamilyMember[];
  children: FamilyMember[];
  siblings: FamilyMember[];
  auntsUncles: FamilyMember[];
  cousins: FamilyMember[];
}> {
  const focus = await getMemberById(focusId);
  if (!focus) {
    return {
      focus: null,
      parents: [],
      grandparents: [],
      spouses: [],
      children: [],
      siblings: [],
      auntsUncles: [],
      cousins: [],
    };
  }
  
  const { parents, children, spouses, siblings } = await getMemberRelationships(focusId);
  
  // Get grandparents (parents of parents)
  const grandparents: FamilyMember[] = [];
  for (const parent of parents) {
    const parentRels = await getMemberRelationships(parent.id);
    grandparents.push(...parentRels.parents);
  }
  
  // Get aunts/uncles (siblings of parents)
  const auntsUncles: FamilyMember[] = [];
  for (const parent of parents) {
    const parentRels = await getMemberRelationships(parent.id);
    auntsUncles.push(...parentRels.siblings);
  }
  
  // Get cousins (children of aunts/uncles)
  const cousins: FamilyMember[] = [];
  for (const auntUncle of auntsUncles) {
    const auntUncleRels = await getMemberRelationships(auntUncle.id);
    cousins.push(...auntUncleRels.children);
  }
  
  return {
    focus,
    parents,
    grandparents: [...new Map(grandparents.map(m => [m.id, m])).values()],
    spouses,
    children,
    siblings,
    auntsUncles: [...new Map(auntsUncles.map(m => [m.id, m])).values()],
    cousins: [...new Map(cousins.map(m => [m.id, m])).values()],
  };
}

/**
 * Search for a family member by name
 */
export async function searchMembers(query: string): Promise<FamilyMember[]> {
  const members = await getAllMembers();
  const lowerQuery = query.toLowerCase();
  
  return members.filter(m => 
    m.firstName.toLowerCase().includes(lowerQuery) ||
    (m.lastName && m.lastName.toLowerCase().includes(lowerQuery)) ||
    (m.nickname && m.nickname.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get relationship path between two members
 */
export async function getRelationshipPath(fromId: string, toId: string): Promise<string | null> {
  const tree = await getRootedTree(fromId);
  
  // Check direct relationships
  if (tree.parents.some(p => p.id === toId)) return 'Parent';
  if (tree.children.some(c => c.id === toId)) return 'Child';
  if (tree.spouses.some(s => s.id === toId)) return 'Spouse';
  if (tree.siblings.some(s => s.id === toId)) return 'Sibling';
  if (tree.grandparents.some(g => g.id === toId)) return 'Grandparent';
  if (tree.auntsUncles.some(a => a.id === toId)) return 'Aunt/Uncle';
  if (tree.cousins.some(c => c.id === toId)) return 'Cousin';
  
  return null;
}

/**
 * Initialize with sample data if empty
 */
export async function initializeSampleFamilyTree(): Promise<void> {
  const members = await getAllMembers();
  if (members.length > 0) return;
  
  // Create a sample family tree
  const now = new Date().toISOString();
  
  // Grandparents (Generation 1)
  const grandfather: FamilyMember = {
    id: 'gf1',
    firstName: 'Ramesh',
    lastName: 'Kumar',
    gender: 'male',
    dateOfBirth: '1945-03-15',
    generation: 1,
    isBornIntoFamily: true,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  const grandmother: FamilyMember = {
    id: 'gm1',
    firstName: 'Kamla',
    lastName: 'Kumar',
    gender: 'female',
    dateOfBirth: '1948-07-22',
    generation: 1,
    isBornIntoFamily: false,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  // Parents (Generation 2)
  const father: FamilyMember = {
    id: 'f1',
    firstName: 'Suresh',
    lastName: 'Kumar',
    gender: 'male',
    dateOfBirth: '1970-05-10',
    generation: 2,
    isBornIntoFamily: true,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  const mother: FamilyMember = {
    id: 'm1',
    firstName: 'Priya',
    lastName: 'Kumar',
    gender: 'female',
    dateOfBirth: '1972-09-18',
    generation: 2,
    isBornIntoFamily: false,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  const uncle: FamilyMember = {
    id: 'u1',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    gender: 'male',
    dateOfBirth: '1968-02-25',
    generation: 2,
    isBornIntoFamily: true,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  // Self (Generation 3)
  const self: FamilyMember = {
    id: 'self',
    firstName: 'Amit',
    lastName: 'Kumar',
    gender: 'male',
    dateOfBirth: '1995-11-08',
    generation: 3,
    isBornIntoFamily: true,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  const sibling: FamilyMember = {
    id: 's1',
    firstName: 'Neha',
    lastName: 'Kumar',
    gender: 'female',
    dateOfBirth: '1998-04-12',
    generation: 3,
    isBornIntoFamily: true,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  const cousin: FamilyMember = {
    id: 'c1',
    firstName: 'Rahul',
    lastName: 'Kumar',
    gender: 'male',
    dateOfBirth: '1996-08-30',
    generation: 3,
    isBornIntoFamily: true,
    isAlive: true,
    createdAt: now,
    updatedAt: now,
  };
  
  // Save all members
  await saveAllMembers([grandfather, grandmother, father, mother, uncle, self, sibling, cousin]);
  
  // Create relationships
  const relationships: Relationship[] = [
    // Grandparents are spouses
    { id: 'r1', memberId: 'gf1', relatedMemberId: 'gm1', relationshipType: 'spouse', createdAt: now },
    { id: 'r2', memberId: 'gm1', relatedMemberId: 'gf1', relationshipType: 'spouse', createdAt: now },
    
    // Father and Uncle are children of grandparents
    { id: 'r3', memberId: 'f1', relatedMemberId: 'gf1', relationshipType: 'parent', createdAt: now },
    { id: 'r4', memberId: 'f1', relatedMemberId: 'gm1', relationshipType: 'parent', createdAt: now },
    { id: 'r5', memberId: 'gf1', relatedMemberId: 'f1', relationshipType: 'child', createdAt: now },
    { id: 'r6', memberId: 'gm1', relatedMemberId: 'f1', relationshipType: 'child', createdAt: now },
    
    { id: 'r7', memberId: 'u1', relatedMemberId: 'gf1', relationshipType: 'parent', createdAt: now },
    { id: 'r8', memberId: 'u1', relatedMemberId: 'gm1', relationshipType: 'parent', createdAt: now },
    { id: 'r9', memberId: 'gf1', relatedMemberId: 'u1', relationshipType: 'child', createdAt: now },
    { id: 'r10', memberId: 'gm1', relatedMemberId: 'u1', relationshipType: 'child', createdAt: now },
    
    // Father and Uncle are siblings
    { id: 'r11', memberId: 'f1', relatedMemberId: 'u1', relationshipType: 'sibling', createdAt: now },
    { id: 'r12', memberId: 'u1', relatedMemberId: 'f1', relationshipType: 'sibling', createdAt: now },
    
    // Father and Mother are spouses
    { id: 'r13', memberId: 'f1', relatedMemberId: 'm1', relationshipType: 'spouse', createdAt: now },
    { id: 'r14', memberId: 'm1', relatedMemberId: 'f1', relationshipType: 'spouse', createdAt: now },
    
    // Self and Sibling are children of Father and Mother
    { id: 'r15', memberId: 'self', relatedMemberId: 'f1', relationshipType: 'parent', createdAt: now },
    { id: 'r16', memberId: 'self', relatedMemberId: 'm1', relationshipType: 'parent', createdAt: now },
    { id: 'r17', memberId: 'f1', relatedMemberId: 'self', relationshipType: 'child', createdAt: now },
    { id: 'r18', memberId: 'm1', relatedMemberId: 'self', relationshipType: 'child', createdAt: now },
    
    { id: 'r19', memberId: 's1', relatedMemberId: 'f1', relationshipType: 'parent', createdAt: now },
    { id: 'r20', memberId: 's1', relatedMemberId: 'm1', relationshipType: 'parent', createdAt: now },
    { id: 'r21', memberId: 'f1', relatedMemberId: 's1', relationshipType: 'child', createdAt: now },
    { id: 'r22', memberId: 'm1', relatedMemberId: 's1', relationshipType: 'child', createdAt: now },
    
    // Self and Sibling are siblings
    { id: 'r23', memberId: 'self', relatedMemberId: 's1', relationshipType: 'sibling', createdAt: now },
    { id: 'r24', memberId: 's1', relatedMemberId: 'self', relationshipType: 'sibling', createdAt: now },
    
    // Cousin is child of Uncle
    { id: 'r25', memberId: 'c1', relatedMemberId: 'u1', relationshipType: 'parent', createdAt: now },
    { id: 'r26', memberId: 'u1', relatedMemberId: 'c1', relationshipType: 'child', createdAt: now },
  ];
  
  await saveAllRelationships(relationships);
}

/**
 * Clear all data (for testing)
 */
export async function clearAllFamilyData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.FAMILY_MEMBERS, KEYS.RELATIONSHIPS]);
}
