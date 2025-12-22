/**
 * Supabase Client Mock
 * Provides mock implementations for all Supabase operations used in tests
 */

import { vi } from 'vitest';

// Mock data stores
let mockTeams = [];
let mockMatches = [];
let mockCards = [];
let mockTournamentSettings = null;
let mockKnockoutBracket = [];

/**
 * Reset all mock data (call in beforeEach)
 */
export function resetMockData() {
  mockTeams = [];
  mockMatches = [];
  mockCards = [];
  mockTournamentSettings = null;
  mockKnockoutBracket = [];
}

/**
 * Set mock teams data
 */
export function setMockTeams(teams) {
  mockTeams = teams;
}

/**
 * Set mock matches data
 */
export function setMockMatches(matches) {
  mockMatches = matches;
}

/**
 * Set mock cards data
 */
export function setMockCards(cards) {
  mockCards = cards;
}

/**
 * Set mock tournament settings
 */
export function setMockTournamentSettings(settings) {
  mockTournamentSettings = settings;
}

/**
 * Set mock knockout bracket
 */
export function setMockKnockoutBracket(bracket) {
  mockKnockoutBracket = bracket;
}

/**
 * Create chainable mock query builder
 */
function createQueryBuilder(data) {
  const builder = {
    data,
    filters: [],
    selectedFields: null,
    orderByField: null,
    orderDirection: 'asc',
    
    select(fields) {
      this.selectedFields = fields;
      return this;
    },
    
    eq(field, value) {
      this.filters.push({ type: 'eq', field, value });
      return this;
    },
    
    neq(field, value) {
      this.filters.push({ type: 'neq', field, value });
      return this;
    },
    
    in(field, values) {
      this.filters.push({ type: 'in', field, values });
      return this;
    },
    
    or(conditions) {
      this.filters.push({ type: 'or', conditions });
      return this;
    },
    
    order(field, options = {}) {
      this.orderByField = field;
      this.orderDirection = options.ascending === false ? 'desc' : 'asc';
      return this;
    },
    
    limit(count) {
      this.limitCount = count;
      return this;
    },
    
    single() {
      const result = this._applyFilters();
      if (result.length === 0) {
        return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } });
      }
      return Promise.resolve({ data: result[0], error: null });
    },
    
    _applyFilters() {
      let result = [...this.data];
      
      this.filters.forEach(filter => {
        if (filter.type === 'eq') {
          result = result.filter(item => item[filter.field] === filter.value);
        } else if (filter.type === 'neq') {
          result = result.filter(item => item[filter.field] !== filter.value);
        } else if (filter.type === 'in') {
          result = result.filter(item => filter.values.includes(item[filter.field]));
        }
      });
      
      if (this.orderByField) {
        result.sort((a, b) => {
          const aVal = a[this.orderByField];
          const bVal = b[this.orderByField];
          if (this.orderDirection === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          }
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        });
      }
      
      if (this.limitCount) {
        result = result.slice(0, this.limitCount);
      }
      
      return result;
    },
    
    then(resolve) {
      const result = this._applyFilters();
      resolve({ data: result, error: null });
    },
  };
  
  // Make it thenable
  builder[Symbol.toStringTag] = 'Promise';
  
  return builder;
}

/**
 * Mock Supabase client
 */
export const mockSupabaseClient = {
  from: vi.fn((table) => {
    switch (table) {
      case 'teams':
        return createQueryBuilder(mockTeams);
      case 'matches':
        return createQueryBuilder(mockMatches);
      case 'cards':
        return createQueryBuilder(mockCards);
      case 'tournament_settings':
        return createQueryBuilder(mockTournamentSettings ? [mockTournamentSettings] : []);
      case 'knockout_bracket':
        return createQueryBuilder(mockKnockoutBracket);
      default:
        return createQueryBuilder([]);
    }
  }),
  
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signIn: vi.fn(() => Promise.resolve({ data: { user: {} }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ data: { path: 'mock-path' }, error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock-url.com/image.jpg' } })),
      remove: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
};

// Export for use in vi.mock
export default mockSupabaseClient;

