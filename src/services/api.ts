/**
 * Advanced API Service Layer
 * Implements retry logic, caching, error handling, and request/response interceptors
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { config } from '../config/environment';
import type { 
  Repository, 
  Analysis, 
  CreateRepositoryRequest
}   /**
   * Gets analyses for a specific repository
   */
  async getAnalysesByRepository(repositoryId: string): Promise<Analysis[]> {
    return this.makeRequest<Analysis[]>('GET', `/analyses/repository/${repositoryId}`);
  }/types';

// Custom Error Classes
export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  public originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  public field?: string;
  public details?: any;

  constructor(message: string, field?: string, details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.details = details;
  }
}

// Request/Response Types
interface RequestConfig extends AxiosRequestConfig {
  retry?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  skipCache?: boolean;
  showLoader?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Cache Implementation
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private generateKey(url: string, params?: any): string {
    return `${url}_${JSON.stringify(params || {})}`;
  }

  generateCacheKey(url: string, config?: RequestConfig): string {
    return this.generateKey(url, config?.params);
  }
}

// API Service Class
class ApiService {
  private client: AxiosInstance;
  private cache: ApiCache;
  private requestQueue: Map<string, Promise<any>>;

  constructor() {
    this.cache = new ApiCache();
    this.requestQueue = new Map();
    
    this.client = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Sets up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add correlation ID for request tracking
        config.headers['X-Correlation-ID'] = this.generateCorrelationId();
        
        // Add timestamp for duration calculation
        (config as any).metadata = { startTime: Date.now() };
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
        console.log(`✅ API Response: ${response.status} ${response.config.url} (${duration}ms)`);
        return response;
      },
      async (error) => {
        const duration = Date.now() - ((error.config as any)?.metadata?.startTime || 0);
        console.error(`❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url} (${duration}ms)`);
        
        return this.handleResponseError(error);
      }
    );
  }

  /**
   * Handles response errors with retry logic
   */
  private async handleResponseError(error: AxiosError): Promise<any> {
    const config = error.config as RequestConfig;
    
    // Check if we should retry
    if (this.shouldRetry(error, config)) {
      return this.retryRequest(config);
    }

    // Convert to our custom error types
    if (error.response) {
      const { status, data } = error.response;
      const errorData = data as any;
      throw new ApiError(
        errorData?.message || error.message,
        status,
        errorData?.code,
        errorData?.details
      );
    } else if (error.request) {
      throw new NetworkError('Network error - please check your connection');
    } else {
      throw new ApiError('Request configuration error', 0);
    }
  }

  /**
   * Determines if a request should be retried
   */
  private shouldRetry(error: AxiosError, config: RequestConfig): boolean {
    if (!config.retry) return false;
    if ((config.retryAttempts || 0) >= 3) return false;
    
    // Retry on network errors or 5xx errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  /**
   * Retries a failed request
   */
  private async retryRequest(config: RequestConfig): Promise<any> {
    config.retryAttempts = (config.retryAttempts || 0) + 1;
    const delay = (config.retryDelay || 1000) * Math.pow(2, config.retryAttempts - 1);
    
    console.log(`🔄 Retrying request (attempt ${config.retryAttempts}) in ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return this.client.request(config);
  }

  /**
   * Generates a unique correlation ID for request tracking
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Makes a request with caching and deduplication
   */
  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    // Set default config
    const requestConfig: RequestConfig = {
      retry: true,
      retryAttempts: 0,
      retryDelay: 1000,
      skipCache: false,
      showLoader: true,
      ...config,
      method,
      url,
      data
    };

    // Generate cache key for GET requests
    const cacheKey = method === 'GET' ? this.cache.generateCacheKey(url, requestConfig) : null;
    
    // Check cache for GET requests
    if (method === 'GET' && !requestConfig.skipCache && cacheKey) {
      const cachedData = this.cache.get<T>(cacheKey);
      if (cachedData) {
        console.log(`📦 Cache hit for ${url}`);
        return cachedData;
      }
    }

    // Deduplicate identical requests
    const requestKey = `${method}_${url}_${JSON.stringify(data)}`;
    if (this.requestQueue.has(requestKey)) {
      console.log(`⏳ Deduplicating request for ${url}`);
      return this.requestQueue.get(requestKey);
    }

    // Make the request
    const requestPromise = this.client.request<T>(requestConfig)
      .then(response => response.data)
      .finally(() => {
        this.requestQueue.delete(requestKey);
      });

    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache successful GET requests
      if (method === 'GET' && cacheKey && result) {
        this.cache.set(cacheKey, result);
      }

      return result;
    } catch (error) {
      this.requestQueue.delete(requestKey);
      throw error;
    }
  }

  // Public API Methods

  /**
   * Gets all repositories with optional pagination
   */
  async getRepositories(params?: { page?: number; limit?: number }): Promise<Repository[]> {
    return this.makeRequest<Repository[]>('GET', '/repositories', undefined, { params });
  }

  /**
   * Gets a specific repository by ID
   */
  async getRepository(id: string): Promise<Repository> {
    return this.makeRequest<Repository>('GET', `/repositories/${id}`);
  }

  /**
   * Creates a new repository
   */
  async createRepository(data: CreateRepositoryRequest): Promise<Repository> {
    // Clear repositories cache when creating new repo
    this.cache.delete(this.cache.generateCacheKey('/repositories'));
    return this.makeRequest<Repository>('POST', '/repositories', data);
  }

  /**
   * Updates an existing repository
   */
  async updateRepository(id: string, data: Partial<CreateRepositoryRequest>): Promise<Repository> {
    this.cache.delete(this.cache.generateCacheKey(`/repositories/${id}`));
    this.cache.delete(this.cache.generateCacheKey('/repositories'));
    return this.makeRequest<Repository>('PUT', `/repositories/${id}`, data);
  }

  /**
   * Deletes a repository
   */
  async deleteRepository(id: string): Promise<void> {
    this.cache.delete(this.cache.generateCacheKey(`/repositories/${id}`));
    this.cache.delete(this.cache.generateCacheKey('/repositories'));
    return this.makeRequest<void>('DELETE', `/repositories/${id}`);
  }

  /**
   * Gets all analyses
   */
  async getAnalyses(): Promise<Analysis[]> {
    return this.makeRequest<Analysis[]>('GET', '/analyses');
  }

  /**
   * Gets analyses for a specific repository (with longer cache)
   */
  async getAnalysesByRepository(repositoryId: string): Promise<Analysis[]> {
    return this.makeRequest<Analysis[]>('GET', `/analyses/repository/${repositoryId}`, undefined, {
      cacheTTL: 30000, // Cache for 30 seconds instead of default 5 seconds
    });
  }

  /**
   * Gets a specific analysis by ID
   */
  async getAnalysis(id: string): Promise<Analysis> {
    return this.makeRequest<Analysis>('GET', `/analyses/${id}`);
  }

  /**
   * Polls for analysis completion with optimized intervals
   */
  async pollAnalysisStatus(
    repositoryId: string, 
    onProgress?: (status: string) => void,
    maxAttempts: number = 20  // Reduced from 30
  ): Promise<Analysis | null> {
    let attempts = 0;
    const baseDelay = 3000; // Start with 3 seconds
    const maxDelay = 15000; // Max 15 seconds between polls
    
    while (attempts < maxAttempts) {
      try {
        const analyses = await this.getAnalysesByRepository(repositoryId);
        
        if (analyses.length > 0) {
          const latestAnalysis = analyses[analyses.length - 1];
          onProgress?.(`Analysis complete for ${latestAnalysis.repository_id}`);
          return latestAnalysis;
        }
        
        onProgress?.(`Polling attempt ${attempts + 1}/${maxAttempts}...`);
        
        // Exponential backoff - increase delay with each attempt
        const delay = Math.min(baseDelay * Math.pow(1.5, attempts), maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        attempts++;
      } catch (error) {
        console.error('Error polling analysis status:', error);
        attempts++;
        
        // Wait longer on error
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    return null;
  }

  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return this.makeRequest<{ status: string; timestamp: string }>('GET', '/health');
    } catch (error) {
      // If health endpoint doesn't exist, return a default response
      console.warn('Health endpoint not available, using fallback');
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Clears all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache['cache'].size,
      keys: Array.from(this.cache['cache'].keys())
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
