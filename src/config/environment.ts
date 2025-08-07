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
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || (
      isProduction 
        ? 'https://your-backend-url.onrender.com' // Will be replaced with actual URL
        : 'http://127.0.0.1:8000'
    ),
    JSON_SERVER_URL: 'http://localhost:3001',
    APP_NAME: import.meta.env.VITE_APP_NAME || 'Vibe',
    VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ENVIRONMENT: isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
    ENABLE_MOCK_DATA: !isProduction,
    API_TIMEOUT: 30000,
    POLLING_INTERVAL: isProduction ? 5000 : 3000,
    MAX_RETRY_ATTEMPTS: 3,
  };
};

export const config = getEnvironmentConfig();

export default config;
