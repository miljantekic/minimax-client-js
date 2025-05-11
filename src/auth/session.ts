/**
 * Session management for the Minimax client
 * 
 * This module provides session management functionality for the Minimax API
 */

import { OAuth2Client } from './oauth2';
import { TokenRefreshManager } from './token-refresh';
import { 
  MinimaxClientConfig, 
  MinimaxCredentials, 
  MinimaxToken, 
  AuthenticationError
} from '../types';

/**
 * Session options
 */
export interface SessionOptions {
  /**
   * Organization ID to use for API calls
   * If not provided, the first available organization will be used
   */
  organizationId?: string;

  /**
   * Whether to automatically refresh the token when it expires
   * @default true
   */
  autoRefreshToken?: boolean;

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
 * Session state
 */
export interface SessionState {
  /**
   * Whether the session is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Current organization ID
   */
  organizationId: string | null;

  /**
   * Current authentication token
   */
  token: MinimaxToken | null;
}

/**
 * Session manager for the Minimax API
 * 
 * Handles authentication, token refresh, and organization selection
 */
export class SessionManager {
  private readonly oauth2Client: OAuth2Client;
  private readonly tokenRefreshManager: TokenRefreshManager;
  private readonly config: MinimaxClientConfig;
  private currentOrganizationId: string | null = null;

  /**
   * Create a new session manager
   * 
   * @param config - Minimax client configuration
   * @param oauth2Client - OAuth2 client instance
   * @param options - Session options
   */
  constructor(
    config: MinimaxClientConfig,
    oauth2Client: OAuth2Client,
    options: SessionOptions = {}
  ) {
    this.config = config;
    this.oauth2Client = oauth2Client;
    
    // Initialize token refresh manager if auto-refresh is enabled
    const autoRefresh = options.autoRefreshToken !== false;
    this.tokenRefreshManager = autoRefresh
      ? new TokenRefreshManager(oauth2Client, {
          refreshBuffer: options.refreshBuffer,
          maxRefreshAttempts: options.maxRefreshAttempts,
          refreshRetryDelay: options.refreshRetryDelay,
        })
      : new TokenRefreshManager(oauth2Client, { maxRefreshAttempts: 0 });
    
    // Set initial organization ID from options or config
    this.currentOrganizationId = options.organizationId || config.defaultOrgId || null;
  }

  /**
   * Start a new session by authenticating with the Minimax API
   * 
   * @param credentials - User credentials
   * @returns Promise resolving to the authentication token
   * @throws {AuthenticationError} If authentication fails
   */
  public async login(credentials: MinimaxCredentials): Promise<MinimaxToken> {
    // Authenticate with the API
    const token = await this.oauth2Client.authenticate(credentials);
    
    // If no organization is selected, try to use the default one
    if (!this.currentOrganizationId) {
      this.currentOrganizationId = this.config.defaultOrgId || null;
    }
    
    return token;
  }

  /**
   * End the current session
   * 
   * @returns Promise that resolves when the session has been ended
   */
  public async logout(): Promise<void> {
    await this.oauth2Client.clearToken();
    this.currentOrganizationId = null;
  }

  /**
   * Get the current session state
   * 
   * @returns Promise resolving to the current session state
   */
  public async getSessionState(): Promise<SessionState> {
    const token = await this.oauth2Client.getToken();
    const isAuthenticated = this.oauth2Client.isTokenValid(token);
    
    return {
      isAuthenticated,
      organizationId: this.currentOrganizationId,
      token,
    };
  }

  /**
   * Check if the session is authenticated
   * 
   * @returns Promise resolving to whether the session is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const token = await this.oauth2Client.getToken();
    return this.oauth2Client.isTokenValid(token);
  }

  /**
   * Get a valid authentication token for API requests
   * 
   * @returns Promise resolving to a valid authentication token
   * @throws {AuthenticationError} If not authenticated or token refresh fails
   */
  public async getAuthToken(): Promise<MinimaxToken> {
    try {
      return await this.tokenRefreshManager.getValidToken();
    } catch (error) {
      // If token refresh fails, throw a more descriptive error
      if (error instanceof AuthenticationError) {
        throw new AuthenticationError(
          'Session is not authenticated or token refresh failed',
          401,
          error
        );
      }
      throw error;
    }
  }

  /**
   * Get the current organization ID
   * 
   * @returns The current organization ID or null if not set
   */
  public getOrganizationId(): string | null {
    return this.currentOrganizationId;
  }

  /**
   * Set the current organization ID
   * 
   * @param organizationId - Organization ID to use for API calls
   */
  public setOrganizationId(organizationId: string): void {
    this.currentOrganizationId = organizationId;
  }

  /**
   * Get the OAuth2 client instance
   * 
   * @returns The OAuth2 client instance
   */
  public getOAuth2Client(): OAuth2Client {
    return this.oauth2Client;
  }
}
