/**
 * Error handling middleware for the Minimax API client
 * 
 * This module provides middleware for handling errors from API responses
 */

import axios, { AxiosError } from 'axios';
import { MinimaxError, createErrorFromResponse } from '../types';

/**
 * Error middleware function type
 */
export type ErrorMiddleware = (
  error: any,
  next: (error: any) => MinimaxError
) => MinimaxError | Promise<MinimaxError>;

/**
 * Error middleware manager for handling API errors
 */
export class ErrorMiddlewareManager {
  private middlewares: ErrorMiddleware[] = [];

  /**
   * Add an error middleware
   * 
   * @param middleware - Error middleware function
   * @returns Function to remove the middleware
   */
  public addMiddleware(middleware: ErrorMiddleware): () => void {
    this.middlewares.push(middleware);
    
    // Return a function to remove this middleware
    return () => {
      const index = this.middlewares.indexOf(middleware);
      if (index !== -1) {
        this.middlewares.splice(index, 1);
      }
    };
  }

  /**
   * Process an error through all middleware
   * 
   * @param error - Error to process
   * @returns Promise resolving to the processed error
   */
  public async processError(error: any): Promise<MinimaxError> {
    // Create the middleware chain
    const chain = this.createMiddlewareChain();
    
    // Process the error through the chain
    return chain(error);
  }

  /**
   * Create a middleware chain
   * 
   * @returns Function that processes an error through the middleware chain
   */
  private createMiddlewareChain(): (error: any) => Promise<MinimaxError> {
    // The final handler in the chain
    const finalHandler = (error: any): MinimaxError => {
      // If it's already a MinimaxError, return it
      if (error instanceof MinimaxError) {
        return error;
      }
      
      // If it's an Axios error with a response, use the error factory
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const { data, status } = axiosError.response;
          return createErrorFromResponse(data as any, status, axiosError);
        }
      }
      
      // Default to a generic MinimaxError
      return new MinimaxError(
        `API request failed: ${error?.message || 'Unknown error'}`,
        undefined,
        error
      );
    };
    
    // Build the middleware chain
    return async (error: any): Promise<MinimaxError> => {
      // Start with the final handler
      let handler = finalHandler;
      
      // Wrap each middleware around the current handler
      for (let i = this.middlewares.length - 1; i >= 0; i--) {
        const middleware = this.middlewares[i];
        const nextHandler = handler;
        
        // Create a new handler that calls this middleware with the next handler
        const currentMiddleware = middleware;
        const currentNext = nextHandler;
        handler = (err: any): MinimaxError => {
          // We need to handle both synchronous and asynchronous middleware
          // But we need to maintain the return type as MinimaxError for the type system
          // The actual execution will be handled by Promise.resolve later
          return currentMiddleware(err, currentNext) as MinimaxError;
        };
      }
      
      // Call the chain with the error
      const result = handler(error);
      
      // Ensure we return a Promise<MinimaxError>
      return Promise.resolve(result);
    };
  }

  /**
   * Clear all middleware
   */
  public clearMiddleware(): void {
    this.middlewares = [];
  }
}
