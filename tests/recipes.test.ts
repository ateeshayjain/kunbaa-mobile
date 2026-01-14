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

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recipe } from '../lib/types';

const RECIPES_KEY = '@kunbaa/recipes';

async function getRecipes(): Promise<Recipe[]> {
  const value = await AsyncStorage.getItem(RECIPES_KEY);
  return value ? JSON.parse(value) : [];
}

async function saveRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getRecipes();
  const index = recipes.findIndex(r => r.id === recipe.id);
  if (index >= 0) {
    recipes[index] = recipe;
  } else {
    recipes.push(recipe);
  }
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getRecipes();
  const filtered = recipes.filter(r => r.id !== id);
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(filtered));
}

describe('Recipe Storage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('saveRecipe', () => {
    it('should save a new recipe', async () => {
      const recipe: Recipe = {
        id: '1',
        title: 'Test Recipe',
        category: 'Main Course',
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveRecipe(recipe);
      const recipes = await getRecipes();

      expect(recipes.length).toBe(1);
      expect(recipes[0].title).toBe('Test Recipe');
    });

    it('should update an existing recipe', async () => {
      const recipe: Recipe = {
        id: '1',
        title: 'Original Title',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveRecipe(recipe);

      const updatedRecipe: Recipe = {
        ...recipe,
        title: 'Updated Title',
        updatedAt: new Date().toISOString(),
      };

      await saveRecipe(updatedRecipe);
      const recipes = await getRecipes();

      expect(recipes.length).toBe(1);
      expect(recipes[0].title).toBe('Updated Title');
    });
  });

  describe('deleteRecipe', () => {
    it('should delete a recipe by id', async () => {
      const recipe1: Recipe = {
        id: '1',
        title: 'Recipe 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const recipe2: Recipe = {
        id: '2',
        title: 'Recipe 2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveRecipe(recipe1);
      await saveRecipe(recipe2);

      await deleteRecipe('1');
      const recipes = await getRecipes();

      expect(recipes.length).toBe(1);
      expect(recipes[0].id).toBe('2');
    });
  });

  describe('getRecipes', () => {
    it('should return empty array when no recipes exist', async () => {
      const recipes = await getRecipes();
      expect(recipes).toEqual([]);
    });
  });
});
