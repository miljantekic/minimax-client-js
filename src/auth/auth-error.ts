/**
 * Authentication error handling for the Minimax client
 * 
 * This module provides specialized error handling for authentication-related errors
 */

import { 
  MinimaxErrorResponse, 
  AuthenticationError, 
  MinimaxError, 
  createErrorFromResponse 
} from '../types';

/**
 * Authentication error codes from OAuth2 responses
 */
export enum AuthErrorCode {
  INVALID_REQUEST = 'invalid_request',
  INVALID_CLIENT = 'invalid_client',
  INVALID_GRANT = 'invalid_grant',
  UNAUTHORIZED_CLIENT = 'unauthorized_client',
  UNSUPPORTED_GRANT_TYPE = 'unsupported_grant_type',
  INVALID_SCOPE = 'invalid_scope',
  ACCESS_DENIED = 'access_denied',
  SERVER_ERROR = 'server_error',
  TEMPORARILY_UNAVAILABLE = 'temporarily_unavailable',
}

/**
 * Create a specialized authentication error from an OAuth2 error response
 * 
 * @param errorResponse - Error response from the OAuth2 server
 * @param statusCode - HTTP status code
 * @param originalError - Original error object
 * @returns Appropriate authentication error
 */
export function createAuthError(
  errorResponse: MinimaxErrorResponse,
  statusCode?: number,
  originalError?: any
): AuthenticationError {
  // Get the error code from the response
  const errorCode = errorResponse.error as AuthErrorCode;
  
  // Create a more descriptive message based on the error code
  let message = 'Authentication failed';
  
  // If there's no error code, just use the error description if available
  if (!errorCode) {
    message = errorResponse.error_description || message;
    return new AuthenticationError(message, statusCode, originalError);
  }
  
  switch (errorCode) {
    case AuthErrorCode.INVALID_CLIENT:
      message = 'Invalid client credentials. Check your client ID and client secret.';
      break;
    case AuthErrorCode.INVALID_GRANT:
      message = 'Invalid user credentials or refresh token. Please check your username and password.';
      break;
    case AuthErrorCode.INVALID_REQUEST:
      message = 'Invalid authentication request. Please check your request parameters.';
      break;
    case AuthErrorCode.UNAUTHORIZED_CLIENT:
      message = 'This client is not authorized to use this authentication method.';
      break;
    case AuthErrorCode.UNSUPPORTED_GRANT_TYPE:
      message = 'The requested grant type is not supported by the authorization server.';
      break;
    case AuthErrorCode.INVALID_SCOPE:
      message = 'The requested scope is invalid or unknown.';
      break;
    case AuthErrorCode.ACCESS_DENIED:
      message = 'The resource owner denied the request.';
      break;
    case AuthErrorCode.SERVER_ERROR:
      message = 'The authorization server encountered an unexpected error.';
      break;
    case AuthErrorCode.TEMPORARILY_UNAVAILABLE:
      message = 'The authorization server is temporarily unavailable.';
      break;
  }
  
  // If there's an original error description, append it
  if (errorResponse.error_description) {
    message += ` (${errorResponse.error_description})`;
  }
  
  return new AuthenticationError(message, statusCode, originalError);
}

/**
 * Handle authentication errors from API responses
 * 
 * @param error - Error object from API call
 * @returns Appropriate error object
 */
export function handleAuthError(error: any): MinimaxError {
  // Check if it's an axios error with a response
  if (error.response) {
    const { data, status } = error.response;
    
    // If it's an OAuth2 error response
    if (data && (data.error || data.error_description)) {
      return createAuthError(data, status, error);
    }
    
    // Otherwise, use the general error handler
    if (data) {
      return createErrorFromResponse(data, status, error);
    }
  }
  
  // If it's a network error
  if (error.request && !error.response) {
    return new MinimaxError(
      'Network error during authentication. Please check your connection.',
      undefined,
      error
    );
  }
  
  // For any other error, return a generic authentication error
  return new AuthenticationError(
    error.message || 'Authentication failed',
    error.statusCode,
    error
  );
}

/**
 * Check if an error is related to account lockout
 * 
 * @param error - Error object to check
 * @returns Whether the error indicates an account lockout
 */
export function isAccountLockoutError(error: any): boolean {
  if (error instanceof AuthenticationError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('locked') || 
      message.includes('lockout') || 
      message.includes('too many attempts')
    );
  }
  return false;
}

/**
 * Check if an error is related to invalid credentials
 * 
 * @param error - Error object to check
 * @returns Whether the error indicates invalid credentials
 */
export function isInvalidCredentialsError(error: any): boolean {
  if (error instanceof AuthenticationError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('invalid') && 
      (message.includes('credentials') || 
       message.includes('username') || 
       message.includes('password'))
    );
  }
  return false;
}

/**
 * Check if an error is related to an expired token
 * 
 * @param error - Error object to check
 * @returns Whether the error indicates an expired token
 */
export function isTokenExpiredError(error: any): boolean {
  if (error instanceof AuthenticationError) {
    const message = error.message.toLowerCase();
    return (
      message.includes('expired') || 
      message.includes('invalid token') || 
      error.statusCode === 401
    );
  }
  return false;
}
