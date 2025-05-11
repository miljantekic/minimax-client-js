/**
 * OAuth2 client for the Minimax API
 * 
 * This module implements the OAuth2 password grant flow for the Minimax API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  MinimaxClientConfig, 
  MinimaxCredentials, 
  MinimaxToken, 
  TokenStorage, 
  MemoryTokenStorage,
  AuthenticationError,
  NetworkError,
  ServerError,
  MinimaxErrorResponse
} from '../types';

/**
 * Default values for the OAuth2 client
 */
const DEFAULT_AUTH_URL = 'https://moj.minimax.rs/RS/AUT/oauth20/token';
const DEFAULT_SCOPE = 'minimax.rs';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * OAuth2 client options
 */
export interface OAuth2ClientOptions {
  /**
   * Authentication URL for the Minimax API
   * @default 'https://moj.minimax.rs/RS/AUT/oauth20/token'
   */
  authUrl?: string;

  /**
   * Timeout for authentication requests in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Token storage implementation
   * @default new MemoryTokenStorage()
   */
  tokenStorage?: TokenStorage;
}

/**
 * OAuth2 client for the Minimax API
 * 
 * Handles authentication with the Minimax API using the OAuth2 password grant flow
 */
export class OAuth2Client {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly authUrl: string;
  private readonly httpClient: AxiosInstance;
  private readonly tokenStorage: TokenStorage;

  /**
   * Create a new OAuth2 client
   * 
   * @param config - Minimax client configuration
   * @param options - OAuth2 client options
   */
  constructor(config: MinimaxClientConfig, options: OAuth2ClientOptions = {}) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.authUrl = options.authUrl || config.authUrl || DEFAULT_AUTH_URL;
    this.tokenStorage = options.tokenStorage || new MemoryTokenStorage();

    // Create HTTP client for authentication requests
    this.httpClient = axios.create({
      timeout: options.timeout || config.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      }
    });
  }

  /**
   * Authenticate with the Minimax API using username and password
   * 
   * @param credentials - User credentials
   * @returns Promise resolving to the authentication token
   * @throws {AuthenticationError} If authentication fails
   * @throws {NetworkError} If a network error occurs
   * @throws {ServerError} If the server returns an unexpected response
   */
  public async authenticate(credentials: MinimaxCredentials): Promise<MinimaxToken> {
    const { username, password, scope = DEFAULT_SCOPE } = credentials;

    // Prepare request body
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('username', username);
    params.append('password', password);
    params.append('scope', scope);

    try {
      // Send authentication request
      const response = await this.httpClient.post<MinimaxToken>(this.authUrl, params);
      
      // Add timestamp when the token was obtained
      const token: MinimaxToken = {
        ...response.data,
        obtained_at: Date.now()
      };

      // Store the token
      await this.tokenStorage.saveToken(token);
      
      return token;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Refresh an expired access token using the refresh token
   * 
   * @param refreshToken - Refresh token to use
   * @returns Promise resolving to the new authentication token
   * @throws {AuthenticationError} If token refresh fails
   * @throws {NetworkError} If a network error occurs
   * @throws {ServerError} If the server returns an unexpected response
   */
  public async refreshToken(refreshToken: string): Promise<MinimaxToken> {
    // Prepare request body
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);
    params.append('refresh_token', refreshToken);

    try {
      // Send token refresh request
      const response = await this.httpClient.post<MinimaxToken>(this.authUrl, params);
      
      // Add timestamp when the token was obtained
      const token: MinimaxToken = {
        ...response.data,
        obtained_at: Date.now()
      };

      // Store the token
      await this.tokenStorage.saveToken(token);
      
      return token;
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  /**
   * Get the current authentication token
   * 
   * @returns Promise resolving to the current token or null if not authenticated
   */
  public async getToken(): Promise<MinimaxToken | null> {
    return this.tokenStorage.getToken();
  }

  /**
   * Check if the current token is valid and not expired
   * 
   * @param token - Token to check
   * @param expirationBuffer - Buffer time in milliseconds before expiration (default: 60000 = 1 minute)
   * @returns Whether the token is valid and not expired
   */
  public isTokenValid(token: MinimaxToken | null, expirationBuffer = 60000): boolean {
    if (!token) {
      return false;
    }

    // Check if token has expiration information
    if (!token.expires_in || !token.obtained_at) {
      return false;
    }

    // Calculate expiration time
    const expirationTime = token.obtained_at + (token.expires_in * 1000);
    
    // Check if token is expired or will expire soon
    return Date.now() < (expirationTime - expirationBuffer);
  }

  /**
   * Clear the current authentication token
   * 
   * @returns Promise that resolves when the token has been cleared
   */
  public async clearToken(): Promise<void> {
    return this.tokenStorage.clearToken();
  }

  /**
   * Get the token storage instance
   * 
   * @returns The token storage instance
   */
  public getTokenStorage(): TokenStorage {
    return this.tokenStorage;
  }

  /**
   * Handle authentication errors
   * 
   * @param error - Error to handle
   * @throws {AuthenticationError} If authentication fails
   * @throws {NetworkError} If a network error occurs
   * @throws {ServerError} If the server returns an unexpected response
   */
  private handleAuthError(error: any): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Network error
      if (!axiosError.response) {
        throw new NetworkError(
          `Network error during authentication: ${axiosError.message}`,
          axiosError
        );
      }

      // API error response
      const { status, data } = axiosError.response;
      const errorData = data as MinimaxErrorResponse;
      
      // Authentication error
      if (status === 400 || status === 401) {
        throw new AuthenticationError(
          `Authentication failed: ${errorData?.error_description || errorData?.message || axiosError.message}`,
          status,
          axiosError
        );
      }

      // Server error
      throw new ServerError(
        `Server error during authentication: ${errorData?.error_description || errorData?.message || axiosError.message}`,
        status,
        axiosError
      );
    }

    // Unknown error
    throw new AuthenticationError(
      `Authentication failed: ${error?.message || 'Unknown error'}`,
      undefined,
      error
    );
  }
}
