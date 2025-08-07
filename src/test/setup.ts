/**
 * Enterprise Testing Configuration
 * Comprehensive testing setup with Jest, React Testing Library, and MSW
 */

import { afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock API responses
const server = setupServer(
  // Repository endpoints
  rest.get('/api/repositories', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'test-repo',
          url: 'https://github.com/test/repo',
          description: 'Test repository',
          analysis_status: 'completed',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  rest.post('/api/repositories', (req, res, ctx) => {
    return res(
      ctx.json({
        id: '2',
        name: 'new-repo',
        url: 'https://github.com/new/repo',
        analysis_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );
  }),

  // Analysis endpoints
  rest.get('/api/analyses', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          repository_id: '1',
          file_structure: {
            src: { components: ['App.tsx'], hooks: ['useTest.ts'] },
          },
          technologies_detected: ['React', 'TypeScript'],
          complexity_score: 5.5,
          vibe_patterns: ['Component Pattern'],
          recommendations: ['Add tests'],
          created_at: '2024-01-01T00:00:00Z',
        },
      ])
    );
  }),

  // Error responses
  rest.get('/api/repositories/error', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
  }),
);

// Setup and teardown
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

// Mock global objects
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  disconnect() {}
  unobserve() {}
};

// Mock HTMLCanvasElement for Chart.js
HTMLCanvasElement.prototype.getContext = () => ({
  fillRect: () => {},
  clearRect: () => {},
  getImageData: () => ({ data: new Array(4) }),
  putImageData: () => {},
  createImageData: () => ({ data: new Array(4) }),
  setTransform: () => {},
  drawImage: () => {},
  save: () => {},
  fillText: () => {},
  restore: () => {},
  beginPath: () => {},
  moveTo: () => {},
  lineTo: () => {},
  closePath: () => {},
  stroke: () => {},
  translate: () => {},
  scale: () => {},
  rotate: () => {},
  arc: () => {},
  fill: () => {},
  measureText: () => ({ width: 0 }),
  transform: () => {},
  rect: () => {},
  clip: () => {},
} as any);

// Performance mock
global.performance = {
  ...global.performance,
  memory: {
    usedJSHeapSize: 1000000,
    jsHeapSizeLimit: 2000000,
    totalJSHeapSize: 1500000,
  },
};

export { server };
