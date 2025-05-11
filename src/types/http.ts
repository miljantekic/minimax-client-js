/**
 * HTTP client type definitions for the Minimax client library
 */

import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { MinimaxToken } from './index';

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * HTTP request options
 */
export interface HttpRequestOptions extends Omit<AxiosRequestConfig, 'method' | 'url'> {
  /**
   * Whether to include authentication headers
   * @default true
   */
  authenticate?: boolean;

  /**
   * Whether to automatically retry on failure
   * @default true
   */
  retry?: boolean;

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number;

  /**
   * Whether to handle rate limiting automatically
   * @default true
   */
  handleRateLimit?: boolean;

  /**
   * Organization ID to use for the request
   * If not provided, the default organization ID from the client config will be used
   */
  orgId?: string;
}

/**
 * HTTP request interceptor function
 */
export type RequestInterceptor = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * HTTP response interceptor function
 */
export type ResponseInterceptor = (
  response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;

/**
 * HTTP error interceptor function
 */
export type ErrorInterceptor = (
  error: AxiosError
) => Promise<never> | Promise<AxiosResponse>;

/**
 * Authentication state
 */
export interface AuthState {
  /**
   * Current token
   */
  token: MinimaxToken | null;

  /**
   * Whether authentication is in progress
   */
  authenticating: boolean;

  /**
   * Promise for the current authentication request
   */
  authPromise: Promise<MinimaxToken> | null;
}

/**
 * Token storage interface
 */
export interface TokenStorage {
  /**
   * Save a token
   */
  saveToken(token: MinimaxToken): Promise<void>;

  /**
   * Get the current token
   */
  getToken(): Promise<MinimaxToken | null>;

  /**
   * Clear the current token
   */
  clearToken(): Promise<void>;
}

/**
 * In-memory token storage implementation
 */
export class MemoryTokenStorage implements TokenStorage {
  private token: MinimaxToken | null = null;

  async saveToken(token: MinimaxToken): Promise<void> {
    this.token = token;
  }

  async getToken(): Promise<MinimaxToken | null> {
    return this.token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
  }
}
