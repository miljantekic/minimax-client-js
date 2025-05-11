/**
 * Retry mechanism for the Minimax API client
 * 
 * This module provides functionality for retrying failed API requests
 */

import axios, { AxiosError } from 'axios';
import { NetworkError, ServerError, RateLimitError } from '../types';

/**
 * Retry configuration options
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Maximum delay between retries in milliseconds
   * @default 30000
   */
  maxRetryDelay?: number;

  /**
   * Whether to use exponential backoff for retry delays
   * @default true
   */
  useExponentialBackoff?: boolean;

  /**
   * Factor to multiply the delay by for exponential backoff
   * @default 2
   */
  backoffFactor?: number;

  /**
   * Jitter factor to add randomness to retry delays (0-1)
   * @default 0.1
   */
  jitter?: number;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryStatusCodes?: number[];

  /**
   * Custom function to determine if a request should be retried
   */
  retryCondition?: (error: any, retryCount: number) => boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  maxRetryDelay: 30000,
  useExponentialBackoff: true,
  backoffFactor: 2,
  jitter: 0.1,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  retryCondition: undefined as any
};

/**
 * Retry strategy interface
 */
export interface RetryStrategy {
  /**
   * Determine if a request should be retried
   * 
   * @param error - Error from the failed request
   * @param retryCount - Current retry count
   * @returns Whether the request should be retried
   */
  shouldRetry(error: any, retryCount: number): boolean;

  /**
   * Calculate the delay before the next retry
   * 
   * @param retryCount - Current retry count
   * @param error - Error from the failed request
   * @returns Delay in milliseconds
   */
  getRetryDelay(retryCount: number, error: any): number;
}

/**
 * Default retry strategy implementation
 */
export class DefaultRetryStrategy implements RetryStrategy {
  private config: Required<RetryConfig>;

  /**
   * Create a new retry strategy
   * 
   * @param config - Retry configuration
   */
  constructor(config: RetryConfig = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Determine if a request should be retried
   * 
   * @param error - Error from the failed request
   * @param retryCount - Current retry count
   * @returns Whether the request should be retried
   */
  public shouldRetry(error: any, retryCount: number): boolean {
    // Don't retry if we've reached the maximum number of retries
    if (retryCount >= this.config.maxRetries) {
      return false;
    }

    // Use custom retry condition if provided
    if (this.config.retryCondition) {
      return this.config.retryCondition(error, retryCount);
    }

    // Retry network errors
    if (error instanceof NetworkError) {
      return true;
    }

    // Retry rate limit errors
    if (error instanceof RateLimitError) {
      return true;
    }

    // Retry server errors
    if (error instanceof ServerError) {
      return true;
    }

    // Retry based on status code
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status) {
        return this.config.retryStatusCodes.includes(axiosError.response.status);
      }
      
      // Retry network errors (no response)
      if (!axiosError.response && axiosError.request) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate the delay before the next retry
   * 
   * @param retryCount - Current retry count
   * @param error - Error from the failed request
   * @returns Delay in milliseconds
   */
  public getRetryDelay(retryCount: number, error: any): number {
    // For rate limit errors, use the retry-after header if available
    if (error instanceof RateLimitError && error.retryAfter) {
      return error.retryAfter * 1000;
    }

    // Calculate base delay
    let delay = this.config.retryDelay;

    // Apply exponential backoff if enabled
    if (this.config.useExponentialBackoff) {
      delay = delay * Math.pow(this.config.backoffFactor, retryCount);
    }

    // Apply jitter to avoid thundering herd problem
    if (this.config.jitter > 0) {
      const jitterAmount = delay * this.config.jitter;
      delay = delay - jitterAmount + (Math.random() * jitterAmount * 2);
    }

    // Ensure delay doesn't exceed maximum
    return Math.min(delay, this.config.maxRetryDelay);
  }
}

/**
 * Retry handler for managing request retries
 */
export class RetryHandler {
  private strategy: RetryStrategy;

  /**
   * Create a new retry handler
   * 
   * @param config - Retry configuration or custom strategy
   */
  constructor(config: RetryConfig | RetryStrategy = {}) {
    this.strategy = config instanceof Object && 'shouldRetry' in config
      ? config as RetryStrategy
      : new DefaultRetryStrategy(config as RetryConfig);
  }

  /**
   * Execute a function with retry logic
   * 
   * @param fn - Function to execute
   * @returns Promise resolving to the function result
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    let retryCount = 0;
    
    while (true) {
      try {
        return await fn();
      } catch (error) {
        // Check if we should retry
        if (!this.strategy.shouldRetry(error, retryCount)) {
          throw error;
        }
        
        // Increment retry count
        retryCount++;
        
        // Calculate retry delay
        const delay = this.strategy.getRetryDelay(retryCount, error);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
