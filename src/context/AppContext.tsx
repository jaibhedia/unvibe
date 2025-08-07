/**
 * Advanced State Management with React Context and Reducers
 * Implements Redux-like patterns with TypeScript for type safety
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Repository, Analysis, LoadingState, ErrorState, AppState } from '../types';
import { apiService } from '../services/apiService';

// Action Types
export const ActionTypes = {
  // Repository Actions
  SET_REPOSITORIES: 'SET_REPOSITORIES',
  ADD_REPOSITORY: 'ADD_REPOSITORY',
  UPDATE_REPOSITORY: 'UPDATE_REPOSITORY',
  DELETE_REPOSITORY: 'DELETE_REPOSITORY',
  SET_SELECTED_REPOSITORY: 'SET_SELECTED_REPOSITORY',
  
  // Analysis Actions
  SET_ANALYSES: 'SET_ANALYSES',
  ADD_ANALYSIS: 'ADD_ANALYSIS',
  SET_SELECTED_ANALYSIS: 'SET_SELECTED_ANALYSIS',
  
  // Loading Actions
  SET_LOADING: 'SET_LOADING',
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  
  // Error Actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERROR_STATE: 'SET_ERROR_STATE',
  
  // UI Actions
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_NOTIFICATION_READ: 'MARK_NOTIFICATION_READ',
  
  // System Actions
  RESET_STATE: 'RESET_STATE',
  HYDRATE_STATE: 'HYDRATE_STATE',
} as const;

// Action Interfaces
interface SetRepositoriesAction {
  type: typeof ActionTypes.SET_REPOSITORIES;
  payload: Repository[];
}

interface AddRepositoryAction {
  type: typeof ActionTypes.ADD_REPOSITORY;
  payload: Repository;
}

interface UpdateRepositoryAction {
  type: typeof ActionTypes.UPDATE_REPOSITORY;
  payload: { id: string; data: Partial<Repository> };
}

interface DeleteRepositoryAction {
  type: typeof ActionTypes.DELETE_REPOSITORY;
  payload: string;
}

interface SetSelectedRepositoryAction {
  type: typeof ActionTypes.SET_SELECTED_REPOSITORY;
  payload: Repository | null;
}

interface SetAnalysesAction {
  type: typeof ActionTypes.SET_ANALYSES;
  payload: Analysis[];
}

interface AddAnalysisAction {
  type: typeof ActionTypes.ADD_ANALYSIS;
  payload: Analysis;
}

interface SetSelectedAnalysisAction {
  type: typeof ActionTypes.SET_SELECTED_ANALYSIS;
  payload: Analysis | null;
}

interface SetLoadingAction {
  type: typeof ActionTypes.SET_LOADING;
  payload: { key: keyof LoadingState; value: boolean };
}

interface SetLoadingStateAction {
  type: typeof ActionTypes.SET_LOADING_STATE;
  payload: Partial<LoadingState>;
}

interface SetErrorAction {
  type: typeof ActionTypes.SET_ERROR;
  payload: { key: keyof ErrorState; value: string | null };
}

interface ClearErrorAction {
  type: typeof ActionTypes.CLEAR_ERROR;
  payload?: keyof ErrorState;
}

interface SetErrorStateAction {
  type: typeof ActionTypes.SET_ERROR_STATE;
  payload: Partial<ErrorState>;
}

interface SetThemeAction {
  type: typeof ActionTypes.SET_THEME;
  payload: 'light' | 'dark' | 'system';
}

interface ToggleSidebarAction {
  type: typeof ActionTypes.TOGGLE_SIDEBAR;
}

interface SetCurrentViewAction {
  type: typeof ActionTypes.SET_CURRENT_VIEW;
  payload: 'dashboard' | 'repositories' | 'analyses' | 'settings';
}

interface AddNotificationAction {
  type: typeof ActionTypes.ADD_NOTIFICATION;
  payload: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    action?: { label: string; onClick: () => void };
  };
}

interface RemoveNotificationAction {
  type: typeof ActionTypes.REMOVE_NOTIFICATION;
  payload: string;
}

interface MarkNotificationReadAction {
  type: typeof ActionTypes.MARK_NOTIFICATION_READ;
  payload: string;
}

interface ResetStateAction {
  type: typeof ActionTypes.RESET_STATE;
}

interface HydrateStateAction {
  type: typeof ActionTypes.HYDRATE_STATE;
  payload: Partial<AppState>;
}

// Union of all action types
export type AppAction = 
  | SetRepositoriesAction
  | AddRepositoryAction
  | UpdateRepositoryAction
  | DeleteRepositoryAction
  | SetSelectedRepositoryAction
  | SetAnalysesAction
  | AddAnalysisAction
  | SetSelectedAnalysisAction
  | SetLoadingAction
  | SetLoadingStateAction
  | SetErrorAction
  | ClearErrorAction
  | SetErrorStateAction
  | SetThemeAction
  | ToggleSidebarAction
  | SetCurrentViewAction
  | AddNotificationAction
  | RemoveNotificationAction
  | MarkNotificationReadAction
  | ResetStateAction
  | HydrateStateAction;

// Initial State
const initialState: AppState = {
  repositories: [],
  analyses: [],
  selectedRepository: null,
  selectedAnalysis: null,
  loading: {
    repositories: false,
    analyses: false,
    submission: false,
    analysis: false,
  },
  error: {
    repositories: null,
    analyses: null,
    submission: null,
    analysis: null,
    network: null,
  },
  ui: {
    theme: 'system',
    sidebarOpen: true,
    currentView: 'dashboard',
    notifications: [],
  },
};

// Reducer Function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case ActionTypes.SET_REPOSITORIES:
      return {
        ...state,
        repositories: action.payload,
      };

    case ActionTypes.ADD_REPOSITORY:
      return {
        ...state,
        repositories: [...state.repositories, action.payload],
      };

    case ActionTypes.UPDATE_REPOSITORY:
      return {
        ...state,
        repositories: state.repositories.map(repo =>
          repo.id === action.payload.id
            ? { ...repo, ...action.payload.data }
            : repo
        ),
      };

    case ActionTypes.DELETE_REPOSITORY:
      return {
        ...state,
        repositories: state.repositories.filter(repo => repo.id !== action.payload),
        selectedRepository: state.selectedRepository?.id === action.payload 
          ? null 
          : state.selectedRepository,
        analyses: state.analyses.filter(analysis => analysis.repository_id !== action.payload),
      };

    case ActionTypes.SET_SELECTED_REPOSITORY:
      return {
        ...state,
        selectedRepository: action.payload,
        selectedAnalysis: action.payload 
          ? state.analyses.find(a => a.repository_id === action.payload!.id) || null
          : null,
      };

    case ActionTypes.SET_ANALYSES:
      return {
        ...state,
        analyses: action.payload,
      };

    case ActionTypes.ADD_ANALYSIS:
      return {
        ...state,
        analyses: [...state.analyses, action.payload],
      };

    case ActionTypes.SET_SELECTED_ANALYSIS:
      return {
        ...state,
        selectedAnalysis: action.payload,
      };

    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionTypes.SET_LOADING_STATE:
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload,
        },
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.key]: action.payload.value,
        },
      };

    case ActionTypes.CLEAR_ERROR:
      if (action.payload) {
        return {
          ...state,
          error: {
            ...state.error,
            [action.payload]: null,
          },
        };
      }
      return {
        ...state,
        error: {
          repositories: null,
          analyses: null,
          submission: null,
          analysis: null,
          network: null,
        },
      };

    case ActionTypes.SET_ERROR_STATE:
      return {
        ...state,
        error: {
          ...state.error,
          ...action.payload,
        },
      };

    case ActionTypes.SET_THEME:
      return {
        ...state,
        ui: {
          ...state.ui,
          theme: action.payload,
        },
      };

    case ActionTypes.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };

    case ActionTypes.SET_CURRENT_VIEW:
      return {
        ...state,
        ui: {
          ...state.ui,
          currentView: action.payload,
        },
      };

    case ActionTypes.ADD_NOTIFICATION:
      const newNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
        timestamp: new Date().toISOString(),
        read: false,
        action: action.payload.action,
      };
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [newNotification, ...state.ui.notifications].slice(0, 10), // Keep only 10 latest
        },
      };

    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload),
        },
      };

    case ActionTypes.MARK_NOTIFICATION_READ:
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.map(n =>
            n.id === action.payload ? { ...n, read: true } : n
          ),
        },
      };

    case ActionTypes.RESET_STATE:
      return initialState;

    case ActionTypes.HYDRATE_STATE:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

// Context
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: {
    // Repository Actions
    loadRepositories: () => Promise<void>;
    createRepository: (data: { url: string; name: string; description?: string }) => Promise<void>;
    updateRepository: (id: string, data: Partial<Repository>) => Promise<void>;
    deleteRepository: (id: string) => Promise<void>;
    selectRepository: (repository: Repository | null) => void;
    
    // Analysis Actions
    loadAnalyses: () => Promise<void>;
    loadAnalysisForRepository: (repositoryId: string) => Promise<void>;
    pollAnalysisStatus: (repositoryId: string) => Promise<void>;
    
    // UI Actions
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    toggleSidebar: () => void;
    setCurrentView: (view: 'dashboard' | 'repositories' | 'analyses' | 'settings') => void;
    showNotification: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
    clearErrors: (key?: keyof ErrorState) => void;
    
    // Utility Actions
    resetState: () => void;
  };
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Provider Component
interface AppProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AppState>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialState: providedInitialState }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    ...providedInitialState,
  });

  // Track repositories currently being polled to prevent duplicates
  const pollingRepositoriesRef = React.useRef<Set<string>>(new Set());

  // Repository Actions
  const loadRepositories = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'repositories', value: true } });
    dispatch({ type: ActionTypes.CLEAR_ERROR, payload: 'repositories' });

    try {
      const repositories = await apiService.getRepositories();
      dispatch({ type: ActionTypes.SET_REPOSITORIES, payload: repositories });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load repositories';
      dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'repositories', value: errorMessage } });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'repositories', value: false } });
    }
  }, []);

  const createRepository = useCallback(async (data: { url: string; name: string; description?: string }) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'submission', value: true } });
    dispatch({ type: ActionTypes.CLEAR_ERROR, payload: 'submission' });

    try {
      const repository = await apiService.createRepository(data);
      dispatch({ type: ActionTypes.ADD_REPOSITORY, payload: repository });
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { 
          type: 'success', 
          title: 'Repository Added', 
          message: `${repository.name} has been successfully added for analysis.` 
        } 
      });
      
      // Start polling for analysis with a longer delay
      setTimeout(() => pollAnalysisStatus(repository.id), 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create repository';
      dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'submission', value: errorMessage } });
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { 
          type: 'error', 
          title: 'Submission Failed', 
          message: errorMessage 
        } 
      });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'submission', value: false } });
    }
  }, []);

  const updateRepository = useCallback(async (id: string, data: Partial<Repository>) => {
    try {
      const repository = await apiService.updateRepository(id, data);
      dispatch({ type: ActionTypes.UPDATE_REPOSITORY, payload: { id, data: repository } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update repository';
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { 
          type: 'error', 
          title: 'Update Failed', 
          message: errorMessage 
        } 
      });
    }
  }, []);

  const deleteRepository = useCallback(async (id: string) => {
    try {
      await apiService.deleteRepository(id);
      dispatch({ type: ActionTypes.DELETE_REPOSITORY, payload: id });
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { 
          type: 'success', 
          title: 'Repository Deleted', 
          message: 'Repository has been successfully deleted.' 
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete repository';
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { 
          type: 'error', 
          title: 'Deletion Failed', 
          message: errorMessage 
        } 
      });
    }
  }, []);

  const selectRepository = useCallback((repository: Repository | null) => {
    dispatch({ type: ActionTypes.SET_SELECTED_REPOSITORY, payload: repository });
  }, []);

  // Analysis Actions
  const loadAnalyses = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'analyses', value: true } });
    dispatch({ type: ActionTypes.CLEAR_ERROR, payload: 'analyses' });

    try {
      const analyses = await apiService.getAnalyses();
      dispatch({ type: ActionTypes.SET_ANALYSES, payload: analyses });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analyses';
      dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'analyses', value: errorMessage } });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'analyses', value: false } });
    }
  }, []);

  const loadAnalysisForRepository = useCallback(async (repositoryId: string) => {
    try {
      const analyses = await apiService.getAnalysesByRepository(repositoryId);
      if (analyses.length > 0) {
        dispatch({ type: ActionTypes.SET_SELECTED_ANALYSIS, payload: analyses[0] });
      }
    } catch (error) {
      console.error('Failed to load analysis for repository:', error);
    }
  }, []);

  const pollAnalysisStatus = useCallback(async (repositoryId: string) => {
    // Prevent duplicate polling for the same repository
    if (pollingRepositoriesRef.current.has(repositoryId)) {
      console.log(`Already polling repository ${repositoryId}, skipping...`);
      return;
    }

    pollingRepositoriesRef.current.add(repositoryId);
    dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'analysis', value: true } });

    try {
      const analysis = await apiService.pollAnalysisStatus(repositoryId, (status) => {
        console.log(`Polling status: ${status}`);
      });

      if (analysis) {
        dispatch({ type: ActionTypes.ADD_ANALYSIS, payload: analysis });
        dispatch({ 
          type: ActionTypes.ADD_NOTIFICATION, 
          payload: { 
            type: 'success', 
            title: 'Analysis Complete', 
            message: 'Repository analysis has been completed successfully.' 
          } 
        });
      } else {
        dispatch({ 
          type: ActionTypes.ADD_NOTIFICATION, 
          payload: { 
            type: 'warning', 
            title: 'Analysis Timeout', 
            message: 'Analysis is taking longer than expected. Please check back later.' 
          } 
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      dispatch({ type: ActionTypes.SET_ERROR, payload: { key: 'analysis', value: errorMessage } });
      dispatch({ 
        type: ActionTypes.ADD_NOTIFICATION, 
        payload: { 
          type: 'error', 
          title: 'Analysis Failed', 
          message: errorMessage 
        } 
      });
    } finally {
      // Remove from polling set when done
      pollingRepositoriesRef.current.delete(repositoryId);
      dispatch({ type: ActionTypes.SET_LOADING, payload: { key: 'analysis', value: false } });
    }
  }, []);

  // UI Actions
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: ActionTypes.SET_THEME, payload: theme });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: ActionTypes.TOGGLE_SIDEBAR });
  }, []);

  const setCurrentView = useCallback((view: 'dashboard' | 'repositories' | 'analyses' | 'settings') => {
    dispatch({ type: ActionTypes.SET_CURRENT_VIEW, payload: view });
  }, []);

  const showNotification = useCallback((
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    dispatch({ 
      type: ActionTypes.ADD_NOTIFICATION, 
      payload: { type, title, message } 
    });
  }, []);

  const clearErrors = useCallback((key?: keyof ErrorState) => {
    dispatch({ type: ActionTypes.CLEAR_ERROR, payload: key });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_STATE });
  }, []);

  // Load initial data
  useEffect(() => {
    loadRepositories();
    loadAnalyses();
  }, [loadRepositories, loadAnalyses]);

  const contextValue: AppContextValue = {
    state,
    dispatch,
    actions: {
      loadRepositories,
      createRepository,
      updateRepository,
      deleteRepository,
      selectRepository,
      loadAnalyses,
      loadAnalysisForRepository,
      pollAnalysisStatus,
      setTheme,
      toggleSidebar,
      setCurrentView,
      showNotification,
      clearErrors,
      resetState,
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom Hook
export const useApp = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Selector Hooks for Performance
export const useRepositories = () => {
  const { state } = useApp();
  return state.repositories;
};

export const useSelectedRepository = () => {
  const { state } = useApp();
  return state.selectedRepository;
};

export const useAnalyses = () => {
  const { state } = useApp();
  return state.analyses;
};

export const useSelectedAnalysis = () => {
  const { state } = useApp();
  return state.selectedAnalysis;
};

export const useLoading = () => {
  const { state } = useApp();
  return state.loading;
};

export const useErrors = () => {
  const { state } = useApp();
  return state.error;
};

export const useUI = () => {
  const { state } = useApp();
  return state.ui;
};
