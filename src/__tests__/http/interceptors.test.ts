/**
 * Tests for the HTTP client interceptors
 */

import { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { InterceptorManager } from '../../http/interceptors';

describe('InterceptorManager', () => {
  let interceptorManager: InterceptorManager;
  
  beforeEach(() => {
    interceptorManager = new InterceptorManager();
  });
  
  describe('Request interceptors', () => {
    it('should apply request interceptors in the order they were added', async () => {
      // Create a sample request config
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: AxiosHeaders.from({
          'Content-Type': 'application/json'
        })
      };
      
      // Add interceptors that modify the request
      interceptorManager.addRequestInterceptor((config) => {
        return {
          ...config,
          headers: AxiosHeaders.from({
            ...config.headers,
            'X-Test-1': 'test-1'
          })
        };
      });
      
      interceptorManager.addRequestInterceptor((config) => {
        return {
          ...config,
          headers: AxiosHeaders.from({
            ...config.headers,
            'X-Test-2': 'test-2'
          })
        };
      });
      
      // Apply the interceptors
      const modifiedConfig = await interceptorManager.applyRequestInterceptors(config);
      
      // Check that both interceptors were applied
      expect(modifiedConfig.headers?.['X-Test-1']).toBe('test-1');
      expect(modifiedConfig.headers?.['X-Test-2']).toBe('test-2');
    });
    
    it('should support async request interceptors', async () => {
      // Create a sample request config
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: AxiosHeaders.from({})
      };
      
      // Add an async interceptor
      interceptorManager.addRequestInterceptor(async (config) => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        return {
          ...config,
          headers: AxiosHeaders.from({
            ...config.headers,
            'X-Async': 'async-value'
          })
        };
      });
      
      // Apply the interceptors
      const modifiedConfig = await interceptorManager.applyRequestInterceptors(config);
      
      // Check that the async interceptor was applied
      expect(modifiedConfig.headers?.['X-Async']).toBe('async-value');
    });
    
    it('should allow removing request interceptors', async () => {
      // Create a sample request config
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: AxiosHeaders.from({})
      };
      
      // Add an interceptor and get the remove function
      const removeInterceptor = interceptorManager.addRequestInterceptor((config) => {
        return {
          ...config,
          headers: AxiosHeaders.from({
            ...config.headers,
            'X-Test': 'test-value'
          })
        };
      });
      
      // Remove the interceptor
      removeInterceptor();
      
      // Apply the interceptors
      const modifiedConfig = await interceptorManager.applyRequestInterceptors(config);
      
      // Check that the interceptor was not applied
      expect(modifiedConfig.headers?.['X-Test']).toBeUndefined();
    });
  });
  
  describe('Response interceptors', () => {
    it('should apply response interceptors in the order they were added', async () => {
      // Create a sample response
      const response: AxiosResponse = {
        data: { original: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };
      
      // Add interceptors that modify the response
      interceptorManager.addResponseInterceptor((response) => {
        return {
          ...response,
          data: {
            ...response.data,
            modified1: true
          }
        };
      });
      
      interceptorManager.addResponseInterceptor((response) => {
        return {
          ...response,
          data: {
            ...response.data,
            modified2: true
          }
        };
      });
      
      // Apply the interceptors
      const modifiedResponse = await interceptorManager.applyResponseInterceptors(response);
      
      // Check that both interceptors were applied
      expect(modifiedResponse.data).toEqual({
        original: true,
        modified1: true,
        modified2: true
      });
    });
    
    it('should support async response interceptors', async () => {
      // Create a sample response
      const response: AxiosResponse = {
        data: { original: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };
      
      // Add an async interceptor
      interceptorManager.addResponseInterceptor(async (response) => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 10));
        
        return {
          ...response,
          data: {
            ...response.data,
            asyncModified: true
          }
        };
      });
      
      // Apply the interceptors
      const modifiedResponse = await interceptorManager.applyResponseInterceptors(response);
      
      // Check that the async interceptor was applied
      expect(modifiedResponse.data).toEqual({
        original: true,
        asyncModified: true
      });
    });
    
    it('should allow removing response interceptors', async () => {
      // Create a sample response
      const response: AxiosResponse = {
        data: { original: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };
      
      // Add an interceptor and get the remove function
      const removeInterceptor = interceptorManager.addResponseInterceptor((response) => {
        return {
          ...response,
          data: {
            ...response.data,
            modified: true
          }
        };
      });
      
      // Remove the interceptor
      removeInterceptor();
      
      // Apply the interceptors
      const modifiedResponse = await interceptorManager.applyResponseInterceptors(response);
      
      // Check that the interceptor was not applied
      expect(modifiedResponse.data).toEqual({ original: true });
    });
  });
  
  describe('Clearing interceptors', () => {
    it('should clear all request interceptors', async () => {
      // Create a sample request config
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: AxiosHeaders.from({})
      };
      
      // Add interceptors
      interceptorManager.addRequestInterceptor((config) => {
        return {
          ...config,
          headers: AxiosHeaders.from({
            ...config.headers,
            'X-Test': 'test-value'
          })
        };
      });
      
      // Clear all request interceptors
      interceptorManager.clearRequestInterceptors();
      
      // Apply the interceptors
      const modifiedConfig = await interceptorManager.applyRequestInterceptors(config);
      
      // Check that no interceptors were applied
      expect(modifiedConfig).toEqual(config);
    });
    
    it('should clear all response interceptors', async () => {
      // Create a sample response
      const response: AxiosResponse = {
        data: { original: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };
      
      // Add interceptors
      interceptorManager.addResponseInterceptor((response) => {
        return {
          ...response,
          data: {
            ...response.data,
            modified: true
          }
        };
      });
      
      // Clear all response interceptors
      interceptorManager.clearResponseInterceptors();
      
      // Apply the interceptors
      const modifiedResponse = await interceptorManager.applyResponseInterceptors(response);
      
      // Check that no interceptors were applied
      expect(modifiedResponse).toEqual(response);
    });
    
    it('should clear all interceptors', async () => {
      // Create sample config and response
      const config: InternalAxiosRequestConfig = {
        url: '/test',
        method: 'get',
        headers: AxiosHeaders.from({})
      };
      
      const response: AxiosResponse = {
        data: { original: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig
      };
      
      // Add interceptors
      interceptorManager.addRequestInterceptor((config) => {
        return {
          ...config,
          headers: AxiosHeaders.from({
            ...config.headers,
            'X-Test': 'test-value'
          })
        };
      });
      
      interceptorManager.addResponseInterceptor((response) => {
        return {
          ...response,
          data: {
            ...response.data,
            modified: true
          }
        };
      });
      
      // Clear all interceptors
      interceptorManager.clearAllInterceptors();
      
      // Apply the interceptors
      const modifiedConfig = await interceptorManager.applyRequestInterceptors(config);
      const modifiedResponse = await interceptorManager.applyResponseInterceptors(response);
      
      // Check that no interceptors were applied
      expect(modifiedConfig).toEqual(config);
      expect(modifiedResponse).toEqual(response);
    });
  });
});
