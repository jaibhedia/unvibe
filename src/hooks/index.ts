/**
 * Custom Business Logic Hooks
 * Encapsulates complex business logic and provides reusable functionality
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { Analysis, FileStructure, ComplexityLevel, Repository } from '../types';

/**
 * Hook for repository management with advanced filtering and sorting
 */
export const useRepositoryManager = () => {
  const { state, actions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at' | 'analysis_status'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered and sorted repositories
  const filteredRepositories = useMemo(() => {
    let filtered = state.repositories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(repo => 
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(repo => repo.analysis_status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const getValueForSorting = (repo: any, field: string) => {
        switch (field) {
          case 'name': return repo.name;
          case 'created_at': return repo.created_at;
          case 'updated_at': return repo.updated_at;
          case 'analysis_status': return repo.analysis_status;
          default: return '';
        }
      };
      
      const aValue = getValueForSorting(a, sortBy);
      const bValue = getValueForSorting(b, sortBy);
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.repositories, searchTerm, statusFilter, sortBy, sortOrder]);

  // Repository statistics
  const repositoryStats = useMemo(() => {
    const total = state.repositories.length;
    const completed = state.repositories.filter(r => r.analysis_status === 'completed').length;
    const analyzing = state.repositories.filter(r => r.analysis_status === 'analyzing').length;
    const pending = state.repositories.filter(r => r.analysis_status === 'pending').length;
    const failed = state.repositories.filter(r => r.analysis_status === 'failed').length;

    return {
      total,
      completed,
      analyzing,
      pending,
      failed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [state.repositories]);

  return {
    repositories: filteredRepositories,
    stats: repositoryStats,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    isLoading: state.loading.repositories,
    error: state.error.repositories,
    actions: {
      create: actions.createRepository,
      update: actions.updateRepository,
      delete: actions.deleteRepository,
      select: actions.selectRepository,
      refresh: actions.loadRepositories,
    },
  };
};

/**
 * Hook for analysis data processing and insights
 */
export const useAnalysisInsights = (analysis: Analysis | null) => {
  // Calculate complexity level based on score
  const complexityLevel = useMemo((): ComplexityLevel => {
    if (!analysis) return 'low';
    
    const score = analysis.complexity_score;
    if (score >= 8) return 'very_high';
    if (score >= 6) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }, [analysis]);

  // File type distribution
  const fileTypeDistribution = useMemo(() => {
    if (!analysis?.file_structure) return {};

    const distribution: Record<string, number> = {};
    
    const processStructure = (structure: FileStructure) => {
      Object.values(structure).forEach(value => {
        if (Array.isArray(value)) {
          value.forEach(file => {
            const extension = file.split('.').pop()?.toLowerCase() || 'other';
            distribution[extension] = (distribution[extension] || 0) + 1;
          });
        } else if (typeof value === 'object') {
          processStructure(value);
        }
      });
    };

    processStructure(analysis.file_structure);
    return distribution;
  }, [analysis]);

  // Technology recommendations based on detected technologies
  const technologyRecommendations = useMemo(() => {
    if (!analysis?.technologies_detected) return [];

    const recommendations: string[] = [];
    const technologies = analysis.technologies_detected;

    // React ecosystem recommendations
    if (technologies.includes('React')) {
      if (!technologies.includes('TypeScript')) {
        recommendations.push('Consider migrating to TypeScript for better type safety');
      }
      if (!technologies.includes('Jest')) {
        recommendations.push('Add Jest for comprehensive testing');
      }
      if (!technologies.includes('ESLint')) {
        recommendations.push('Implement ESLint for code quality');
      }
    }

    // Python ecosystem recommendations
    if (technologies.includes('Python')) {
      if (!technologies.includes('pytest')) {
        recommendations.push('Add pytest for Python testing');
      }
      if (!technologies.includes('Black')) {
        recommendations.push('Use Black for code formatting');
      }
    }

    // General recommendations
    if (analysis.complexity_score > 7) {
      recommendations.push('Consider refactoring to reduce complexity');
    }

    return recommendations;
  }, [analysis]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!analysis) return null;

    const fileCount = Object.keys(fileTypeDistribution).reduce(
      (sum, type) => sum + fileTypeDistribution[type], 0
    );

    return {
      fileCount,
      averageComplexityPerFile: fileCount > 0 ? analysis.complexity_score / fileCount : 0,
      technologyDiversity: analysis.technologies_detected?.length || 0,
      patternCompliance: analysis.vibe_patterns?.length || 0,
    };
  }, [analysis, fileTypeDistribution]);

  return {
    complexityLevel,
    fileTypeDistribution,
    technologyRecommendations,
    performanceMetrics,
    hasAnalysis: !!analysis,
  };
};

/**
 * Hook for real-time notifications and alerts
 */
export const useNotifications = () => {
  const { state, actions } = useApp();
  const [autoRemoveTimeout, setAutoRemoveTimeout] = useState(5000);

  // Auto-remove notifications after timeout
  useEffect(() => {
    if (state.ui.notifications.length === 0) return;

    const timer = setTimeout(() => {
      const oldestNotification = state.ui.notifications[state.ui.notifications.length - 1];
      if (oldestNotification && !oldestNotification.read) {
        // Don't auto-remove unread notifications
        return;
      }
      
      // Remove oldest notification
      // Note: This would need to be implemented in the context
    }, autoRemoveTimeout);

    return () => clearTimeout(timer);
  }, [state.ui.notifications, autoRemoveTimeout]);

  const unreadCount = useMemo(
    () => state.ui.notifications.filter(n => !n.read).length,
    [state.ui.notifications]
  );

  return {
    notifications: state.ui.notifications,
    unreadCount,
    autoRemoveTimeout,
    setAutoRemoveTimeout,
    showNotification: actions.showNotification,
  };
};

/**
 * Hook for theme and UI preferences
 */
export const useTheme = () => {
  const { state, actions } = useApp();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  // Detect system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate effective theme
  const effectiveTheme = useMemo(() => {
    if (state.ui.theme === 'system') {
      return systemTheme;
    }
    return state.ui.theme;
  }, [state.ui.theme, systemTheme]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [effectiveTheme]);

  return {
    theme: state.ui.theme,
    effectiveTheme,
    systemTheme,
    setTheme: actions.setTheme,
  };
};

/**
 * Hook for data persistence and synchronization
 */
export const useDataSync = () => {
  const { actions } = useApp();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Auto-sync data periodically
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      setSyncStatus('syncing');
      try {
        await Promise.all([
          actions.loadRepositories(),
          actions.loadAnalyses(),
        ]);
        setLastSyncTime(new Date());
        setSyncStatus('idle');
      } catch (error) {
        setSyncStatus('error');
        console.error('Auto-sync failed:', error);
      }
    }, 30000); // Sync every 30 seconds

    return () => clearInterval(syncInterval);
  }, [actions]);

  // Manual sync function
  const manualSync = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      await Promise.all([
        actions.loadRepositories(),
        actions.loadAnalyses(),
      ]);
      setLastSyncTime(new Date());
      setSyncStatus('idle');
      actions.showNotification('success', 'Sync Complete', 'Data has been synchronized successfully');
    } catch (error) {
      setSyncStatus('error');
      actions.showNotification('error', 'Sync Failed', 'Failed to synchronize data');
    }
  }, [actions]);

  // Check if data is stale
  const isDataStale = useMemo(() => {
    if (!lastSyncTime) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSyncTime < fiveMinutesAgo;
  }, [lastSyncTime]);

  return {
    lastSyncTime,
    syncStatus,
    isDataStale,
    manualSync,
    autoSyncEnabled: true,
  };
};

/**
 * Hook for application performance monitoring
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    apiResponseTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
  });

  // Monitor render performance
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation', 'resource'] });

    return () => observer.disconnect();
  }, []);

  // Monitor memory usage (if supported)
  useEffect(() => {
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.jsHeapSizeLimit,
        }));
      }
    };

    const interval = setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    isPerformanceGood: metrics.renderTime < 1000 && metrics.memoryUsage < 0.8,
  };
};

/**
 * Hook for accessibility features
 */
export const useAccessibility = () => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  // Detect user preferences
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    setReduceMotion(motionQuery.matches);
    setHighContrast(contrastQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches);

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Apply accessibility settings
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [fontSize, reduceMotion, highContrast]);

  return {
    reduceMotion,
    highContrast,
    fontSize,
    setFontSize,
    increaseFont: () => setFontSize(prev => Math.min(prev + 2, 24)),
    decreaseFont: () => setFontSize(prev => Math.max(prev - 2, 12)),
    resetFont: () => setFontSize(16),
  };
};
