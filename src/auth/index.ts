/**
 * Authentication module for the Minimax client library
 * 
 * This module handles OAuth2 authentication with the Minimax API
 */

import { OAuth2Client } from './oauth2';
import {
  FileTokenStorage,
  FileTokenStorageOptions,
  EnvTokenStorage,
  EnvTokenStorageOptions,
  CustomTokenStorage,
  CustomTokenStorageOptions
} from './token-storage';

export {
  OAuth2Client,
  FileTokenStorage,
  FileTokenStorageOptions,
  EnvTokenStorage,
  EnvTokenStorageOptions,
  CustomTokenStorage,
  CustomTokenStorageOptions
};
