/**
 * Tests for the HTTP client RowVersion handler
 */

import { RowVersionHandler } from '../../http/row-version';
import { MinimaxResource, ConcurrencyError } from '../../types';
import { InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

describe('RowVersionHandler', () => {
  let rowVersionHandler: RowVersionHandler;
  
  beforeEach(() => {
    rowVersionHandler = new RowVersionHandler();
  });
  
  describe('addRowVersion', () => {
    it('should add RowVersion to request data if not present', () => {
      // Create a resource with a RowVersion
      const resource: MinimaxResource = {
        Id: '123',
        RowVersion: 'abc123'
      };
      
      // Create request data without RowVersion
      const data = {
        name: 'Test',
        value: 42
      };
      
      // Add RowVersion to the data
      const result = rowVersionHandler.addRowVersion(resource, data);
      
      // Check that RowVersion was added
      expect(result).toEqual({
        name: 'Test',
        value: 42,
        RowVersion: 'abc123'
      });
    });
    
    it('should not modify data if RowVersion is already present', () => {
      // Create a resource with a RowVersion
      const resource: MinimaxResource = {
        Id: '123',
        RowVersion: 'abc123'
      };
      
      // Create request data with a different RowVersion
      const data = {
        name: 'Test',
        value: 42,
        RowVersion: 'def456'
      };
      
      // Add RowVersion to the data
      const result = rowVersionHandler.addRowVersion(resource, data);
      
      // Check that RowVersion was not modified
      expect(result).toEqual({
        name: 'Test',
        value: 42,
        RowVersion: 'def456'
      });
    });
  });
  
  describe('createRequestInterceptor', () => {
    it('should add RowVersion from resource metadata', () => {
      // Create a request interceptor
      const interceptor = rowVersionHandler.createRequestInterceptor();
      
      // Create a resource
      const resource: MinimaxResource = {
        Id: '123',
        RowVersion: 'abc123'
      };
      
      // Create a request config with resource metadata
      const config: InternalAxiosRequestConfig & { metadata?: Record<string, any> } = {
        method: 'put',
        url: '/test/123',
        data: { name: 'Updated' },
        metadata: { resource },
        headers: axios.AxiosHeaders.from({})
      };
      
      // Apply the interceptor
      const result = interceptor(config);
      
      // Check that RowVersion was added to the data
      expect(result.data).toEqual({
        name: 'Updated',
        RowVersion: 'abc123'
      });
    });
    
    it('should not modify data for GET requests', () => {
      // Create a request interceptor
      const interceptor = rowVersionHandler.createRequestInterceptor();
      
      // Create a resource
      const resource: MinimaxResource = {
        Id: '123',
        RowVersion: 'abc123'
      };
      
      // Create a GET request config with resource metadata
      const config: InternalAxiosRequestConfig & { metadata?: Record<string, any> } = {
        method: 'get',
        url: '/test/123',
        metadata: { resource },
        headers: axios.AxiosHeaders.from({})
      };
      
      // Apply the interceptor
      const result = interceptor(config);
      
      // Check that the config was not modified
      expect(result).toEqual(config);
    });
    
    it('should not modify data if resource is not provided', () => {
      // Create a request interceptor
      const interceptor = rowVersionHandler.createRequestInterceptor();
      
      // Create a request config without resource metadata
      const config: InternalAxiosRequestConfig & { metadata?: Record<string, any> } = {
        method: 'put',
        url: '/test/123',
        data: { name: 'Updated' },
        headers: axios.AxiosHeaders.from({})
      };
      
      // Apply the interceptor
      const result = interceptor(config);
      
      // Check that the data was not modified
      expect(result.data).toEqual({ name: 'Updated' });
    });
  });
  
  describe('handleConcurrencyError', () => {
    it('should extract RowVersion from error message', () => {
      // Create an error with RowVersion in the message
      const error = {
        statusCode: 409,
        message: 'Concurrency conflict. Current RowVersion: xyz789'
      };
      
      // Handle the error
      const result = rowVersionHandler.handleConcurrencyError(error);
      
      // Check that a ConcurrencyError was created with the correct RowVersion
      expect(result).toBeInstanceOf(ConcurrencyError);
      expect(result.currentRowVersion).toBe('xyz789');
    });
    
    it('should return the original error if not a concurrency error', () => {
      // Create a non-concurrency error
      const error = {
        statusCode: 400,
        message: 'Bad request'
      };
      
      // Handle the error
      const result = rowVersionHandler.handleConcurrencyError(error);
      
      // Check that the original error was returned
      expect(result).toBe(error);
    });
    
    it('should return the original error if no RowVersion found', () => {
      // Create a concurrency error without RowVersion in the message
      const error = {
        statusCode: 409,
        message: 'Concurrency conflict'
      };
      
      // Handle the error
      const result = rowVersionHandler.handleConcurrencyError(error);
      
      // Check that the original error was returned
      expect(result).toBe(error);
    });
  });
  
  describe('createErrorMiddleware', () => {
    it('should create middleware that handles concurrency errors', () => {
      // Create error middleware
      const middleware = rowVersionHandler.createErrorMiddleware();
      
      // Create a mock next function
      const next = jest.fn().mockImplementation(error => error);
      
      // Create a concurrency error
      const error = {
        statusCode: 409,
        message: 'Concurrency conflict. Current RowVersion: xyz789'
      };
      
      // Apply the middleware
      const result = middleware(error, next);
      
      // Check that the error was processed
      expect(result).toBeInstanceOf(ConcurrencyError);
      expect(result.currentRowVersion).toBe('xyz789');
      
      // Check that next was not called
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should pass non-concurrency errors to the next middleware', () => {
      // Create error middleware
      const middleware = rowVersionHandler.createErrorMiddleware();
      
      // Create a mock next function
      const next = jest.fn().mockImplementation(error => error);
      
      // Create a non-concurrency error
      const error = {
        statusCode: 400,
        message: 'Bad request'
      };
      
      // Apply the middleware
      const result = middleware(error, next);
      
      // Check that the error was passed to next
      expect(next).toHaveBeenCalledWith(error);
      expect(result).toBe(error);
    });
  });
});
