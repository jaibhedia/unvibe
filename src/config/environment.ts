/**
 * Environment Configuration
 * Centralized configuration management for different environments
 */

interface EnvironmentConfig {
  API_BASE_URL: string;
  JSON_SERVER_URL: string;
  APP_NAME: string;
  VERSION: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  ENABLE_MOCK_DATA: boolean;
  API_TIMEOUT: number;
  POLLING_INTERVAL: number;
  MAX_RETRY_ATTEMPTS: number;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  return {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    JSON_SERVER_URL: import.meta.env.VITE_JSON_SERVER_URL || 'http://localhost:3001',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Vibe Reverse Engineer Platform',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENVIRONMENT: isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
    ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || isDevelopment,
    API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    POLLING_INTERVAL: parseInt(import.meta.env.VITE_POLLING_INTERVAL || '2000'),
    MAX_RETRY_ATTEMPTS: parseInt(import.meta.env.VITE_MAX_RETRY_ATTEMPTS || '3'),
  };
};

export const config = getEnvironmentConfig();

export default config;
