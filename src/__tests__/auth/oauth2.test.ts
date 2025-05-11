/**
 * Tests for the OAuth2 client
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { OAuth2Client } from '../../auth/oauth2';
import { MinimaxClientConfig, MinimaxCredentials, AuthenticationError, NetworkError } from '../../types';

// Mock axios for testing
const mockAxios = new MockAdapter(axios);

// Sample configuration
const config: MinimaxClientConfig = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret'
};

// Sample credentials
const credentials: MinimaxCredentials = {
  username: 'test-user',
  password: 'test-password'
};

// Sample token response
const tokenResponse = {
  access_token: 'test-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'test-refresh-token'
};

describe('OAuth2Client', () => {
  let oauth2Client: OAuth2Client;
  
  beforeEach(() => {
    // Reset mock axios
    mockAxios.reset();
    
    // Create a new OAuth2 client for each test
    oauth2Client = new OAuth2Client(config);
  });
  
  describe('authenticate', () => {
    it('should authenticate successfully with valid credentials', async () => {
      // Mock successful authentication response
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').reply(200, tokenResponse);
      
      // Authenticate
      const token = await oauth2Client.authenticate(credentials);
      
      // Check token
      expect(token.access_token).toBe(tokenResponse.access_token);
      expect(token.token_type).toBe(tokenResponse.token_type);
      expect(token.expires_in).toBe(tokenResponse.expires_in);
      expect(token.refresh_token).toBe(tokenResponse.refresh_token);
      expect(token.obtained_at).toBeDefined();
      
      // Check request
      const request = mockAxios.history.post[0];
      expect(request.url).toBe('https://moj.minimax.rs/RS/AUT/oauth20/token');
      expect(request.data).toContain('grant_type=password');
      expect(request.data).toContain(`client_id=${config.clientId}`);
      expect(request.data).toContain(`client_secret=${config.clientSecret}`);
      expect(request.data).toContain(`username=${credentials.username}`);
      expect(request.data).toContain(`password=${credentials.password}`);
      expect(request.data).toContain('scope=minimax.rs');
    });
    
    it('should throw AuthenticationError on invalid credentials', async () => {
      // Mock authentication failure response
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').reply(401, {
        error: 'invalid_grant',
        error_description: 'Invalid username or password'
      });
      
      // Expect authentication to fail
      await expect(oauth2Client.authenticate(credentials))
        .rejects
        .toThrow(AuthenticationError);
    });
    
    it('should throw NetworkError on network failure', async () => {
      // Mock network failure
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').networkError();
      
      // Expect authentication to fail
      await expect(oauth2Client.authenticate(credentials))
        .rejects
        .toThrow(NetworkError);
    });
  });
  
  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Mock successful token refresh response
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').reply(200, tokenResponse);
      
      // Refresh token
      const token = await oauth2Client.refreshToken('old-refresh-token');
      
      // Check token
      expect(token.access_token).toBe(tokenResponse.access_token);
      expect(token.token_type).toBe(tokenResponse.token_type);
      expect(token.expires_in).toBe(tokenResponse.expires_in);
      expect(token.refresh_token).toBe(tokenResponse.refresh_token);
      expect(token.obtained_at).toBeDefined();
      
      // Check request
      const request = mockAxios.history.post[0];
      expect(request.url).toBe('https://moj.minimax.rs/RS/AUT/oauth20/token');
      expect(request.data).toContain('grant_type=refresh_token');
      expect(request.data).toContain(`client_id=${config.clientId}`);
      expect(request.data).toContain(`client_secret=${config.clientSecret}`);
      expect(request.data).toContain('refresh_token=old-refresh-token');
    });
    
    it('should throw AuthenticationError on invalid refresh token', async () => {
      // Mock token refresh failure response
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').reply(401, {
        error: 'invalid_grant',
        error_description: 'Invalid refresh token'
      });
      
      // Expect token refresh to fail
      await expect(oauth2Client.refreshToken('invalid-refresh-token'))
        .rejects
        .toThrow(AuthenticationError);
    });
  });
  
  describe('isTokenValid', () => {
    it('should return false for null token', () => {
      expect(oauth2Client.isTokenValid(null)).toBe(false);
    });
    
    it('should return false for token without expiration info', () => {
      const token = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token'
      };
      
      expect(oauth2Client.isTokenValid(token)).toBe(false);
    });
    
    it('should return false for expired token', () => {
      const token = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600, // 1 hour
        refresh_token: 'test-refresh-token',
        obtained_at: Date.now() - 3700000 // Obtained 1 hour and 100 seconds ago
      };
      
      expect(oauth2Client.isTokenValid(token)).toBe(false);
    });
    
    it('should return false for token expiring soon', () => {
      const token = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600, // 1 hour
        refresh_token: 'test-refresh-token',
        obtained_at: Date.now() - 3540000 // Obtained 59 minutes ago
      };
      
      // Default buffer is 1 minute, so this token is considered expiring soon
      expect(oauth2Client.isTokenValid(token)).toBe(false);
    });
    
    it('should return true for valid token', () => {
      const token = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        expires_in: 3600, // 1 hour
        refresh_token: 'test-refresh-token',
        obtained_at: Date.now() - 1800000 // Obtained 30 minutes ago
      };
      
      expect(oauth2Client.isTokenValid(token)).toBe(true);
    });
  });
  
  describe('token storage', () => {
    it('should store and retrieve token', async () => {
      // Mock successful authentication response
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').reply(200, tokenResponse);
      
      // Authenticate to store token
      await oauth2Client.authenticate(credentials);
      
      // Get token from storage
      const token = await oauth2Client.getToken();
      
      // Check token
      expect(token).not.toBeNull();
      expect(token?.access_token).toBe(tokenResponse.access_token);
    });
    
    it('should clear token', async () => {
      // Mock successful authentication response
      mockAxios.onPost('https://moj.minimax.rs/RS/AUT/oauth20/token').reply(200, tokenResponse);
      
      // Authenticate to store token
      await oauth2Client.authenticate(credentials);
      
      // Clear token
      await oauth2Client.clearToken();
      
      // Get token from storage
      const token = await oauth2Client.getToken();
      
      // Check token is null
      expect(token).toBeNull();
    });
  });
});
