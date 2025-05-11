/**
 * Request and response interceptors for the Minimax API client
 * 
 * This module provides interceptor functionality for modifying requests and responses
 */

import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (response: AxiosResponse) => Promise<AxiosResponse> | AxiosResponse;

/**
 * Interceptor manager for handling request and response interceptors
 */
export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  /**
   * Add a request interceptor
   * 
   * @param interceptor Function that modifies the request config
   * @returns Function to remove the interceptor
   */
  public addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor);
    
    // Return a function to remove this interceptor
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.requestInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Add a response interceptor
   * 
   * @param interceptor - Response interceptor function
   * @returns Function to remove the interceptor
   */
  public addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor);
    
    // Return a function to remove this interceptor
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index !== -1) {
        this.responseInterceptors.splice(index, 1);
      }
    };
  }

  /**
   * Apply all request interceptors to a request config
   * 
   * @param config - Request configuration
   * @returns Promise resolving to the modified request configuration
   */
  public async applyRequestInterceptors(config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  /**
   * Apply all response interceptors to a response
   * 
   * @param response - Response object
   * @returns Promise resolving to the modified response
   */
  public async applyResponseInterceptors(response: AxiosResponse): Promise<AxiosResponse> {
    let modifiedResponse = { ...response };
    
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  /**
   * Clear all request interceptors
   */
  public clearRequestInterceptors(): void {
    this.requestInterceptors = [];
  }

  /**
   * Clear all response interceptors
   */
  public clearResponseInterceptors(): void {
    this.responseInterceptors = [];
  }

  /**
   * Clear all interceptors
   */
  public clearAllInterceptors(): void {
    this.clearRequestInterceptors();
    this.clearResponseInterceptors();
  }
}
