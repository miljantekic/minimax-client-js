/**
 * RowVersion handling for the Minimax API client
 * 
 * This module provides functionality for handling concurrency with RowVersion
 */

import { InternalAxiosRequestConfig } from 'axios';
import { MinimaxResource, ConcurrencyError } from '../types';

/**
 * RowVersion handler for managing optimistic concurrency control
 */
export class RowVersionHandler {
  /**
   * Add RowVersion to request data for update operations
   * 
   * @param resource - Resource being updated
   * @param data - Request data
   * @returns Updated request data with RowVersion
   */
  public addRowVersion(resource: MinimaxResource, data: any): any {
    // If data doesn't already have a RowVersion, add it from the resource
    if (resource.RowVersion && !data.RowVersion) {
      return {
        ...data,
        RowVersion: resource.RowVersion
      };
    }
    
    return data;
  }

  /**
   * Create a request interceptor that adds RowVersion to update requests
   * 
   * @returns Request interceptor function
   */
  public createRequestInterceptor() {
    return (config: InternalAxiosRequestConfig & { metadata?: Record<string, any> }): InternalAxiosRequestConfig => {
      // Only process PUT, PATCH, and POST requests with data
      if (
        config.data && 
        config.method && 
        ['put', 'patch', 'post'].includes(config.method.toLowerCase())
      ) {
        // If the data is a resource with a RowVersion, ensure it's included
        if (
          typeof config.data === 'object' && 
          config.data.Id && 
          config.data.RowVersion
        ) {
          // RowVersion is already present, no need to modify
          return config;
        }
        
        // If we have a resource in the config metadata, use its RowVersion
        if (
          config.metadata && 
          typeof config.metadata === 'object' && 
          'resource' in config.metadata &&
          (config.metadata.resource as MinimaxResource).RowVersion
        ) {
          const resource = config.metadata.resource as MinimaxResource;
          config.data = this.addRowVersion(resource, config.data);
        }
      }
      
      return config;
    };
  }

  /**
   * Handle concurrency errors by extracting the current RowVersion
   * 
   * @param error - Error from API request
   * @returns Processed error with current RowVersion if available
   */
  public handleConcurrencyError(error: any): any {
    // Only process concurrency errors
    if (error.statusCode === 409 || 
        (error.message && error.message.toLowerCase().includes('concurrency'))) {
      
      // Try to extract current RowVersion from error message
      const rowVersionMatch = error.message.match(/RowVersion:\s*([^\s]+)/i);
      const currentRowVersion = rowVersionMatch ? rowVersionMatch[1] : undefined;
      
      // Create a specialized concurrency error
      if (currentRowVersion) {
        return new ConcurrencyError(
          `Concurrency conflict: The resource has been modified. Current RowVersion: ${currentRowVersion}`,
          currentRowVersion,
          error.statusCode,
          error
        );
      }
    }
    
    // Return the original error if not a concurrency error or no RowVersion found
    return error;
  }

  /**
   * Create an error middleware for handling concurrency errors
   * 
   * @returns Error middleware function
   */
  public createErrorMiddleware() {
    return (error: any, next: (error: any) => any): any => {
      // Process the error
      const processedError = this.handleConcurrencyError(error);
      
      // If we processed the error, return it
      if (processedError !== error) {
        return processedError;
      }
      
      // Otherwise, pass it to the next middleware
      return next(error);
    };
  }
}
