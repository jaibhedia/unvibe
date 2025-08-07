/**
 * TypeScript interfaces and types for the application
 * Centralized type definitions for better maintainability
 */

// Core Domain Types
export interface Repository {
  id: string;
  url: string;
  name: string;
  description?: string;
  language?: string;
  framework?: string;
  analysis_status: AnalysisStatus;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  repository_id: string;
  file_structure: FileStructure;
  technologies_detected: string[];
  complexity_score: number;
  vibe_patterns: string[];
  recommendations: string[];
  created_at: string;
  metrics?: AnalysisMetrics;
}

export interface FileStructure {
  [key: string]: string | string[] | FileStructure;
}

export interface AnalysisMetrics {
  lines_of_code: number;
  file_count: number;
  dependency_count: number;
  test_coverage?: number;
  maintainability_index: number;
  technical_debt_ratio: number;
}

// API Types
export interface CreateRepositoryRequest {
  url: string;
  name: string;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface FormComponentProps extends ComponentProps {
  isLoading?: boolean;
  disabled?: boolean;
  error?: string;
}

// State Management Types
export interface AppState {
  repositories: Repository[];
  analyses: Analysis[];
  selectedRepository: Repository | null;
  selectedAnalysis: Analysis | null;
  loading: LoadingState;
  error: ErrorState;
  ui: UIState;
}

export interface LoadingState {
  repositories: boolean;
  analyses: boolean;
  submission: boolean;
  analysis: boolean;
}

export interface ErrorState {
  repositories: string | null;
  analyses: string | null;
  submission: string | null;
  analysis: string | null;
  network: string | null;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'repositories' | 'analyses' | 'settings';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

// Constants and Enums
export const AnalysisStatus = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export type AnalysisStatus = typeof AnalysisStatus[keyof typeof AnalysisStatus];

export const ComplexityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  VERY_HIGH: 'very_high'
} as const;

export type ComplexityLevel = typeof ComplexityLevel[keyof typeof ComplexityLevel];

export const FileType = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  CSS: 'css',
  HTML: 'html',
  JSON: 'json',
  MARKDOWN: 'markdown',
  CONFIG: 'config',
  OTHER: 'other'
} as const;

export type FileType = typeof FileType[keyof typeof FileType];

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event Types
export interface RepositorySubmitEvent {
  repository: CreateRepositoryRequest;
  timestamp: string;
}

export interface AnalysisCompleteEvent {
  analysis: Analysis;
  repository: Repository;
  timestamp: string;
}

// Chart Data Types
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: {
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    title: {
      display: boolean;
      text: string;
    };
  };
}

// React Flow Types
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type: FileType;
    size?: number;
    lastModified?: string;
  };
  style?: React.CSSProperties;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
}
