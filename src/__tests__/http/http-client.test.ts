/**
 * Tests for the HTTP client
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { HttpClient } from '../../http/http-client';
import { SessionManager } from '../../auth';
import { MinimaxClientConfig } from '../../types';

// Mock the session manager
jest.mock('../../auth', () => {
  return {
    SessionManager: jest.fn().mockImplementation(() => ({
      getAuthToken: jest.fn().mockResolvedValue({
        access_token: 'test-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        obtained_at: Date.now()
      }),
      getOrganizationId: jest.fn().mockReturnValue('test-org-id')
    }))
  };
});

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockAxios: MockAdapter;
  let sessionManager: SessionManager;
  
  const config: MinimaxClientConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    baseUrl: 'https://api.example.com'
  };
  
  beforeEach(() => {
    // Create a new instance of axios mock adapter
    mockAxios = new MockAdapter(axios);
    
    // Create a new session manager
    sessionManager = new SessionManager(config, null as any);
    
    // Create a new HTTP client
    httpClient = new HttpClient(config, sessionManager);
  });
  
  afterEach(() => {
    // Reset the mock adapter
    mockAxios.reset();
    jest.clearAllMocks();
  });
  
  describe('request', () => {
    it('should make a GET request with authentication headers', async () => {
      // Mock the API response
      mockAxios.onGet('https://api.example.com/test').reply(200, { data: 'test' });
      
      // Make the request
      const response = await httpClient.get('/test');
      
      // Check the response
      expect(response).toEqual({ data: 'test' });
      
      // Check that the auth token was requested
      expect(sessionManager.getAuthToken).toHaveBeenCalled();
      
      // Check that the organization ID was requested
      expect(sessionManager.getOrganizationId).toHaveBeenCalled();
      
      // Check that the request was made with the correct headers
      const request = mockAxios.history.get[0];
      expect(request.headers?.Authorization).toBe('Bearer test-token');
      expect(request.headers?.['X-Organization-Id']).toBe('test-org-id');
    });
    
    it('should make a POST request with the correct data', async () => {
      // Mock the API response
      mockAxios.onPost('https://api.example.com/test').reply(201, { id: '123' });
      
      // Make the request
      const response = await httpClient.post('/test', { name: 'Test' });
      
      // Check the response
      expect(response).toEqual({ id: '123' });
      
      // Check that the request was made with the correct data
      const request = mockAxios.history.post[0];
      expect(JSON.parse(request.data)).toEqual({ name: 'Test' });
    });
    
    it('should make a request without authentication if specified', async () => {
      // Mock the API response
      mockAxios.onGet('https://api.example.com/public').reply(200, { data: 'public' });
      
      // Make the request
      await httpClient.get('/public', { authenticate: false });
      
      // Check that the auth token was not requested
      expect(sessionManager.getAuthToken).not.toHaveBeenCalled();
      
      // Check that the request was made without auth headers
      const request = mockAxios.history.get[0];
      expect(request.headers?.Authorization).toBeUndefined();
    });
    
    it('should use a custom organization ID if provided', async () => {
      // Mock the API response
      mockAxios.onGet('https://api.example.com/test').reply(200, { data: 'test' });
      
      // Make the request
      await httpClient.get('/test', { orgId: 'custom-org-id' });
      
      // Check that the request was made with the custom org ID
      const request = mockAxios.history.get[0];
      expect(request.headers?.['X-Organization-Id']).toBe('custom-org-id');
    });
  });
  
  describe('HTTP methods', () => {
    it('should support PUT requests', async () => {
      // Mock the API response
      mockAxios.onPut('https://api.example.com/test/123').reply(200, { id: '123', updated: true });
      
      // Make the request
      const response = await httpClient.put('/test/123', { name: 'Updated' });
      
      // Check the response
      expect(response).toEqual({ id: '123', updated: true });
      
      // Check that the request was made with the correct method and data
      const request = mockAxios.history.put[0];
      expect(request.method).toBe('put');
      expect(JSON.parse(request.data)).toEqual({ name: 'Updated' });
    });
    
    it('should support PATCH requests', async () => {
      // Mock the API response
      mockAxios.onPatch('https://api.example.com/test/123').reply(200, { id: '123', patched: true });
      
      // Make the request
      const response = await httpClient.patch('/test/123', { status: 'active' });
      
      // Check the response
      expect(response).toEqual({ id: '123', patched: true });
      
      // Check that the request was made with the correct method and data
      const request = mockAxios.history.patch[0];
      expect(request.method).toBe('patch');
      expect(JSON.parse(request.data)).toEqual({ status: 'active' });
    });
    
    it('should support DELETE requests', async () => {
      // Mock the API response
      mockAxios.onDelete('https://api.example.com/test/123').reply(204);
      
      // Make the request
      await httpClient.delete('/test/123');
      
      // Check that the request was made with the correct method
      const request = mockAxios.history.delete[0];
      expect(request.method).toBe('delete');
    });
  });
});
