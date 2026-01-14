import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      return Promise.resolve();
    }),
  },
}));

// Import after mocking
import {
  addMember,
  addParent,
  addSpouse,
  addSibling,
  addChild,
  getAllMembers,
  getMemberRelationships,
  getRootedTree,
  searchMembers,
} from '../lib/family-tree';

// Helper to create member data with required fields
const createMemberData = (overrides: Record<string, unknown>) => ({
  firstName: 'Test',
  gender: 'male' as const,
  generation: 0,
  isBornIntoFamily: true,
  isAlive: true,
  ...overrides,
});

describe('Family Tree - Core Operations', () => {
  beforeEach(async () => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('addMember', () => {
    it('should add a new member with required fields', async () => {
      const memberData = createMemberData({
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
      });

      const member = await addMember(memberData);

      expect(member).toBeDefined();
      expect(member.id).toBeDefined();
      expect(member.firstName).toBe('John');
      expect(member.lastName).toBe('Doe');
      expect(member.gender).toBe('male');
    });

    it('should generate unique IDs for each member', async () => {
      const member1 = await addMember(createMemberData({ firstName: 'John' }));
      const member2 = await addMember(createMemberData({ firstName: 'Jane', gender: 'female' }));

      expect(member1.id).not.toBe(member2.id);
    });
  });

  describe('Bidirectional Relationships', () => {
    it('should create bidirectional parent-child relationship', async () => {
      const child = await addMember(createMemberData({
        firstName: 'Child',
        gender: 'male',
        generation: 0,
      }));

      const parent = await addParent(child.id, createMemberData({
        firstName: 'Parent',
        gender: 'female',
        generation: -1,
      }));

      const parentRelations = await getMemberRelationships(parent.id);
      expect(parentRelations.children.some(c => c.id === child.id)).toBe(true);

      const childRelations = await getMemberRelationships(child.id);
      expect(childRelations.parents.some(p => p.id === parent.id)).toBe(true);
    });

    it('should create bidirectional spouse relationship', async () => {
      const person1 = await addMember(createMemberData({
        firstName: 'Person1',
        gender: 'male',
      }));

      const spouse = await addSpouse(person1.id, createMemberData({
        firstName: 'Spouse',
        gender: 'female',
        isBornIntoFamily: false,
      }));

      const person1Relations = await getMemberRelationships(person1.id);
      const spouseRelations = await getMemberRelationships(spouse.id);

      expect(person1Relations.spouses.some(s => s.id === spouse.id)).toBe(true);
      expect(spouseRelations.spouses.some(s => s.id === person1.id)).toBe(true);
    });
  });

  describe('searchMembers', () => {
    it('should find members by first name', async () => {
      await addMember(createMemberData({ firstName: 'John', lastName: 'Doe' }));
      await addMember(createMemberData({ firstName: 'Jane', lastName: 'Doe', gender: 'female' }));

      const results = await searchMembers('John');
      expect(results.length).toBe(1);
      expect(results[0].firstName).toBe('John');
    });

    it('should be case-insensitive', async () => {
      await addMember(createMemberData({ firstName: 'John', lastName: 'Doe' }));

      const results = await searchMembers('john');
      expect(results.length).toBe(1);
    });
  });

  describe('getAllMembers', () => {
    it('should return all members', async () => {
      await addMember(createMemberData({ firstName: 'Member1' }));
      await addMember(createMemberData({ firstName: 'Member2', gender: 'female' }));
      await addMember(createMemberData({ firstName: 'Member3' }));

      const members = await getAllMembers();
      expect(members.length).toBeGreaterThanOrEqual(3);
    });
  });
});
