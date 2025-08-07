/**
 * Advanced Error Boundary Components
 * Provides comprehensive error handling with recovery mechanisms
 */

import React, { Component, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  lastRetryTime: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  isolateFailure?: boolean;
  showDetails?: boolean;
}

/**
 * Main Error Boundary Class Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastRetryTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Auto-retry logic
    if (this.shouldAutoRetry()) {
      this.scheduleRetry();
    }
  }

  private logError(error: Error, errorInfo: ErrorInfo) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: 'anonymous', // Could be replaced with actual user ID
    };

    // In a real app, send to error tracking service like Sentry
    console.error('ErrorBoundary caught an error:', errorData);

    // Store in local storage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10);
      }
      localStorage.setItem('app_errors', JSON.stringify(existingErrors));
    } catch (e) {
      console.warn('Failed to store error in localStorage:', e);
    }
  }

  private shouldAutoRetry(): boolean {
    const { maxRetries = 3, retryDelay = 5000 } = this.props;
    const { retryCount, lastRetryTime } = this.state;
    
    if (retryCount >= maxRetries) return false;
    
    const timeSinceLastRetry = Date.now() - lastRetryTime;
    return timeSinceLastRetry > retryDelay;
  }

  private scheduleRetry() {
    const { retryDelay = 5000 } = this.props;
    
    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, retryDelay);
  }

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      lastRetryTime: Date.now(),
    }));
  };

  private handleManualRetry = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.handleRetry();
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorInfo, errorId, retryCount } = this.state;
    const { children, fallback, maxRetries = 3, showDetails = true } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleManualRetry}
          onReload={this.handleReload}
          onGoHome={this.handleGoHome}
          showDetails={showDetails}
        />
      );
    }

    return children;
  }
}

/**
 * Error Fallback Component
 */
interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onReload: () => void;
  onGoHome: () => void;
  showDetails: boolean;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  retryCount,
  maxRetries,
  onRetry,
  onReload,
  onGoHome,
  showDetails,
}) => {
  const [showFullError, setShowFullError] = useState(false);
  const [copied, setCopied] = useState(false);

  const errorDetails = {
    message: error?.message || 'Unknown error',
    stack: error?.stack || '',
    componentStack: errorInfo?.componentStack || '',
    errorId,
    timestamp: new Date().toISOString(),
  };

  const copyErrorDetails = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy error details:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-red-200 dark:border-red-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-900 dark:text-red-100">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-lg">
            We encountered an unexpected error. Don't worry, we're here to help you get back on track.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Summary */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bug className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error Details
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm">
                  {error?.message || 'An unexpected error occurred'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                    ID: {errorId}
                  </span>
                  {retryCount > 0 && (
                    <span className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                      Retry {retryCount}/{maxRetries}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onRetry}
              disabled={retryCount >= maxRetries}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              {retryCount >= maxRetries ? 'Max Retries Reached' : 'Try Again'}
            </Button>
            <Button onClick={onReload} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Button onClick={onGoHome} variant="outline" className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>

          {/* Technical Details (collapsible) */}
          {showDetails && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Technical Details
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={copyErrorDetails}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowFullError(!showFullError)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {showFullError ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
              </div>

              {showFullError && (
                <textarea
                  readOnly
                  value={JSON.stringify(errorDetails, null, 2)}
                  className="w-full font-mono text-xs h-48 resize-none border rounded p-2 bg-gray-50 dark:bg-gray-900"
                />
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            If this problem persists, please contact support with the error ID above.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Async Error Boundary Hook for handling promise rejections
 */
export const useAsyncErrorBoundary = () => {
  const { actions } = useApp();

  const handleError = React.useCallback((error: Error) => {
    actions.showNotification('error', 'Async Error', error.message);
    throw error; // Re-throw to be caught by ErrorBoundary
  }, [actions]);

  return { handleError };
};

/**
 * Error Boundary HOC for wrapping components
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Specialized Error Boundaries for different contexts
 */

// For API-related errors
export const ApiErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    maxRetries={2}
    retryDelay={3000}
    onError={(error, errorInfo) => {
      console.error('API Error:', error, errorInfo);
      // Could send to API error tracking
    }}
  >
    {children}
  </ErrorBoundary>
);

// For chart/visualization errors
export const ChartErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    maxRetries={1}
    showDetails={false}
    fallback={
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Chart Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to render visualization
          </p>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

// For form-related errors
export const FormErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    maxRetries={0}
    showDetails={false}
    fallback={
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Form Error
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">
                There was a problem with the form. Please refresh the page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
);
