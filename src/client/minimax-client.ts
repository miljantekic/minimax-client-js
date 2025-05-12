/**
 * Minimax Client
 * 
 * Main client class for interacting with the Minimax API
 */

import axios, { AxiosInstance } from 'axios';
// These will be imported after the files are created
import { ReceivedInvoicesModule, CustomersModule, OrganizationsModule, EmployeesModule } from './resources';

/**
 * Minimax client configuration
 */
export interface MinimaxClientConfig {
  /**
   * Client ID obtained from Minimax application registration
   */
  clientId: string;
  
  /**
   * Client secret obtained from Minimax application registration
   */
  clientSecret: string;
  
  /**
   * Username for Minimax account
   */
  username: string;
  
  /**
   * Password for Minimax account
   */
  password: string;
  
  /**
   * Base URL for the Minimax API (defaults to https://moj.minimax.rs/RS/API/)
   */
  baseUrl?: string;
  
  /**
   * Authentication URL for the Minimax API (defaults to https://moj.minimax.rs/RS/AUT/oauth20/token)
   */
  authUrl?: string;
  
  /**
   * Default organization ID to use for API calls
   */
  organizationId?: string;
  
  /**
   * Organization identifier (registration number) to automatically select the organization
   * If provided, the client will automatically find and select the organization with this registration number
   * This takes precedence over organizationId if both are provided
   */
  organizationIdentifier?: string;
}

/**
 * Authentication token response
 */
interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  obtained_at: number;
}

/**
 * Main client for interacting with the Minimax API
 */
export class MinimaxClient {
  private readonly config: MinimaxClientConfig;
  private readonly httpClient: AxiosInstance;
  private token: AuthToken | null = null;
  private organizationId: string | null = null;
  
  /**
   * Resource modules
   */
  public readonly receivedInvoices: ReceivedInvoicesModule;
  public readonly customers: CustomersModule;
  public readonly organizations: OrganizationsModule;
  public readonly employees: EmployeesModule;
  
  /**
   * Default API URLs
   */
  private static readonly DEFAULT_BASE_URL = 'https://moj.minimax.rs/RS/api/';
  private static readonly DEFAULT_AUTH_URL = 'https://moj.minimax.rs/RS/AUT/oauth20/token';
  
