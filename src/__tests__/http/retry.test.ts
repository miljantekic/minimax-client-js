/**
 * Tests for the HTTP client retry mechanism
 */

import axios from 'axios';
import { RetryHandler, DefaultRetryStrategy } from '../../http/retry';
import { 
  NetworkError, 
  ServerError, 
  RateLimitError 
} from '../../types';

describe('RetryHandler', () => {
  describe('execute', () => {
    it('should retry failed requests up to the maximum number of retries', async () => {
      // Create a retry handler with a custom strategy
      const retryHandler = new RetryHandler({
        maxRetries: 3,
        retryDelay: 10 // Use a small delay for tests
      });
      
      // Create a function that fails the first 2 times and succeeds on the 3rd attempt
      let attempts = 0;
      const fn = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts <= 2) {
          throw new NetworkError('Connection failed');
        }
        return 'success';
      });
      
      // Execute the function with retry
      const result = await retryHandler.execute(fn);
      
      // Check that the function was called 3 times and succeeded
      expect(fn).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
    });
    
    it('should not retry if the function succeeds on the first attempt', async () => {
      // Create a retry handler
      const retryHandler = new RetryHandler();
      
      // Create a function that succeeds
      const fn = jest.fn().mockResolvedValue('success');
      
      // Execute the function with retry
      const result = await retryHandler.execute(fn);
      
      // Check that the function was called only once
      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('success');
    });
    
    it('should throw the error if all retry attempts fail', async () => {
      // Create a retry handler with a custom strategy
      const retryHandler = new RetryHandler({
        maxRetries: 2,
        retryDelay: 10
      });
      
      // Create a function that always fails
      const error = new NetworkError('Connection failed');
      const fn = jest.fn().mockRejectedValue(error);
      
      // Execute the function with retry and expect it to throw
      await expect(retryHandler.execute(fn)).rejects.toThrow(error);
      
      // Check that the function was called the expected number of times
      expect(fn).toHaveBeenCalledTimes(3); // Initial attempt + 2 retries
    });
  });
});

describe('DefaultRetryStrategy', () => {
  describe('shouldRetry', () => {
    it('should retry network errors', () => {
      const strategy = new DefaultRetryStrategy();
      const error = new NetworkError('Connection failed');
      
      expect(strategy.shouldRetry(error, 0)).toBe(true);
    });
    
    it('should retry server errors', () => {
      const strategy = new DefaultRetryStrategy();
      const error = new ServerError('Internal server error', 500);
      
      expect(strategy.shouldRetry(error, 0)).toBe(true);
    });
    
    it('should retry rate limit errors', () => {
      const strategy = new DefaultRetryStrategy();
      const error = new RateLimitError('Too many requests', 30, 429);
      
      expect(strategy.shouldRetry(error, 0)).toBe(true);
    });
    
    it('should retry based on status code', () => {
      const strategy = new DefaultRetryStrategy();
      
      // Create Axios errors with different status codes
      const error503 = new axios.AxiosError(
        'Service unavailable',
        '503',
        {} as any,
        {} as any,
        { status: 503 } as any
      );
      
      const error400 = new axios.AxiosError(
        'Bad request',
        '400',
        {} as any,
        {} as any,
        { status: 400 } as any
      );
      
      // 503 should be retried
      expect(strategy.shouldRetry(error503, 0)).toBe(true);
      
      // 400 should not be retried
      expect(strategy.shouldRetry(error400, 0)).toBe(false);
    });
    
    it('should not retry if max retries is reached', () => {
      const strategy = new DefaultRetryStrategy({ maxRetries: 3 });
      const error = new NetworkError('Connection failed');
      
      // Should retry for attempts 0, 1, and 2
      expect(strategy.shouldRetry(error, 0)).toBe(true);
      expect(strategy.shouldRetry(error, 1)).toBe(true);
      expect(strategy.shouldRetry(error, 2)).toBe(true);
      
      // Should not retry for attempt 3 (which would be the 4th attempt)
      expect(strategy.shouldRetry(error, 3)).toBe(false);
    });
    
    it('should use custom retry condition if provided', () => {
      const strategy = new DefaultRetryStrategy({
        retryCondition: (error, retryCount) => {
          // Only retry if the error message contains 'custom'
          return error.message?.includes('custom') && retryCount < 2;
        }
      });
      
      const customError = new Error('This is a custom error');
      const otherError = new Error('This is another error');
      
      // Should retry custom error for attempts 0 and 1
      expect(strategy.shouldRetry(customError, 0)).toBe(true);
      expect(strategy.shouldRetry(customError, 1)).toBe(true);
      
      // Should not retry custom error for attempt 2
      expect(strategy.shouldRetry(customError, 2)).toBe(false);
      
      // Should not retry other error at all
      expect(strategy.shouldRetry(otherError, 0)).toBe(false);
    });
  });
  
  describe('getRetryDelay', () => {
    it('should use retry-after header for rate limit errors', () => {
      const strategy = new DefaultRetryStrategy();
      const error = new RateLimitError('Too many requests', 5, 429);
      
      // Delay should be 5 seconds (5000ms)
      expect(strategy.getRetryDelay(1, error)).toBe(5000);
    });
    
    it('should apply exponential backoff if enabled', () => {
      const strategy = new DefaultRetryStrategy({
        retryDelay: 100,
        useExponentialBackoff: true,
        backoffFactor: 2,
        jitter: 0 // Disable jitter for predictable test results
      });
      
      const error = new NetworkError('Connection failed');
      
      // First retry: 100ms
      expect(strategy.getRetryDelay(0, error)).toBe(100);
      
      // Second retry: 100ms * 2 = 200ms
      expect(strategy.getRetryDelay(1, error)).toBe(200);
      
      // Third retry: 100ms * 2^2 = 400ms
      expect(strategy.getRetryDelay(2, error)).toBe(400);
    });
    
    it('should respect maximum retry delay', () => {
      const strategy = new DefaultRetryStrategy({
        retryDelay: 100,
        maxRetryDelay: 300,
        useExponentialBackoff: true,
        backoffFactor: 4,
        jitter: 0 // Disable jitter for predictable test results
      });
      
      const error = new NetworkError('Connection failed');
      
      // First retry: 100ms
      expect(strategy.getRetryDelay(0, error)).toBe(100);
      
      // Second retry: 100ms * 4 = 400ms, but capped at 300ms
      expect(strategy.getRetryDelay(1, error)).toBe(300);
    });
  });
});
