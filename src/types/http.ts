/**
 * HTTP client type definitions for the Minimax client library
 */

import { AxiosRequestConfig } from 'axios';
import { MinimaxToken } from './index';

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Simple HTTP request options
 */
export interface HttpRequestOptions extends Omit<AxiosRequestConfig, 'method' | 'url'> {
  /**
   * Whether to include authentication headers
   * @default true
   */
  authenticate?: boolean;
  
  /**
   * Organization ID to use for the request
   * If not provided, the default organization ID from the client config will be used
   */
  orgId?: string;
  
  /**
   * Additional metadata for the request
   * This is used internally by interceptors and middleware
   */
  metadata?: Record<string, any>;
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
