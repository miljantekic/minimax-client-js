/**
 * Token storage implementations for the Minimax client
 * 
 * This module provides different token storage implementations for the Minimax client
 */

import fs from 'fs';
import path from 'path';
import { TokenStorage, MinimaxToken } from '../types';

/**
 * File-based token storage options
 */
export interface FileTokenStorageOptions {
  /**
   * File path where the token will be stored
   * @default '.minimax-token.json' in the current working directory
   */
  filePath?: string;

  /**
   * Whether to create the directory if it doesn't exist
   * @default true
   */
  createDir?: boolean;

  /**
   * File permissions (chmod) to set on the token file
   * @default 0o600 (read/write for owner only)
   */
  fileMode?: number;
}

/**
 * File-based token storage implementation
 * 
 * Stores the token in a JSON file on disk
 */
export class FileTokenStorage implements TokenStorage {
  private readonly filePath: string;
  private readonly createDir: boolean;
  private readonly fileMode: number;

  /**
   * Create a new file-based token storage
   * 
   * @param options - File token storage options
   */
  constructor(options: FileTokenStorageOptions = {}) {
    this.filePath = options.filePath || path.join(process.cwd(), '.minimax-token.json');
    this.createDir = options.createDir !== false;
    this.fileMode = options.fileMode || 0o600;
  }

  /**
   * Save a token to the file
   * 
   * @param token - Token to save
   */
  public async saveToken(token: MinimaxToken): Promise<void> {
    const dir = path.dirname(this.filePath);
    
    // Create directory if it doesn't exist
    if (this.createDir) {
      await fs.promises.mkdir(dir, { recursive: true }).catch(() => {});
    }

    // Write token to file
    await fs.promises.writeFile(
      this.filePath,
      JSON.stringify(token, null, 2),
      { mode: this.fileMode }
    );
  }

  /**
   * Get the token from the file
   * 
   * @returns The token or null if not found
   */
  public async getToken(): Promise<MinimaxToken | null> {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf8');
      return JSON.parse(data) as MinimaxToken;
    } catch (error) {
      // File doesn't exist or can't be read
      return null;
    }
  }

  /**
   * Clear the token by deleting the file
   */
  public async clearToken(): Promise<void> {
    try {
      await fs.promises.unlink(this.filePath);
    } catch (error) {
      // File doesn't exist or can't be deleted
    }
  }
}

/**
 * Environment variable token storage options
 */
export interface EnvTokenStorageOptions {
  /**
   * Environment variable name for storing the token
   * @default 'MINIMAX_TOKEN'
   */
  envName?: string;
}

/**
 * Environment variable-based token storage implementation
 * 
 * Stores the token in an environment variable
 * Note: This is mainly for testing and development purposes
 * as environment variables are not secure for token storage in production
 */
export class EnvTokenStorage implements TokenStorage {
  private readonly envName: string;

  /**
   * Create a new environment variable token storage
   * 
   * @param options - Environment token storage options
   */
  constructor(options: EnvTokenStorageOptions = {}) {
    this.envName = options.envName || 'MINIMAX_TOKEN';
  }

  /**
   * Save a token to the environment variable
   * 
   * @param token - Token to save
   */
  public async saveToken(token: MinimaxToken): Promise<void> {
    process.env[this.envName] = JSON.stringify(token);
  }

  /**
   * Get the token from the environment variable
   * 
   * @returns The token or null if not found
   */
  public async getToken(): Promise<MinimaxToken | null> {
    const tokenJson = process.env[this.envName];
    if (!tokenJson) {
      return null;
    }

    try {
      return JSON.parse(tokenJson) as MinimaxToken;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear the token by deleting the environment variable
   */
  public async clearToken(): Promise<void> {
    delete process.env[this.envName];
  }
}

/**
 * Custom token storage options
 */
export interface CustomTokenStorageOptions {
  /**
   * Function to save a token
   */
  saveToken: (token: MinimaxToken) => Promise<void>;

  /**
   * Function to get the current token
   */
  getToken: () => Promise<MinimaxToken | null>;

  /**
   * Function to clear the current token
   */
  clearToken: () => Promise<void>;
}

/**
 * Custom token storage implementation
 * 
 * Allows for custom token storage implementations
 */
export class CustomTokenStorage implements TokenStorage {
  private readonly options: CustomTokenStorageOptions;

  /**
   * Create a new custom token storage
   * 
   * @param options - Custom token storage options
   */
  constructor(options: CustomTokenStorageOptions) {
    this.options = options;
  }

  /**
   * Save a token using the custom save function
   * 
   * @param token - Token to save
   */
  public async saveToken(token: MinimaxToken): Promise<void> {
    return this.options.saveToken(token);
  }

  /**
   * Get the token using the custom get function
   * 
   * @returns The token or null if not found
   */
  public async getToken(): Promise<MinimaxToken | null> {
    return this.options.getToken();
  }

  /**
   * Clear the token using the custom clear function
   */
  public async clearToken(): Promise<void> {
    return this.options.clearToken();
  }
}
