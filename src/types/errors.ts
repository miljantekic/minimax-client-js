/**
 * Error types for the Minimax client library
 */

import { MinimaxErrorResponse } from './index';

/**
 * Base error class for all Minimax client errors
 */
export class MinimaxError extends Error {
  /**
   * HTTP status code (if applicable)
   */
  public statusCode?: number;

  /**
   * Original error object
   */
  public originalError?: any;

  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message);
    this.name = 'MinimaxError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends MinimaxError {
  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message, statusCode, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a request fails due to invalid parameters
 */
export class ValidationError extends MinimaxError {
  /**
   * Validation errors by field
   */
  public validationErrors?: Record<string, string[]>;

  constructor(message: string, validationErrors?: Record<string, string[]>, statusCode?: number, originalError?: any) {
    super(message, statusCode, originalError);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends MinimaxError {
  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message, statusCode, originalError);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when a concurrency conflict occurs
 */
export class ConcurrencyError extends MinimaxError {
  /**
   * Current RowVersion from the server
   */
  public currentRowVersion?: string;

  constructor(message: string, currentRowVersion?: string, statusCode?: number, originalError?: any) {
    super(message, statusCode, originalError);
    this.name = 'ConcurrencyError';
    this.currentRowVersion = currentRowVersion;
  }
}

/**
 * Error thrown when the API rate limit is exceeded
 */
export class RateLimitError extends MinimaxError {
  /**
   * Time in seconds to wait before retrying
   */
  public retryAfter?: number;

  constructor(message: string, retryAfter?: number, statusCode?: number, originalError?: any) {
    super(message, statusCode, originalError);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when the server returns an unexpected response
 */
export class ServerError extends MinimaxError {
  constructor(message: string, statusCode?: number, originalError?: any) {
    super(message, statusCode, originalError);
    this.name = 'ServerError';
  }
}

/**
 * Error thrown when a network error occurs
 */
export class NetworkError extends MinimaxError {
  constructor(message: string, originalError?: any) {
    super(message, undefined, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Factory function to create an appropriate error from an API error response
 */
export function createErrorFromResponse(
  errorResponse: MinimaxErrorResponse,
  statusCode?: number,
  originalError?: any
): MinimaxError {
  const message = errorResponse.error_description || 
                 errorResponse.message || 
                 errorResponse.error || 
                 'Unknown API error';

  // Check for specific error types based on status code and message
  if (statusCode === 401 || statusCode === 403 || message.toLowerCase().includes('auth')) {
    return new AuthenticationError(message, statusCode, originalError);
  }

  if (statusCode === 404 || message.toLowerCase().includes('not found')) {
    return new NotFoundError(message, statusCode, originalError);
  }

  if (statusCode === 409 || message.toLowerCase().includes('concurrency') || message.toLowerCase().includes('rowversion')) {
    // Extract current RowVersion if available
    const rowVersionMatch = message.match(/RowVersion:\s*([^\s]+)/i);
    const currentRowVersion = rowVersionMatch ? rowVersionMatch[1] : undefined;
    return new ConcurrencyError(message, currentRowVersion, statusCode, originalError);
  }

  if (statusCode === 422 || statusCode === 400) {
    // Try to extract validation errors if available
    let validationErrors: Record<string, string[]> | undefined;
    try {
      if (typeof errorResponse.details === 'string') {
        validationErrors = JSON.parse(errorResponse.details);
      }
    } catch (e) {
      // Ignore parsing errors
    }
    return new ValidationError(message, validationErrors, statusCode, originalError);
  }

  if (statusCode === 429) {
    // Try to extract retry-after header if available
    let retryAfter: number | undefined;
    if (originalError?.response?.headers?.['retry-after']) {
      retryAfter = parseInt(originalError.response.headers['retry-after'], 10);
    }
    return new RateLimitError(message, retryAfter, statusCode, originalError);
  }

  if (statusCode && statusCode >= 500) {
    return new ServerError(message, statusCode, originalError);
  }

  // Default to generic MinimaxError
  return new MinimaxError(message, statusCode, originalError);
}
