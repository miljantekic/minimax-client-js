import { TokenRefreshManager } from '../../auth/token-refresh';
import { OAuth2Client } from '../../auth/oauth2';
import { MinimaxToken, AuthenticationError, NetworkError } from '../../types';

// Mock OAuth2Client
jest.mock('../../auth/oauth2');
const MockedOAuth2Client = OAuth2Client as jest.MockedClass<typeof OAuth2Client>;

describe('TokenRefreshManager', () => {
  let oauth2Client: jest.Mocked<OAuth2Client>;
  let tokenRefreshManager: TokenRefreshManager;
  
  const mockToken: MinimaxToken = {
    access_token: 'test-access-token',
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'test-refresh-token',
    obtained_at: Date.now()
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a mocked OAuth2Client
    const mockConfig = { clientId: 'test-client-id', clientSecret: 'test-client-secret' };
    oauth2Client = new MockedOAuth2Client(mockConfig) as jest.Mocked<OAuth2Client>;
    
    // Create a TokenRefreshManager with the mocked OAuth2Client
    tokenRefreshManager = new TokenRefreshManager(oauth2Client);
  });

  describe('getValidToken', () => {
    it('should return the current token if it is valid', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(true);
      
      // Call getValidToken
      const result = await tokenRefreshManager.getValidToken();
      
      // Verify the result
      expect(result).toEqual(mockToken);
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.isTokenValid).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).not.toHaveBeenCalled();
    });

    it('should refresh the token if it is not valid', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      const refreshedToken: MinimaxToken = {
        ...mockToken,
        access_token: 'refreshed-access-token',
        obtained_at: Date.now() + 1000
      };
      oauth2Client.refreshToken.mockResolvedValue(refreshedToken);
      
      // Call getValidToken
      const result = await tokenRefreshManager.getValidToken();
      
      // Verify the result
      expect(result).toEqual(refreshedToken);
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.isTokenValid).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).toHaveBeenCalledWith(mockToken.refresh_token);
    });

    it('should throw an error if no token is available and no refresh token', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(null);
      
      // Call getValidToken and expect it to throw
      await expect(tokenRefreshManager.getValidToken()).rejects.toThrow(AuthenticationError);
      
      // Verify the method calls
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).not.toHaveBeenCalled();
    });

    it('should retry token refresh on network errors', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      // Mock refreshToken to fail with NetworkError on first call and succeed on second call
      const networkError = new NetworkError('Network error');
      const refreshedToken: MinimaxToken = {
        ...mockToken,
        access_token: 'refreshed-access-token',
        obtained_at: Date.now() + 1000
      };
      
      oauth2Client.refreshToken
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(refreshedToken);
      
      // Create a TokenRefreshManager with custom options
      const customTokenRefreshManager = new TokenRefreshManager(oauth2Client, {
        refreshRetryDelay: 10, // Short delay for tests
        maxRefreshAttempts: 2
      });
      
      // Call getValidToken
      const result = await customTokenRefreshManager.getValidToken();
      
      // Verify the result
      expect(result).toEqual(refreshedToken);
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).toHaveBeenCalledTimes(2);
    });

    it('should not retry on authentication errors with 401 status', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      // Mock refreshToken to fail with AuthenticationError
      const authError = new AuthenticationError('Invalid refresh token', 401);
      oauth2Client.refreshToken.mockRejectedValue(authError);
      
      // Call getValidToken and expect it to throw
      await expect(tokenRefreshManager.getValidToken()).rejects.toThrow(AuthenticationError);
      
      // Verify the method calls - should only try once
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).toHaveBeenCalledTimes(1);
    });

    it('should give up after max retry attempts', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      // Mock refreshToken to always fail with NetworkError
      const networkError = new NetworkError('Network error');
      oauth2Client.refreshToken.mockRejectedValue(networkError);
      
      // Create a TokenRefreshManager with custom options
      const customTokenRefreshManager = new TokenRefreshManager(oauth2Client, {
        refreshRetryDelay: 10, // Short delay for tests
        maxRefreshAttempts: 3
      });
      
      // Call getValidToken and expect it to throw
      await expect(customTokenRefreshManager.getValidToken()).rejects.toThrow(NetworkError);
      
      // Verify the method calls - should try maxRefreshAttempts times
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(1);
      expect(oauth2Client.refreshToken).toHaveBeenCalledTimes(3);
    });

    it('should not duplicate refresh requests when called concurrently', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      // Make refreshToken take some time to resolve
      const refreshedToken: MinimaxToken = {
        ...mockToken,
        access_token: 'refreshed-access-token',
        obtained_at: Date.now() + 1000
      };
      
      oauth2Client.refreshToken.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return refreshedToken;
      });
      
      // Call getValidToken multiple times concurrently
      const promises = [
        tokenRefreshManager.getValidToken(),
        tokenRefreshManager.getValidToken(),
        tokenRefreshManager.getValidToken()
      ];
      
      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      
      // Verify the results
      expect(results[0]).toEqual(refreshedToken);
      expect(results[1]).toEqual(refreshedToken);
      expect(results[2]).toEqual(refreshedToken);
      
      // Verify the method calls - should only refresh once
      expect(oauth2Client.getToken).toHaveBeenCalledTimes(3);
      expect(oauth2Client.refreshToken).toHaveBeenCalledTimes(1);
    });
  });
});