  /**
   * Create a new Minimax client
   * 
   * @param config Client configuration
   */
  constructor(config: MinimaxClientConfig) {
    this.config = config;
    
    // Create HTTP client
    this.httpClient = axios.create({
      baseURL: config.baseUrl || MinimaxClient.DEFAULT_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // Set organization ID if provided
    if (config.organizationId) {
      this.organizationId = config.organizationId;
    }
    
    // Initialize resource modules
    this.receivedInvoices = new ReceivedInvoicesModule(this);
    this.customers = new CustomersModule(this);
    this.organizations = new OrganizationsModule(this);
    this.employees = new EmployeesModule(this);
  }
  
  /**
   * Authenticate with the Minimax API
   * 
   * @returns Promise that resolves when authentication is complete
   */
  public async authenticate(): Promise<void> {
    const authUrl = this.config.authUrl || MinimaxClient.DEFAULT_AUTH_URL;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.config.clientId);
    params.append('client_secret', this.config.clientSecret);
    params.append('username', this.config.username);
    params.append('password', this.config.password);
    params.append('scope', 'minimax.rs');
    
    try {
      const response = await axios.post(authUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      this.token = {
        ...response.data,
        obtained_at: Date.now()
      };
      
      // Set organization based on registration number or ID
      await this.setOrganizationFromConfig();
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Set the organization based on the configuration
   * If organizationIdentifier is provided, find and set the organization with that registration number
   * Otherwise, use the organizationId if provided
   * 
   * @returns Promise that resolves when the organization is set
   */
  private async setOrganizationFromConfig(): Promise<void> {
    // If organization identifier is provided, find and set the organization
    if (this.config.organizationIdentifier) {
      try {
        console.log(`Finding organization by identifier: ${this.config.organizationIdentifier}`);
        const organization = await this.organizations.findByIdentifier(this.config.organizationIdentifier);
        
        if (organization) {
          this.organizationId = organization.ID;
          console.log(`Organization set to ${organization.Name} (ID: ${organization.ID}) based on identifier ${this.config.organizationIdentifier}`);
        } else {
          console.warn(`No organization found with identifier ${this.config.organizationIdentifier}`);
          
          // Fall back to organizationId if provided
          if (this.config.organizationId) {
            this.organizationId = this.config.organizationId;
            console.log(`Falling back to provided organization ID: ${this.config.organizationId}`);
          }
        }
      } catch (error) {
        console.warn(`Error finding organization by identifier: ${error instanceof Error ? error.message : String(error)}`);
        
        // Fall back to organizationId if provided
        if (this.config.organizationId) {
          this.organizationId = this.config.organizationId;
          console.log(`Falling back to provided organization ID: ${this.config.organizationId}`);
        }
      }
    } 
    // Otherwise, use the organizationId if provided
    else if (this.config.organizationId) {
      this.organizationId = this.config.organizationId;
      console.log(`Organization ID set to ${this.config.organizationId}`);
    }
  }
  
  /**
   * Check if the token is expired
   * 
   * @returns True if the token is expired or doesn't exist
   */
  private isTokenExpired(): boolean {
    if (!this.token) {
      return true;
    }
    
    const expiresAt = this.token.obtained_at + (this.token.expires_in * 1000);
    const now = Date.now();
    
    // Consider token expired if it expires in less than 30 seconds
    return expiresAt - now < 30000;
  }
  
  /**
   * Refresh the authentication token
   * 
   * @returns Promise that resolves when the token is refreshed
   */
  private async refreshToken(): Promise<void> {
    if (!this.token) {
      await this.authenticate();
      return;
    }
    
    const authUrl = this.config.authUrl || MinimaxClient.DEFAULT_AUTH_URL;
    
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.config.clientId);
    params.append('client_secret', this.config.clientSecret);
    params.append('refresh_token', this.token.refresh_token);
    params.append('scope', 'minimax.rs');
    
    try {
      const response = await axios.post(authUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      this.token = {
        ...response.data,
        obtained_at: Date.now()
      };
    } catch (error) {
      // If refresh fails, try full authentication
      this.token = null;
      await this.authenticate();
    }
  }
  
  /**
   * Get a valid access token
   * 
   * @returns Promise that resolves to the access token
   */
  public async getAccessToken(): Promise<string> {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
    
    return this.token!.access_token;
  }
  
  /**
   * Set the organization ID for API calls
   * 
   * @param organizationId Organization ID
   */
  public setOrganizationId(organizationId: string): void {
    this.organizationId = organizationId;
  }
  
  /**
   * Get the current organization ID
   * 
   * @returns Organization ID or null if not set
   */
  public getOrganizationId(): string | null {
    return this.organizationId;
  }
  
  /**
   * Make a request to the Minimax API
   * 
   * @param method HTTP method
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Promise that resolves to the response data
   */
  public async request<T = any>(
    method: string,
    endpoint: string,
    options: {
      data?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    // Ensure we have a valid token
    const token = await this.getAccessToken();
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    
    // Add organization ID header if set
    if (this.organizationId) {
      headers['Organization-Id'] = this.organizationId;
    }
    
    try {
      // The endpoint should already be properly constructed by the resource module's getEndpoint method
      // No need to modify it here
      let url = endpoint;
      
      const response = await this.httpClient.request<T>({
        method,
        url,
        data: options.data,
        params: options.params,
        headers
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Handle specific error cases
        if (status === 401) {
          // Token might be invalid, try to refresh and retry once
          this.token = null;
          await this.authenticate();
          
          // The endpoint should already be properly constructed by the resource module's getEndpoint method
          // No need to modify it here
          let url = endpoint;
          
          // Retry the request
          const retryResponse = await this.httpClient.request<T>({
            method,
            url,
            data: options.data,
            params: options.params,
            headers: {
              'Authorization': `Bearer ${this.token!.access_token}`,
              ...options.headers
            }
          });
          
          return retryResponse.data;
        }
        
        // Handle other error cases
        throw new Error(`API request failed: ${data.error_description || data.message || error.message}`);
      }
      
      // Handle non-Axios errors
      throw new Error(`Request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Make a GET request to the Minimax API
   * 
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Promise that resolves to the response data
   */
  public async get<T = any>(
    endpoint: string,
    options: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }
  
  /**
   * Make a POST request to the Minimax API
   * 
   * @param endpoint API endpoint
   * @param data Request body
   * @param options Request options
   * @returns Promise that resolves to the response data
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, data });
  }
  
  /**
   * Make a PUT request to the Minimax API
   * 
   * @param endpoint API endpoint
   * @param data Request body
   * @param options Request options
   * @returns Promise that resolves to the response data
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, data });
  }
  
  /**
   * Make a DELETE request to the Minimax API
   * 
   * @param endpoint API endpoint
   * @param options Request options
   * @returns Promise that resolves to the response data
   */
  public async delete<T = any>(
    endpoint: string,
    options: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }
}
