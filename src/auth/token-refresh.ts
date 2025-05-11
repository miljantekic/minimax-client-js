/**
 * Token refresh handling for the Minimax client
 * 
 * This module provides functionality for automatically refreshing OAuth2 tokens
 */

import { OAuth2Client } from './oauth2';
import { MinimaxToken, AuthenticationError, NetworkError } from '../types';

/**
 * Token refresh options
 */
export interface TokenRefreshOptions {
  /**
   * Buffer time in milliseconds before token expiration when refresh should be attempted
   * @default 60000 (1 minute)
   */
  refreshBuffer?: number;

  /**
   * Maximum number of refresh attempts before failing
   * @default 3
   */
  maxRefreshAttempts?: number;

  /**
   * Delay between refresh attempts in milliseconds
   * @default 1000 (1 second)
   */
  refreshRetryDelay?: number;
}

/**
 * Default token refresh options
 */
const DEFAULT_TOKEN_REFRESH_OPTIONS: Required<TokenRefreshOptions> = {
  refreshBuffer: 60000, // 1 minute
  maxRefreshAttempts: 3,
  refreshRetryDelay: 1000, // 1 second
};

/**
 * Token refresh manager
 * 
 * Handles automatic refreshing of OAuth2 tokens
 */
export class TokenRefreshManager {
  private readonly oauth2Client: OAuth2Client;
  private readonly options: Required<TokenRefreshOptions>;
  private refreshPromise: Promise<MinimaxToken> | null = null;
  private refreshing = false;

  /**
   * Create a new token refresh manager
   * 
   * @param oauth2Client - OAuth2 client instance
   * @param options - Token refresh options
   */
  constructor(oauth2Client: OAuth2Client, options: TokenRefreshOptions = {}) {
    this.oauth2Client = oauth2Client;
    this.options = {
      ...DEFAULT_TOKEN_REFRESH_OPTIONS,
      ...options,
    };
  }

  /**
   * Get a valid token, refreshing if necessary
   * 
   * @returns Promise resolving to a valid token
   * @throws {AuthenticationError} If authentication fails
   * @throws {NetworkError} If a network error occurs
   */
  public async getValidToken(): Promise<MinimaxToken> {
    // If we're already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Get the current token
    const token = await this.oauth2Client.getToken();

    // Check if token is valid
    if (this.oauth2Client.isTokenValid(token, this.options.refreshBuffer)) {
      return token as MinimaxToken;
    }

    // If token is not valid but we have a refresh token, refresh it
    if (token && token.refresh_token) {
      return this.refreshToken(token.refresh_token);
    }

    // No valid token and no refresh token
    throw new AuthenticationError(
      'No valid token available and no refresh token to obtain a new one',
      401
    );
  }

  /**
   * Refresh the token
   * 
   * @param refreshToken - Refresh token to use
   * @returns Promise resolving to the new token
   * @throws {AuthenticationError} If token refresh fails
   * @throws {NetworkError} If a network error occurs
   */
  private async refreshToken(refreshToken: string): Promise<MinimaxToken> {
    // If we're already refreshing, return the existing promise
    if (this.refreshing) {
      if (!this.refreshPromise) {
        // This shouldn't happen, but just in case
        this.refreshPromise = this.oauth2Client.refreshToken(refreshToken);
      }
      return this.refreshPromise;
    }

    // Start refreshing
    this.refreshing = true;
    
    // Create a new refresh promise
    this.refreshPromise = this.attemptRefresh(refreshToken, 0);
    
    try {
      // Wait for the refresh to complete
      const token = await this.refreshPromise;
      return token;
    } finally {
      // Reset refresh state
      this.refreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Attempt to refresh the token with retry logic
   * 
   * @param refreshToken - Refresh token to use
   * @param attemptCount - Current attempt count
   * @returns Promise resolving to the new token
   * @throws {AuthenticationError} If token refresh fails after all attempts
   * @throws {NetworkError} If a network error occurs that can't be retried
   */
  private async attemptRefresh(
    refreshToken: string,
    attemptCount: number
  ): Promise<MinimaxToken> {
    try {
      // Attempt to refresh the token
      return await this.oauth2Client.refreshToken(refreshToken);
    } catch (error) {
      // If we've reached the maximum number of attempts, throw the error
      if (attemptCount >= this.options.maxRefreshAttempts - 1) {
        throw error;
      }

      // Only retry certain types of errors
      if (
        error instanceof NetworkError ||
        (error instanceof AuthenticationError && error.statusCode !== 401)
      ) {
        // Wait before retrying
        await new Promise((resolve) => 
          setTimeout(resolve, this.options.refreshRetryDelay)
        );
        
        // Retry with incremented attempt count
        return this.attemptRefresh(refreshToken, attemptCount + 1);
      }

      // Don't retry other errors
      throw error;
    }
  }
}
