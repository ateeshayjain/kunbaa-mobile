import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for Gemini API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Set up environment variable
process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "test-key";

describe("Kaka AI Intent Detection", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should detect add_member intent from natural language", async () => {
    // Mock Gemini response for intent detection
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                type: "add_member",
                data: {
                  firstName: "Rahul",
                  gender: "male",
                  dateOfBirth: "1990-01-01",
                  relationshipType: "sibling",
                  relativeToName: "Priya"
                }
              })
            }]
          }
        }]
      })
    });

    // Import after mocking
    const { detectIntent } = await import("../lib/kaka-ai");
    
    const intent = await detectIntent("Add my brother Rahul who was born in 1990");
    
    expect(intent.type).toBe("add_member");
    if (intent.type === "add_member") {
      expect(intent.data.firstName).toBe("Rahul");
      expect(intent.data.relationshipType).toBe("sibling");
    }
  });

  it("should detect search_member intent", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                type: "search_member",
                data: { query: "Rajesh" }
              })
            }]
          }
        }]
      })
    });

    const { detectIntent } = await import("../lib/kaka-ai");
    
    const intent = await detectIntent("Find Uncle Rajesh");
    
    expect(intent.type).toBe("search_member");
    if (intent.type === "search_member") {
      expect(intent.data.query).toBe("Rajesh");
    }
  });

  it("should detect generate_biography intent", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify({
                type: "generate_biography",
                data: { memberName: "Grandma" }
              })
            }]
          }
        }]
      })
    });

    const { detectIntent } = await import("../lib/kaka-ai");
    
    const intent = await detectIntent("Write a biography for Grandma");
    
    expect(intent.type).toBe("generate_biography");
  });

  it("should fall back to general_query for unknown intents", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: "Invalid response"
            }]
          }
        }]
      })
    });

    const { detectIntent } = await import("../lib/kaka-ai");
    
    const intent = await detectIntent("Hello, how are you?");
    
    expect(intent.type).toBe("general_query");
  });
});

describe("Kaka AI Response Processing", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should return actionable response for add_member intent", async () => {
    // First call for detectIntent, second for any follow-up
    mockFetch.mockResolvedValue({
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: "I'll help you add this family member."
            }]
          }
        }]
      })
    });

    const { processIntent } = await import("../lib/kaka-ai");
    
    const result = await processIntent({
      type: "add_member",
      data: {
        firstName: "Rahul",
        relationshipType: "sibling",
        relativeToName: "Priya"
      }
    });
    
    expect(result.response).toContain("Rahul");
    expect(result.action?.type).toBe("open_add_member");
  });
});
