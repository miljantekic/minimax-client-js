/**
 * Minimax API Client
 * A TypeScript client for the Minimax accounting API
 */

// Export version
export const VERSION = '0.1.0';

// Export authentication module and token storage implementations
export {
  OAuth2Client,
  FileTokenStorage,
  FileTokenStorageOptions,
  EnvTokenStorage,
  EnvTokenStorageOptions,
  CustomTokenStorage,
  CustomTokenStorageOptions,
  SessionManager
} from './auth';

// Export HTTP client module
export {
  HttpClient,
  HttpClientOptions,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorMiddleware,
  RetryConfig,
  RetryStrategy,
  RowVersionHandler
} from './http';

// Export types
export * from './types';
