import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

describe("Family Tree Data Model", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  it("should create a new family member with correct structure", async () => {
    const { addMember, getAllMembers } = await import("../lib/family-tree");
    
    const memberData = {
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male" as const,
      dateOfBirth: "1970-05-15",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    };
    
    const newMember = await addMember(memberData);
    
    expect(newMember).toHaveProperty("id");
    expect(newMember.firstName).toBe("Rajesh");
    expect(newMember.lastName).toBe("Kumar");
    expect(newMember.gender).toBe("male");
    expect(newMember.generation).toBe(2);
  });

  it("should establish bidirectional parent-child relationship", async () => {
    const { addMember, addParent, getMemberRelationships } = await import("../lib/family-tree");
    
    // Create child first
    const child = await addMember({
      firstName: "Priya",
      lastName: "Kumar",
      gender: "female",
      generation: 3,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Add parent
    const parent = await addParent(child.id, {
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Check child's relationships
    const childRelations = await getMemberRelationships(child.id);
    expect(childRelations.parents).toContainEqual(expect.objectContaining({ firstName: "Rajesh" }));
    
    // Check parent's relationships
    const parentRelations = await getMemberRelationships(parent.id);
    expect(parentRelations.children).toContainEqual(expect.objectContaining({ firstName: "Priya" }));
  });

  it("should establish bidirectional spouse relationship", async () => {
    const { addMember, addSpouse, getMemberRelationships } = await import("../lib/family-tree");
    
    // Create first spouse
    const spouse1 = await addMember({
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Add second spouse
    const spouse2 = await addSpouse(spouse1.id, {
      firstName: "Sunita",
      lastName: "Kumar",
      gender: "female",
      generation: 2,
      isBornIntoFamily: false,
      isAlive: true,
    });
    
    // Check spouse1's relationships
    const spouse1Relations = await getMemberRelationships(spouse1.id);
    expect(spouse1Relations.spouses).toContainEqual(expect.objectContaining({ firstName: "Sunita" }));
    
    // Check spouse2's relationships
    const spouse2Relations = await getMemberRelationships(spouse2.id);
    expect(spouse2Relations.spouses).toContainEqual(expect.objectContaining({ firstName: "Rajesh" }));
  });

  it("should share parents when adding sibling with shareParents=true", async () => {
    const { addMember, addParent, addSibling, getMemberRelationships } = await import("../lib/family-tree");
    
    // Create first child
    const child1 = await addMember({
      firstName: "Priya",
      lastName: "Kumar",
      gender: "female",
      generation: 3,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Add parent to first child
    const parent = await addParent(child1.id, {
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Add sibling with shared parents
    const sibling = await addSibling(child1.id, {
      firstName: "Rahul",
      lastName: "Kumar",
      gender: "male",
      generation: 3,
      isBornIntoFamily: true,
      isAlive: true,
    }, true);
    
    // Check sibling's relationships
    const siblingRelations = await getMemberRelationships(sibling.id);
    expect(siblingRelations.parents).toContainEqual(expect.objectContaining({ firstName: "Rajesh" }));
    expect(siblingRelations.siblings).toContainEqual(expect.objectContaining({ firstName: "Priya" }));
  });

  it("should search members by name", async () => {
    const { addMember, searchMembers } = await import("../lib/family-tree");
    
    await addMember({
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    await addMember({
      firstName: "Ramesh",
      lastName: "Sharma",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    const results = await searchMembers("Raj");
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].firstName).toBe("Rajesh");
  });

  it("should build rooted tree view correctly", async () => {
    const { addMember, addParent, addSpouse, addChild, getRootedTree } = await import("../lib/family-tree");
    
    // Create focus person
    const focus = await addMember({
      firstName: "Priya",
      lastName: "Kumar",
      gender: "female",
      generation: 3,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Add parent
    await addParent(focus.id, {
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    // Add spouse
    await addSpouse(focus.id, {
      firstName: "Amit",
      lastName: "Singh",
      gender: "male",
      generation: 3,
      isBornIntoFamily: false,
      isAlive: true,
    });
    
    // Add child
    await addChild(focus.id, {
      firstName: "Arjun",
      lastName: "Singh",
      gender: "male",
      generation: 4,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    const tree = await getRootedTree(focus.id);
    
    expect(tree.focus?.firstName).toBe("Priya");
    expect(tree.parents.length).toBe(1);
    expect(tree.spouses.length).toBe(1);
    expect(tree.children.length).toBe(1);
  });
});

describe("Family Tree Generation Calculation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (AsyncStorage.getItem as any).mockResolvedValue(null);
    (AsyncStorage.setItem as any).mockResolvedValue(undefined);
  });

  it("should correctly calculate generation for parents", async () => {
    const { addMember, addParent } = await import("../lib/family-tree");
    
    const child = await addMember({
      firstName: "Priya",
      lastName: "Kumar",
      gender: "female",
      generation: 3,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    const parent = await addParent(child.id, {
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2, // Should be generation - 1
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    expect(parent.generation).toBe(2);
  });

  it("should correctly calculate generation for children", async () => {
    const { addMember, addChild } = await import("../lib/family-tree");
    
    const parent = await addMember({
      firstName: "Rajesh",
      lastName: "Kumar",
      gender: "male",
      generation: 2,
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    const child = await addChild(parent.id, {
      firstName: "Priya",
      lastName: "Kumar",
      gender: "female",
      generation: 3, // Should be generation + 1
      isBornIntoFamily: true,
      isAlive: true,
    });
    
    expect(child.generation).toBe(3);
  });
});
