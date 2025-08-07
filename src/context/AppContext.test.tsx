/**
 * Test Suite for Enterprise App Context
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '../context/AppContext';
import type { Repository } from '../types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  describe('Repository Management', () => {
    it('should initialize with empty repositories', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      expect(result.current.state.repositories).toEqual([]);
      expect(result.current.state.loading.repositories).toBe(false);
      expect(result.current.state.error.repositories).toBeNull();
    });

    it('should create a repository', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      const newRepo = {
        url: 'https://github.com/test/repo',
        name: 'Test Repo',
        description: 'A test repository',
      };

      await act(async () => {
        await result.current.actions.createRepository(newRepo);
      });

      expect(result.current.state.repositories).toHaveLength(1);
      expect(result.current.state.repositories[0]).toMatchObject({
        name: 'Test Repo',
        url: 'https://github.com/test/repo',
        description: 'A test repository',
      });
    });

    it('should handle repository creation errors', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      const invalidRepo = {
        url: 'invalid-url',
        name: '',
        description: '',
      };

      await act(async () => {
        try {
          await result.current.actions.createRepository(invalidRepo);
        } catch {
          // Expected to fail
        }
      });

      expect(result.current.state.error.repositories).toBeTruthy();
    });

    it('should select a repository', () => {
      const { result } = renderHook(() => useApp(), { wrapper });
      
      const repo: Repository = {
        id: '1',
        name: 'Test Repo',
        url: 'https://github.com/test/repo',
        description: 'Test',
        analysis_status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      act(() => {
        result.current.actions.selectRepository(repo);
      });

      expect(result.current.state.selectedRepository).toEqual(repo);
    });
  });

  describe('Notifications', () => {
    it('should show notifications', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.actions.showNotification(
          'success',
          'Test Title',
          'Test message'
        );
      });

      expect(result.current.state.ui.notifications).toHaveLength(1);
      expect(result.current.state.ui.notifications[0]).toMatchObject({
        type: 'success',
        title: 'Test Title',
        message: 'Test message',
        read: false,
      });
    });

    it('should limit notification count', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Add more than 5 notifications
      act(() => {
        for (let i = 0; i < 7; i++) {
          result.current.actions.showNotification(
            'info',
            `Title ${i}`,
            `Message ${i}`
          );
        }
      });

      // Should only keep the last 5
      expect(result.current.state.ui.notifications).toHaveLength(5);
    });
  });

  describe('Theme Management', () => {
    it('should set theme', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.actions.setTheme('dark');
      });

      expect(result.current.state.ui.theme).toBe('dark');
    });

    it('should toggle theme', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Default is light
      expect(result.current.state.ui.theme).toBe('light');

      act(() => {
        result.current.actions.toggleTheme();
      });

      expect(result.current.state.ui.theme).toBe('dark');

      act(() => {
        result.current.actions.toggleTheme();
      });

      expect(result.current.state.ui.theme).toBe('light');
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.actions.setError('repositories', 'Test error');
      });

      expect(result.current.state.error.repositories).toBe('Test error');

      act(() => {
        result.current.actions.clearError('repositories');
      });

      expect(result.current.state.error.repositories).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('should manage loading states', () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      act(() => {
        result.current.actions.setLoading('repositories', true);
      });

      expect(result.current.state.loading.repositories).toBe(true);

      act(() => {
        result.current.actions.setLoading('repositories', false);
      });

      expect(result.current.state.loading.repositories).toBe(false);
    });
  });
});
