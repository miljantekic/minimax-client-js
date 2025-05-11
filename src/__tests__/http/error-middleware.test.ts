/**
 * Tests for the HTTP client error middleware
 */

import { AxiosError } from 'axios';
import { ErrorMiddlewareManager } from '../../http/error-middleware';
import {
  MinimaxError,
  AuthenticationError,
  ValidationError,
  NotFoundError
} from '../../types';

describe('ErrorMiddlewareManager', () => {
  let errorMiddlewareManager: ErrorMiddlewareManager;
  
  beforeEach(() => {
    errorMiddlewareManager = new ErrorMiddlewareManager();
  });
  
  describe('processError', () => {
    it('should process Axios errors with responses', async () => {
      // Create a mock Axios error with a response
      const axiosError = new AxiosError(
        'Request failed with status code 404',
        '404',
        {} as any,
        {} as any,
        {
          data: { message: 'Resource not found' },
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {} as any
        }
      );
      
      // Process the error
      const error = await errorMiddlewareManager.processError(axiosError);
      
      // Check that the error was processed correctly
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toContain('Resource not found');
      expect(error.statusCode).toBe(404);
    });
    
    it('should process network errors', async () => {
      // Create a mock Axios error without a response
      const axiosError = new AxiosError(
        'Network Error',
        'ECONNREFUSED',
        {} as any,
        {} as any
      );
      
      // Process the error
      const error = await errorMiddlewareManager.processError(axiosError);
      
      // Check that the error was processed correctly
      expect(error).toBeInstanceOf(MinimaxError);
      expect(error.message).toContain('Network Error');
    });
    
    it('should pass through MinimaxError instances', async () => {
      // Create a MinimaxError
      const originalError = new ValidationError('Validation failed', { field: ['Invalid value'] });
      
      // Process the error
      const error = await errorMiddlewareManager.processError(originalError);
      
      // Check that the error was passed through
      expect(error).toBe(originalError);
    });
    
    it('should convert unknown errors to MinimaxError', async () => {
      // Create an unknown error
      const unknownError = new Error('Unknown error');
      
      // Process the error
      const error = await errorMiddlewareManager.processError(unknownError);
      
      // Check that the error was converted
      expect(error).toBeInstanceOf(MinimaxError);
      expect(error.message).toContain('Unknown error');
      expect(error.originalError).toBe(unknownError);
    });
  });
  
  describe('middleware chain', () => {
    it('should apply middleware in the correct order', async () => {
      // Add middleware that modifies the error message
      errorMiddlewareManager.addMiddleware((error, next) => {
        const nextError = next(error);
        nextError.message = `First middleware: ${nextError.message}`;
        return nextError;
      });
      
      errorMiddlewareManager.addMiddleware((error, next) => {
        const nextError = next(error);
        nextError.message = `Second middleware: ${nextError.message}`;
        return nextError;
      });
      
      // Process an error
      const error = await errorMiddlewareManager.processError(new Error('Test error'));
      
      // Check that both middleware were applied in the correct order
      expect(error.message).toBe('First middleware: Second middleware: API request failed: Test error');
    });
    
    it('should allow middleware to short-circuit the chain', async () => {
      // Add middleware that short-circuits the chain
      errorMiddlewareManager.addMiddleware((error, next) => {
        if (error.message.includes('special')) {
          return new AuthenticationError('Short-circuited');
        }
        return next(error);
      });
      
      errorMiddlewareManager.addMiddleware((error, next) => {
        // This middleware should not be called for 'special' errors
        const nextError = next(error);
        nextError.message = `Modified: ${nextError.message}`;
        return nextError;
      });
      
      // Process a special error
      const specialError = await errorMiddlewareManager.processError(new Error('This is a special error'));
      
      // Check that the first middleware short-circuited the chain
      expect(specialError).toBeInstanceOf(AuthenticationError);
      expect(specialError.message).toBe('Short-circuited');
      
      // Process a normal error
      const normalError = await errorMiddlewareManager.processError(new Error('Normal error'));
      
      // Check that both middleware were applied
      expect(normalError.message).toBe('Modified: API request failed: Normal error');
    });
    
    it('should support async middleware', async () => {
      // Add async middleware
      errorMiddlewareManager.addMiddleware(async (error, next) => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        const nextError = next(error);
        nextError.message = `Async middleware: ${nextError.message}`;
        return nextError;
      });
      
      // Process an error
      const error = await errorMiddlewareManager.processError(new Error('Test error'));
      
      // Check that the async middleware was applied
      expect(error.message).toBe('Async middleware: API request failed: Test error');
    });
  });
  
  describe('addMiddleware and clearMiddleware', () => {
    it('should allow adding and removing middleware', async () => {
      // Add middleware and get the remove function
      const removeMiddleware = errorMiddlewareManager.addMiddleware((error, next) => {
        const nextError = next(error);
        nextError.message = `Modified: ${nextError.message}`;
        return nextError;
      });
      
      // Process an error with the middleware
      const error1 = await errorMiddlewareManager.processError(new Error('Test error'));
      
      // Check that the middleware was applied
      expect(error1.message).toBe('Modified: API request failed: Test error');
      
      // Remove the middleware
      removeMiddleware();
      
      // Process another error
      const error2 = await errorMiddlewareManager.processError(new Error('Test error'));
      
      // Check that the middleware was not applied
      expect(error2.message).toBe('API request failed: Test error');
    });
    
    it('should clear all middleware', async () => {
      // Add middleware
      errorMiddlewareManager.addMiddleware((error, next) => {
        const nextError = next(error);
        nextError.message = `Modified: ${nextError.message}`;
        return nextError;
      });
      
      // Clear all middleware
      errorMiddlewareManager.clearMiddleware();
      
      // Process an error
      const error = await errorMiddlewareManager.processError(new Error('Test error'));
      
      // Check that no middleware was applied
      expect(error.message).toBe('API request failed: Test error');
    });
  });
});
