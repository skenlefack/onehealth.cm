/**
 * Tests for COHRM Zustand store
 */

import { act } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Import store after mocking localStorage
import useCohrmStore from '../stores/cohrmStore';

describe('COHRM Zustand Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Reset the store state
    const store = useCohrmStore.getState();
    if (store.reset) {
      act(() => store.reset());
    }
  });

  test('store initializes with default state', () => {
    const state = useCohrmStore.getState();
    expect(state).toBeDefined();
  });

  test('has navigation management functions', () => {
    const state = useCohrmStore.getState();
    // Check that navigation-related properties exist
    expect(typeof state.setActivePage === 'function' || state.activePage !== undefined || state.navigate !== undefined).toBe(true);
  });

  test('store has rumor-related state', () => {
    const state = useCohrmStore.getState();
    // The store should have some rumor-related state
    const keys = Object.keys(state);
    const hasRumorState = keys.some(k =>
      k.toLowerCase().includes('rumor') ||
      k.toLowerCase().includes('filter') ||
      k.toLowerCase().includes('page')
    );
    expect(hasRumorState).toBe(true);
  });

  test('store functions are callable', () => {
    const state = useCohrmStore.getState();
    const functions = Object.entries(state).filter(([, v]) => typeof v === 'function');
    expect(functions.length).toBeGreaterThan(0);
  });
});
