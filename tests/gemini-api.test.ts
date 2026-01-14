import { describe, it, expect } from "vitest";

describe("Google Gemini API Key Validation", () => {
  it("should have GOOGLE_GEMINI_API_KEY environment variable set", () => {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey!.length).toBeGreaterThan(10);
  });

  it("should successfully connect to Gemini API", async () => {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not set");
    }

    // Test the API key by making a simple request to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    expect(response.ok).toBe(true);
    
    const data = await response.json();
    expect(data.models).toBeDefined();
    expect(Array.isArray(data.models)).toBe(true);
    expect(data.models.length).toBeGreaterThan(0);
  });
});
