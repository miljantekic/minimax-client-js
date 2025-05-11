import {
  AuthErrorCode,
  createAuthError,
  handleAuthError,
  isAccountLockoutError,
  isInvalidCredentialsError,
  isTokenExpiredError
} from '../../auth/auth-error';
import { MinimaxErrorResponse, AuthenticationError } from '../../types';

describe('Auth Error Handling', () => {
  describe('createAuthError', () => {
    it('should create an AuthenticationError with appropriate message for invalid client', () => {
      const errorResponse: MinimaxErrorResponse = {
        error: AuthErrorCode.INVALID_CLIENT,
        error_description: 'Client authentication failed'
      };
      
      const error = createAuthError(errorResponse, 401);
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toContain('Invalid client credentials');
      expect(error.message).toContain('(Client authentication failed)');
      expect(error.statusCode).toBe(401);
    });
    
    it('should create an AuthenticationError with appropriate message for invalid grant', () => {
      const errorResponse: MinimaxErrorResponse = {
        error: AuthErrorCode.INVALID_GRANT,
        error_description: 'Invalid username or password'
      };
      
      const error = createAuthError(errorResponse, 400);
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toContain('Invalid user credentials');
      expect(error.message).toContain('(Invalid username or password)');
      expect(error.statusCode).toBe(400);
    });
    
    it('should create an AuthenticationError with default message when no specific error code is provided', () => {
      const errorResponse: MinimaxErrorResponse = {
        error_description: 'Something went wrong'
      };
      
      const error = createAuthError(errorResponse, 500);
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
    });
  });
  
  describe('handleAuthError', () => {
    it('should handle axios error with OAuth2 error response', () => {
      const axiosError = {
        response: {
          data: {
            error: AuthErrorCode.INVALID_CLIENT,
            error_description: 'Client authentication failed'
          },
          status: 401
        }
      };
      
      const error = handleAuthError(axiosError);
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toContain('Invalid client credentials');
      expect(error.statusCode).toBe(401);
    });
    
    it('should handle network errors', () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };
      
      const error = handleAuthError(networkError);
      
      expect(error.message).toContain('Network error during authentication');
    });
    
    it('should handle generic errors', () => {
      const genericError = new Error('Something went wrong');
      
      const error = handleAuthError(genericError);
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.message).toBe('Something went wrong');
    });
  });
  
  describe('Error detection helpers', () => {
    it('should detect account lockout errors', () => {
      const lockoutError = new AuthenticationError('Your account has been locked due to too many attempts');
      const otherError = new AuthenticationError('Invalid credentials');
      
      expect(isAccountLockoutError(lockoutError)).toBe(true);
      expect(isAccountLockoutError(otherError)).toBe(false);
    });
    
    it('should detect invalid credentials errors', () => {
      const credentialsError = new AuthenticationError('Invalid username or password');
      const otherError = new AuthenticationError('Server error');
      
      expect(isInvalidCredentialsError(credentialsError)).toBe(true);
      expect(isInvalidCredentialsError(otherError)).toBe(false);
    });
    
    it('should detect token expired errors', () => {
      const expiredError = new AuthenticationError('Token has expired');
      const statusError = new AuthenticationError('Unauthorized', 401);
      const otherError = new AuthenticationError('Server error', 500);
      
      expect(isTokenExpiredError(expiredError)).toBe(true);
      expect(isTokenExpiredError(statusError)).toBe(true);
      expect(isTokenExpiredError(otherError)).toBe(false);
    });
  });
});
