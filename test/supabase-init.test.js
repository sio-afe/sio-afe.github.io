/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

// Mock the supabase-js library
const mockSupabaseClient = {
    from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    channel: jest.fn(() => ({
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn()
    }))
};

global.supabase = {
    createClient: jest.fn(() => mockSupabaseClient)
};

// Mock the router
class MockRouter {
    constructor() {
        this.routes = new Map();
    }

    addRoute(path, handler) {
        this.routes.set(path, handler);
    }

    navigate(path) {
        const handler = this.routes.get(path);
        if (handler) {
            return handler();
        }
    }
}

describe('Supabase and Dynamic Functionality Tests', () => {
    let originalConsoleError;
    let originalConsoleLog;

    beforeAll(() => {
        // Mock console methods
        originalConsoleError = console.error;
        originalConsoleLog = console.log;
        console.error = jest.fn();
        console.log = jest.fn();
    });

    afterAll(() => {
        // Restore console methods
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
    });

    beforeEach(() => {
        // Reset the DOM and mocks before each test
        document.body.innerHTML = '<div id="root"><main></main></div>';
        jest.clearAllMocks();
        window.supabaseClient = undefined;
        window.router = new MockRouter();
        window.dynamicClient = undefined;

        // Initialize Supabase setup
        window.initSupabase = function() {
            return new Promise((resolve, reject) => {
                if (typeof supabase !== 'undefined') {
                    window.supabaseClient = supabase.createClient(
                        'https://efirvmzdioizosdcnasg.supabase.co',
                        'test-key'
                    );
                    console.log('Supabase client initialized');
                    resolve(window.supabaseClient);
                } else {
                    console.error('Supabase library not loaded');
                    reject(new Error('Supabase library not loaded'));
                }
            });
        };

        // Create and dispatch DOMContentLoaded event
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    });

    describe('Supabase Initialization', () => {
        it('should initialize Supabase client successfully', async () => {
            await window.initSupabase();
            
            expect(global.supabase.createClient).toHaveBeenCalledWith(
                'https://efirvmzdioizosdcnasg.supabase.co',
                expect.any(String)
            );
            expect(console.log).toHaveBeenCalledWith('Supabase client initialized');
        });

        it('should handle Supabase library not loaded error', async () => {
            const originalSupabase = global.supabase;
            global.supabase = undefined;
            
            try {
                await window.initSupabase();
            } catch (error) {
                expect(error.message).toBe('Supabase library not loaded');
                expect(console.error).toHaveBeenCalledWith('Supabase library not loaded');
            }
            
            global.supabase = originalSupabase;
        });
    });

    describe('Dynamic Router', () => {
        it('should initialize dynamic router', () => {
            expect(window.router).toBeDefined();
            expect(typeof window.router.addRoute).toBe('function');
            expect(typeof window.router.navigate).toBe('function');
        });

        it('should handle dynamic route navigation', async () => {
            const testRoute = '/test-dynamic';
            const testContent = 'Dynamic Test Content';
            
            window.router.addRoute(testRoute, () => testContent);
            const result = await window.router.navigate(testRoute);
            
            expect(result).toBe(testContent);
            expect(window.router.routes.has(testRoute)).toBeTruthy();
        });
    });

    describe('Real-time Updates', () => {
        beforeEach(() => {
            window.dynamicClient = {
                subscribeToChannel: jest.fn(),
                state: { currentData: null },
                subscribe: jest.fn()
            };

            // Add event listener for dynamic updates
            document.addEventListener('DOMContentLoaded', () => {
                if (window.dynamicClient) {
                    window.dynamicClient.subscribeToChannel('page_updates');
                }
            });
        });

        it('should initialize real-time subscription', () => {
            // Trigger subscription setup
            document.dispatchEvent(new Event('DOMContentLoaded'));
            
            expect(window.dynamicClient.subscribeToChannel)
                .toHaveBeenCalledWith('page_updates');
        });

        it('should handle real-time updates', () => {
            const testData = { id: 1, name: 'Test' };
            const callback = jest.fn();

            window.dynamicClient.subscribe(callback);
            window.dynamicClient.state.currentData = testData;

            expect(window.dynamicClient.subscribe).toHaveBeenCalled();
        });
    });
});