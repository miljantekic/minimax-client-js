/**
 * Tests for token storage implementations
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { 
  FileTokenStorage, 
  EnvTokenStorage, 
  CustomTokenStorage 
} from '../../auth/token-storage';
import { MinimaxToken } from '../../types';

// Mock token for testing
const mockToken: MinimaxToken = {
  access_token: 'test-access-token',
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_token: 'test-refresh-token',
  obtained_at: Date.now()
};

describe('FileTokenStorage', () => {
  let tempDir: string;
  let tokenFilePath: string;
  let fileStorage: FileTokenStorage;

  beforeEach(() => {
    // Create a temporary directory for testing
    tempDir = path.join(os.tmpdir(), `minimax-test-${Date.now()}`);
    tokenFilePath = path.join(tempDir, 'token.json');
    fileStorage = new FileTokenStorage({ filePath: tokenFilePath });
  });

  afterEach(async () => {
    // Clean up the temporary directory
    try {
      if (fs.existsSync(tempDir)) {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      }
    } catch (error) {
      console.error('Error cleaning up temp directory:', error);
    }
  });

  test('should save and retrieve a token', async () => {
    await fileStorage.saveToken(mockToken);
    const retrievedToken = await fileStorage.getToken();
    expect(retrievedToken).toEqual(mockToken);
  });

  test('should return null when token file does not exist', async () => {
    const retrievedToken = await fileStorage.getToken();
    expect(retrievedToken).toBeNull();
  });

  test('should clear the token by deleting the file', async () => {
    await fileStorage.saveToken(mockToken);
    expect(fs.existsSync(tokenFilePath)).toBe(true);
    
    await fileStorage.clearToken();
    expect(fs.existsSync(tokenFilePath)).toBe(false);
  });

  test('should create directory if it does not exist', async () => {
    const nestedDir = path.join(tempDir, 'nested', 'dir');
    const nestedFilePath = path.join(nestedDir, 'token.json');
    const nestedStorage = new FileTokenStorage({ filePath: nestedFilePath });
    
    await nestedStorage.saveToken(mockToken);
    expect(fs.existsSync(nestedFilePath)).toBe(true);
  });

  test('should not create directory if createDir is false', async () => {
    const nestedDir = path.join(tempDir, 'no-create', 'dir');
    const nestedFilePath = path.join(nestedDir, 'token.json');
    const nestedStorage = new FileTokenStorage({ 
      filePath: nestedFilePath,
      createDir: false 
    });
    
    await expect(nestedStorage.saveToken(mockToken)).rejects.toThrow();
  });

  test('should set file permissions correctly', async () => {
    const permissionStorage = new FileTokenStorage({ 
      filePath: tokenFilePath,
      fileMode: 0o644 
    });
    
    await permissionStorage.saveToken(mockToken);
    
    // Check file permissions (only works on Unix-like systems)
    if (process.platform !== 'win32') {
      const stats = await fs.promises.stat(tokenFilePath);
      expect(stats.mode & 0o777).toBe(0o644);
    }
  });
});

describe('EnvTokenStorage', () => {
  const envName = 'TEST_MINIMAX_TOKEN';
  let envStorage: EnvTokenStorage;

  beforeEach(() => {
    // Create a new EnvTokenStorage with a test environment variable
    envStorage = new EnvTokenStorage({ envName });
    // Clear the environment variable before each test
    delete process.env[envName];
  });

  test('should save and retrieve a token', async () => {
    await envStorage.saveToken(mockToken);
    const retrievedToken = await envStorage.getToken();
    expect(retrievedToken).toEqual(mockToken);
  });

  test('should return null when environment variable does not exist', async () => {
    const retrievedToken = await envStorage.getToken();
    expect(retrievedToken).toBeNull();
  });

  test('should clear the token by deleting the environment variable', async () => {
    await envStorage.saveToken(mockToken);
    expect(process.env[envName]).toBeDefined();
    
    await envStorage.clearToken();
    expect(process.env[envName]).toBeUndefined();
  });

  test('should return null when environment variable contains invalid JSON', async () => {
    process.env[envName] = 'invalid-json';
    const retrievedToken = await envStorage.getToken();
    expect(retrievedToken).toBeNull();
  });
});

describe('CustomTokenStorage', () => {
  test('should use custom implementation functions', async () => {
    let storedToken: MinimaxToken | null = null;
    
    const customStorage = new CustomTokenStorage({
      saveToken: async (token) => {
        storedToken = token;
      },
      getToken: async () => {
        return storedToken;
      },
      clearToken: async () => {
        storedToken = null;
      }
    });
    
    await customStorage.saveToken(mockToken);
    expect(storedToken).toEqual(mockToken);
    
    const retrievedToken = await customStorage.getToken();
    expect(retrievedToken).toEqual(mockToken);
    
    await customStorage.clearToken();
    expect(storedToken).toBeNull();
  });
});
