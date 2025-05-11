import { SessionManager } from '../../auth/session';
import { OAuth2Client } from '../../auth/oauth2';
import { TokenRefreshManager } from '../../auth/token-refresh';
import { 
  MinimaxClientConfig, 
  MinimaxCredentials, 
  MinimaxToken, 
  AuthenticationError 
} from '../../types';

// Mock dependencies
jest.mock('../../auth/oauth2');
jest.mock('../../auth/token-refresh');

const MockedOAuth2Client = OAuth2Client as jest.MockedClass<typeof OAuth2Client>;

describe('SessionManager', () => {
  let oauth2Client: jest.Mocked<OAuth2Client>;
  let sessionManager: SessionManager;
  
  const mockConfig: MinimaxClientConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    defaultOrgId: 'default-org-id'
  };
  
  const mockCredentials: MinimaxCredentials = {
    username: 'test-username',
    password: 'test-password'
  };
  
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
    
    // Create mocked dependencies
    oauth2Client = new MockedOAuth2Client(mockConfig) as jest.Mocked<OAuth2Client>;
    
    // Mock TokenRefreshManager constructor and getValidToken method
    (TokenRefreshManager as jest.Mock).mockImplementation(() => {
      return {
        getValidToken: jest.fn().mockResolvedValue(mockToken)
      };
    });
    
    // Create a SessionManager with the mocked dependencies
    sessionManager = new SessionManager(mockConfig, oauth2Client);
  });

  describe('login', () => {
    it('should authenticate with the OAuth2 client', async () => {
      // Mock the OAuth2Client authenticate method
      oauth2Client.authenticate.mockResolvedValue(mockToken);
      
      // Call login
      const result = await sessionManager.login(mockCredentials);
      
      // Verify the result
      expect(result).toEqual(mockToken);
      expect(oauth2Client.authenticate).toHaveBeenCalledTimes(1);
      expect(oauth2Client.authenticate).toHaveBeenCalledWith(mockCredentials);
    });

    it('should use the default organization ID if none is set', async () => {
      // Mock the OAuth2Client authenticate method
      oauth2Client.authenticate.mockResolvedValue(mockToken);
      
      // Call login
      await sessionManager.login(mockCredentials);
      
      // Verify that the default organization ID is used
      expect(sessionManager.getOrganizationId()).toEqual(mockConfig.defaultOrgId);
    });

    it('should not change the organization ID if one is already set', async () => {
      // Mock the OAuth2Client authenticate method
      oauth2Client.authenticate.mockResolvedValue(mockToken);
      
      // Set a custom organization ID
      const customOrgId = 'custom-org-id';
      sessionManager.setOrganizationId(customOrgId);
      
      // Call login
      await sessionManager.login(mockCredentials);
      
      // Verify that the organization ID is not changed
      expect(sessionManager.getOrganizationId()).toEqual(customOrgId);
    });
  });

  describe('logout', () => {
    it('should clear the token and organization ID', async () => {
      // Mock the OAuth2Client clearToken method
      oauth2Client.clearToken.mockResolvedValue();
      
      // Set an organization ID
      sessionManager.setOrganizationId('test-org-id');
      
      // Call logout
      await sessionManager.logout();
      
      // Verify the method calls and state
      expect(oauth2Client.clearToken).toHaveBeenCalledTimes(1);
      expect(sessionManager.getOrganizationId()).toBeNull();
    });
  });

  describe('getSessionState', () => {
    it('should return the current session state when authenticated', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(true);
      
      // Set an organization ID
      const orgId = 'test-org-id';
      sessionManager.setOrganizationId(orgId);
      
      // Call getSessionState
      const state = await sessionManager.getSessionState();
      
      // Verify the result
      expect(state).toEqual({
        isAuthenticated: true,
        organizationId: orgId,
        token: mockToken
      });
    });

    it('should return not authenticated when token is invalid', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      // Call getSessionState
      const state = await sessionManager.getSessionState();
      
      // Verify the result
      expect(state).toEqual({
        isAuthenticated: false,
        organizationId: mockConfig.defaultOrgId,
        token: mockToken
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token is valid', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(true);
      
      // Call isAuthenticated
      const result = await sessionManager.isAuthenticated();
      
      // Verify the result
      expect(result).toBe(true);
    });

    it('should return false when token is invalid', async () => {
      // Mock the OAuth2Client methods
      oauth2Client.getToken.mockResolvedValue(mockToken);
      oauth2Client.isTokenValid.mockReturnValue(false);
      
      // Call isAuthenticated
      const result = await sessionManager.isAuthenticated();
      
      // Verify the result
      expect(result).toBe(false);
    });
  });

  describe('getAuthToken', () => {
    it('should get a valid token from the token refresh manager', async () => {
      // Call getAuthToken
      const result = await sessionManager.getAuthToken();
      
      // Verify the result
      expect(result).toEqual(mockToken);
      
      // Verify that TokenRefreshManager was constructed with the oauth2Client
      expect(TokenRefreshManager).toHaveBeenCalledWith(
        oauth2Client,
        expect.any(Object)
      );
    });

    it('should throw an error if token refresh fails', async () => {
      // Mock TokenRefreshManager to throw an error
      (TokenRefreshManager as jest.Mock).mockImplementation(() => {
        return {
          getValidToken: jest.fn().mockRejectedValue(
            new AuthenticationError('Token refresh failed')
          )
        };
      });
      
      // Create a new SessionManager with the mocked dependencies
      const newSessionManager = new SessionManager(mockConfig, oauth2Client);
      
      // Call getAuthToken and expect it to throw
      await expect(newSessionManager.getAuthToken()).rejects.toThrow(AuthenticationError);
    });
  });

  describe('organization management', () => {
    it('should get and set the organization ID', () => {
      // Initial value should be the default from config
      expect(sessionManager.getOrganizationId()).toEqual(mockConfig.defaultOrgId);
      
      // Set a new organization ID
      const newOrgId = 'new-org-id';
      sessionManager.setOrganizationId(newOrgId);
      
      // Verify that the organization ID was updated
      expect(sessionManager.getOrganizationId()).toEqual(newOrgId);
    });
  });

  describe('getOAuth2Client', () => {
    it('should return the OAuth2 client instance', () => {
      // Call getOAuth2Client
      const result = sessionManager.getOAuth2Client();
      
      // Verify the result
      expect(result).toBe(oauth2Client);
    });
  });
});
