/**
 * Optimized API Service Layer
 * Implements exponential backoff polling, caching, error handling, and duplicate request prevention
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { config } from '../config/environment';
import type { 
  Repository, 
  Analysis, 
  CreateRepositoryRequest
} from '../types';

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

// Simple Cache Implementation
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMs = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Advanced API Service with optimized polling and caching
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private cache = new SimpleCache();
  private activePolls = new Set<string>();

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        const apiError = new ApiError(
          error.message || 'Request failed',
          error.response?.status || 500,
          error.code,
          error.response?.data
        );
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${apiError.status}`, apiError);
        return Promise.reject(apiError);
      }
    );
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url: endpoint,
        data,
        ...config,
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Request failed', 500, 'UNKNOWN_ERROR', error);
    }
  }

  // Repository Methods
  async getRepositories(): Promise<Repository[]> {
    const cacheKey = 'repositories';
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Cache hit for repositories');
      return cached;
    }

    const data = await this.makeRequest<Repository[]>('GET', '/repositories');
    this.cache.set(cacheKey, data);
    return data;
  }

  async getRepository(id: string): Promise<Repository> {
    const cacheKey = `repository-${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for repository ${id}`);
      return cached;
    }

    const data = await this.makeRequest<Repository>('GET', `/repositories/${id}`);
    this.cache.set(cacheKey, data);
    return data;
  }

  async createRepository(repositoryData: CreateRepositoryRequest): Promise<Repository> {
    const data = await this.makeRequest<Repository>('POST', '/repositories', repositoryData);
    this.cache.invalidate('repositories');
    return data;
  }

  async updateRepository(id: string, repositoryData: Partial<Repository>): Promise<Repository> {
    const data = await this.makeRequest<Repository>('PUT', `/repositories/${id}`, repositoryData);
    this.cache.invalidate(`repository-${id}`);
    this.cache.invalidate('repositories');
    return data;
  }

  async deleteRepository(id: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/repositories/${id}`);
    this.cache.invalidate(`repository-${id}`);
    this.cache.invalidate('repositories');
  }

  // Analysis Methods
  async getAnalyses(): Promise<Analysis[]> {
    const cacheKey = 'analyses';
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('📦 Cache hit for analyses');
      return cached;
    }

    const data = await this.makeRequest<Analysis[]>('GET', '/analyses');
    this.cache.set(cacheKey, data);
    return data;
  }

  async getAnalysis(id: string): Promise<Analysis> {
    const cacheKey = `analysis-${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for analysis ${id}`);
      return cached;
    }

    const data = await this.makeRequest<Analysis>('GET', `/analyses/${id}`);
    this.cache.set(cacheKey, data);
    return data;
  }

  async getAnalysesByRepository(repositoryId: string): Promise<Analysis[]> {
    const cacheKey = `analyses-repo-${repositoryId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for repository analyses ${repositoryId}`);
      return cached;
    }

    const data = await this.makeRequest<Analysis[]>('GET', `/analyses/repository/${repositoryId}`);
    this.cache.set(cacheKey, data);
    return data;
  }

  async createAnalysis(repositoryId: string): Promise<Analysis> {
    const data = await this.makeRequest<Analysis>('POST', `/analyses`, { repository_id: repositoryId });
    this.cache.invalidate('analyses');
    this.cache.invalidate(`analyses-repo-${repositoryId}`);
    return data;
  }

  async deleteAnalysis(id: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/analyses/${id}`);
    this.cache.invalidate('analyses');
  }

  /**
   * Optimized polling with exponential backoff and duplicate prevention
   */
  async pollAnalysisStatus(
    repositoryId: string, 
    onUpdate?: (analysis: Analysis) => void,
    onComplete?: (analysis: Analysis) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    const pollKey = `poll-${repositoryId}`;
    
    // Prevent duplicate polling for the same repository
    if (this.activePolls.has(pollKey)) {
      console.log(`⏭️ Skipping duplicate poll for repository ${repositoryId}`);
      return;
    }

    this.activePolls.add(pollKey);
    console.log(`🔄 Starting optimized polling for repository ${repositoryId}`);

    let attempt = 0;
    const maxAttempts = 20;
    const baseDelay = 3000; // Start with 3 seconds
    const maxDelay = 15000; // Cap at 15 seconds

    const poll = async (): Promise<void> => {
      try {
        attempt++;
        console.log(`🔍 Polling attempt ${attempt}/${maxAttempts} for repository ${repositoryId}`);

        const analyses = await this.getAnalysesByRepository(repositoryId);
        const latestAnalysis = analyses[analyses.length - 1];

        if (latestAnalysis) {
          onUpdate?.(latestAnalysis);

          // Check if analysis is complete (has meaningful data)
          if (latestAnalysis.file_structure && 
              Object.keys(latestAnalysis.file_structure).length > 0 &&
              latestAnalysis.technologies_detected.length > 0) {
            console.log(`✅ Analysis complete for repository ${repositoryId}`);
            this.activePolls.delete(pollKey);
            onComplete?.(latestAnalysis);
            return;
          }
        }

        // Continue polling if not complete and under max attempts
        if (attempt < maxAttempts) {
          // Exponential backoff with jitter
          const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), maxDelay);
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const finalDelay = delay + jitter;
          
          console.log(`⏰ Next poll in ${Math.round(finalDelay / 1000)}s for repository ${repositoryId}`);
          setTimeout(poll, finalDelay);
        } else {
          console.log(`⏰ Max polling attempts reached for repository ${repositoryId}`);
          this.activePolls.delete(pollKey);
          onError?.(new Error('Analysis polling timeout'));
        }
      } catch (error) {
        console.error(`❌ Polling error for repository ${repositoryId}:`, error);
        this.activePolls.delete(pollKey);
        onError?.(error instanceof Error ? error : new Error('Polling failed'));
      }
    };

    // Start polling
    poll();
  }

  /**
   * Stop polling for a specific repository
   */
  stopPolling(repositoryId: string): void {
    const pollKey = `poll-${repositoryId}`;
    this.activePolls.delete(pollKey);
    console.log(`⏹️ Stopped polling for repository ${repositoryId}`);
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.invalidate();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
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
