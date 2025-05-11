/**
 * HTTP client for the Minimax API
 * 
 * This module provides the base HTTP client for making requests to the Minimax API
 */

import axios, { AxiosInstance, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import {
  MinimaxClientConfig,
  HttpMethod,
  HttpRequestOptions,
  MinimaxError,
  MinimaxResource
} from '../types';
import { SessionManager } from '../auth';
import { InterceptorManager, RequestInterceptor, ResponseInterceptor } from './interceptors';
import { ErrorMiddlewareManager, ErrorMiddleware } from './error-middleware';
import { RetryHandler, RetryConfig, RetryStrategy } from './retry';
import { RowVersionHandler } from './row-version';

/**
 * Default values for the HTTP client
 */
const DEFAULT_BASE_URL = 'https://moj.minimax.rs/RS/API/';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * HTTP client options
 */
export interface HttpClientOptions {
  /**
   * Base URL for the Minimax API
   * @default 'https://moj.minimax.rs/RS/API/'
   */
  baseUrl?: string;

  /**
   * Timeout for API requests in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Default headers to include in all requests
   */
  headers?: RawAxiosRequestHeaders;
  
  /**
   * Retry configuration for failed requests
   */
  retry?: RetryConfig | RetryStrategy;
  
  /**
   * Whether to enable automatic RowVersion handling
   * @default true
   */
  handleRowVersion?: boolean;
}

/**
 * HTTP client for the Minimax API
 * 
 * Handles making HTTP requests to the Minimax API with authentication
 */
export class HttpClient {
  private readonly clientConfig: MinimaxClientConfig;
  private readonly sessionManager: SessionManager;
  private readonly httpClient: AxiosInstance;
  private readonly baseUrl: string;
  private readonly interceptorManager: InterceptorManager;
  private readonly errorMiddlewareManager: ErrorMiddlewareManager;
  private readonly retryHandler: RetryHandler;
  private readonly rowVersionHandler: RowVersionHandler;

  /**
   * Create a new HTTP client
   * 
   * @param config - Minimax client configuration
   * @param sessionManager - Session manager instance
   * @param options - HTTP client options
   */
  constructor(
    clientConfig: MinimaxClientConfig,
    sessionManager: SessionManager,
    options: HttpClientOptions = {}
  ) {
    this.clientConfig = clientConfig;
    this.sessionManager = sessionManager;
    this.baseUrl = options.baseUrl || clientConfig.baseUrl || DEFAULT_BASE_URL;
    this.interceptorManager = new InterceptorManager();
    this.errorMiddlewareManager = new ErrorMiddlewareManager();
    this.retryHandler = new RetryHandler(options.retry || {});
    this.rowVersionHandler = new RowVersionHandler();

    // Create HTTP client for API requests
    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: options.timeout || clientConfig.timeout || DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options.headers || {}),
        ...(clientConfig.headers || {})
      }
    });
    
    // Set up Axios interceptors to use our interceptor manager
    this.httpClient.interceptors.request.use(
      async (config) => this.interceptorManager.applyRequestInterceptors(config),
      (error) => Promise.reject(error)
    );
    
    this.httpClient.interceptors.response.use(
      async (response) => this.interceptorManager.applyResponseInterceptors(response),
      (error) => Promise.reject(error)
    );
    
    // Set up RowVersion handling if enabled
    if (options.handleRowVersion !== false) {
      this.addRequestInterceptor(this.rowVersionHandler.createRequestInterceptor());
      this.addErrorMiddleware(this.rowVersionHandler.createErrorMiddleware());
    }
  }

  /**
   * Make a request to the Minimax API
   * 
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise resolving to the response data
   * @throws {MinimaxError} If the request fails
   */
  public async request<T = any>(
    method: HttpMethod,
    endpoint: string,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    const { authenticate = true, orgId, ...axiosOptions } = options;

    // Create the request function
    const makeRequest = async (): Promise<T> => {
      try {
        // Initialize headers with any provided headers
        const headers: RawAxiosRequestHeaders = {
          ...(options.headers || {})
        };
        
        // Add authentication headers if required
        if (authenticate) {
          const token = await this.sessionManager.getAuthToken();
          headers['Authorization'] = `Bearer ${token.access_token}`;
          
          // Add organization ID header if provided or available from session
          const organizationId = orgId || this.sessionManager.getOrganizationId();
          if (organizationId) {
            headers['X-Organization-Id'] = organizationId;
          }
        }

        // Make the request
        const config: AxiosRequestConfig = {
          ...axiosOptions,
          method,
          url: endpoint,
          headers
        };

        const response = await this.httpClient.request<T>(config);
        return response.data;
      } catch (error) {
        throw await this.processRequestError(error);
      }
    };
    
    // Execute the request with retry logic
    return this.retryHandler.execute<T>(makeRequest);
  }

  /**
   * Make a GET request to the Minimax API
   * 
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async get<T = any>(endpoint: string, options: HttpRequestOptions = {}): Promise<T> {
    return this.request<T>('GET', endpoint, options);
  }

  /**
   * Make a POST request to the Minimax API
   * 
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async post<T = any>(
    endpoint: string,
    data?: any,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    return this.request<T>('POST', endpoint, { ...options, data });
  }

  /**
   * Make a PUT request to the Minimax API
   * 
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async put<T = any>(
    endpoint: string,
    data?: any,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, { ...options, data });
  }

  /**
   * Make a PATCH request to the Minimax API
   * 
   * @param endpoint - API endpoint
   * @param data - Request body
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async patch<T = any>(
    endpoint: string,
    data?: any,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, { ...options, data });
  }

  /**
   * Make a DELETE request to the Minimax API
   * 
   * @param endpoint - API endpoint
   * @param options - Request options
   * @returns Promise resolving to the response data
   */
  public async delete<T = any>(endpoint: string, options: HttpRequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, options);
  }

  /**
   * Process request errors through middleware
   * 
   * @param error - Error object from API call
   * @returns Promise resolving to the processed error
   */
  private async processRequestError(error: any): Promise<MinimaxError> {
    // Process the error through middleware
    return this.errorMiddlewareManager.processError(error);
  }

  /**
   * Get the underlying Axios instance
   * 
   * @returns The Axios instance
   */
  public getAxiosInstance(): AxiosInstance {
    return this.httpClient;
  }

  /**
   * Add a request interceptor
   * 
   * @param interceptor - Request interceptor function
   * @returns Function to remove the interceptor
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    return this.interceptorManager.addRequestInterceptor(interceptor);
  }

  /**
   * Add a response interceptor
   * 
   * @param interceptor - Response interceptor function
   * @returns Function to remove the interceptor
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    return this.interceptorManager.addResponseInterceptor(interceptor);
  }

  /**
   * Clear all interceptors
   */
  public clearInterceptors(): void {
    this.interceptorManager.clearAllInterceptors();
  }
  
  /**
   * Add an error middleware
   * 
   * @param middleware - Error middleware function
   * @returns Function to remove the middleware
   */
  public addErrorMiddleware(middleware: ErrorMiddleware): () => void {
    return this.errorMiddlewareManager.addMiddleware(middleware);
  }
  
  /**
   * Clear all error middleware
   */
  public clearErrorMiddleware(): void {
    this.errorMiddlewareManager.clearMiddleware();
  }
  
  /**
   * Get the retry handler
   * 
   * @returns The retry handler instance
   */
  public getRetryHandler(): RetryHandler {
    return this.retryHandler;
  }
  
  /**
   * Get the RowVersion handler
   * 
   * @returns The RowVersion handler instance
   */
  public getRowVersionHandler(): RowVersionHandler {
    return this.rowVersionHandler;
  }
  
  /**
   * Get the client configuration
   * 
   * @returns The client configuration
   */
  public getClientConfig(): MinimaxClientConfig {
    return this.clientConfig;
  }
  
  /**
   * Update a resource with optimistic concurrency control
   * 
   * @param endpoint - API endpoint
   * @param resource - Resource to update
   * @param data - Update data
   * @param options - Request options
   * @returns Promise resolving to the updated resource
   */
  public async updateWithConcurrency<T extends MinimaxResource>(
    endpoint: string,
    resource: T,
    data: Partial<T>,
    options: HttpRequestOptions = {}
  ): Promise<T> {
    // Add RowVersion to the data
    const updateData = this.rowVersionHandler.addRowVersion(resource, data);
    
    // Add resource to request metadata for interceptors
    const requestOptions: HttpRequestOptions = {
      ...options,
      metadata: {
        ...options.metadata,
        resource
      }
    };
    
    // Make the update request
    return this.put<T>(endpoint, updateData, requestOptions);
  }
}
