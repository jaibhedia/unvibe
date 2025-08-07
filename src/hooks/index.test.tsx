/**
 * Test Suite for Enterprise Custom Hooks
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRepositoryManager, useTheme, useAnalysisInsights } from './index';
import { AppProvider } from '../context/AppContext';
import type { Analysis } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('useRepositoryManager', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRepositoryManager(), { wrapper });
    
    expect(result.current.repositories).toEqual([]);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.statusFilter).toBe('all');
    expect(result.current.sortBy).toBe('updated_at');
    expect(result.current.sortOrder).toBe('desc');
  });

  it('should calculate stats correctly', () => {
    const { result } = renderHook(() => useRepositoryManager(), { wrapper });
    
    expect(result.current.stats).toEqual({
      total: 0,
      completed: 0,
      analyzing: 0,
      pending: 0,
      failed: 0,
      completionRate: 0,
    });
  });
});

describe('useAnalysisInsights', () => {
  const mockAnalysis: Analysis = {
    id: '1',
    repository_id: '1',
    file_structure: {
      src: {
        components: ['App.tsx', 'Header.tsx'],
        hooks: ['useTest.ts'],
      },
    },
    technologies_detected: ['React', 'TypeScript'],
    complexity_score: 7.5,
    vibe_patterns: ['Component Pattern', 'Hook Pattern'],
    recommendations: ['Add tests', 'Improve documentation'],
    created_at: '2024-01-01T00:00:00Z',
  };

  it('should calculate complexity level correctly', () => {
    const { result } = renderHook(() => useAnalysisInsights(mockAnalysis));
    
    expect(result.current.complexityLevel).toBe('high');
  });

  it('should handle null analysis', () => {
    const { result } = renderHook(() => useAnalysisInsights(null));
    
    expect(result.current.complexityLevel).toBe('low');
    expect(result.current.hasAnalysis).toBe(false);
    expect(result.current.fileTypeDistribution).toEqual({});
  });

  it('should calculate file type distribution', () => {
    const { result } = renderHook(() => useAnalysisInsights(mockAnalysis));
    
    const distribution = result.current.fileTypeDistribution;
    expect(distribution.tsx).toBe(2);
    expect(distribution.ts).toBe(1);
  });

  it('should generate technology recommendations', () => {
    const { result } = renderHook(() => useAnalysisInsights(mockAnalysis));
    
    const recommendations = result.current.technologyRecommendations;
    expect(recommendations).toContain('Add Jest for comprehensive testing');
    expect(recommendations).toContain('Implement ESLint for code quality');
  });

  it('should calculate performance metrics', () => {
    const { result } = renderHook(() => useAnalysisInsights(mockAnalysis));
    
    const metrics = result.current.performanceMetrics;
    expect(metrics).toBeDefined();
    expect(metrics?.fileCount).toBe(3);
    expect(metrics?.technologyDiversity).toBe(2);
  });
});

describe('useTheme', () => {
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  it('should initialize with light theme by default', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.theme).toBe('light');
    expect(result.current.effectiveTheme).toBe('light');
  });

  it('should detect system theme changes', () => {
    // Mock dark mode preference
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });
    
    expect(result.current.systemTheme).toBe('dark');
  });
});
