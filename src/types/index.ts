/**
 * Base type definitions for the Minimax client library
 * 
 * This barrel file exports all types from the module
 */

// Export all types from this file
export * from './errors';
export * from './http';
export * from './api';
export * from './responses';

/**
 * Configuration options for the Minimax client
 */
export interface MinimaxClientConfig {
  /**
   * Client ID obtained from Minimax application registration
   */
  clientId: string;
  
  /**
   * Client secret obtained from Minimax application registration
   */
  clientSecret: string;
  
  /**
   * Base URL for the Minimax API (defaults to https://moj.minimax.rs/RS/API/)
   */
  baseUrl?: string;
  
  /**
   * Authentication URL for the Minimax API (defaults to https://moj.minimax.rs/RS/AUT/oauth20/token)
   */
  authUrl?: string;
  
  /**
   * Default organization ID to use for API calls
   */
  defaultOrgId?: string;
  
  /**
   * Timeout for API requests in milliseconds (defaults to 30000)
   */
  timeout?: number;
  
  /**
   * Default headers to include in all requests
   */
  headers?: Record<string, string>;
}

/**
 * Authentication credentials for the Minimax API
 */
export interface MinimaxCredentials {
  /**
   * Username for Minimax account
   */
  username: string;
  
  /**
   * Password for Minimax account
   */
  password: string;
  
  /**
   * OAuth2 scope (defaults to "minimax.rs")
   */
  scope?: string;
}

/**
 * OAuth2 token response from the Minimax API
 */
export interface MinimaxToken {
  /**
   * Access token for API requests
   */
  access_token: string;
  
  /**
   * Token type (typically "bearer")
   */
  token_type: string;
  
  /**
   * Expiration time in seconds
   */
  expires_in: number;
  
  /**
   * Refresh token for obtaining a new access token
   */
  refresh_token: string;
  
  /**
   * Timestamp when the token was obtained (added by the client)
   */
  obtained_at?: number;
}

/**
 * Base interface for all Minimax API resources
 */
export interface MinimaxResource {
  /**
   * Unique identifier for the resource
   */
  Id: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
}

/**
 * Base pagination parameters for list operations
 */
export interface PaginationParams {
  /**
   * Maximum number of records to return
   */
  $top?: number;
  
  /**
   * Number of records to skip
   */
  $skip?: number;
}

/**
 * Base sorting parameters for list operations
 */
export interface SortingParams {
  /**
   * Field to sort by, optionally followed by "asc" or "desc"
   */
  $orderby?: string;
}

/**
 * Base filtering parameters for list operations
 */
export interface FilteringParams {
  /**
   * OData-style filter expression
   */
  $filter?: string;
}

/**
 * Base expansion parameters for list operations
 */
export interface ExpansionParams {
  /**
   * Related entities to include
   */
  $expand?: string;
}

/**
 * Combined query parameters for list operations
 */
export type QueryParams = PaginationParams & SortingParams & FilteringParams & ExpansionParams;

/**
 * Base response for list operations
 */
export interface ListResponse<T> {
  /**
   * Array of resources
   */
  value: T[];
  
  /**
   * Total count of resources (if requested)
   */
  '@odata.count'?: number;
}

/**
 * Base error response from the Minimax API
 */
export interface MinimaxErrorResponse {
  /**
   * Error code
   */
  error?: string;
  
  /**
   * Error description
   */
  error_description?: string;
  
  /**
   * Detailed error message
   */
  message?: string;
  
  /**
   * Error details
   */
  details?: string;
}

/**
 * Organization resource
 */
export interface Organization extends MinimaxResource {
  /**
   * Organization name
   */
  Name: string;
  
  /**
   * Organization tax number
   */
  TaxNumber: string;
  
  /**
   * Organization registration number
   */
  RegistrationNumber: string;
  
  /**
   * Whether the organization is active
   */
  IsActive: boolean;
}

/**
 * User resource
 */
export interface User extends MinimaxResource {
  /**
   * User's full name
   */
  FullName: string;
  
  /**
   * User's email address
   */
  Email: string;
  
  /**
   * User's username
   */
  Username: string;
}

/**
 * Address information
 */
export interface Address {
  /**
   * Street address
   */
  Street: string;
  
  /**
   * City
   */
  City: string;
  
  /**
   * Postal code
   */
  PostalCode: string;
  
  /**
   * Country
   */
  Country: string;
}

/**
 * Contact information
 */
export interface Contact extends MinimaxResource {
  /**
   * Contact name
   */
  Name: string;
  
  /**
   * Contact email
   */
  Email?: string;
  
  /**
   * Contact phone
   */
  Phone?: string;
  
  /**
   * Contact position
   */
  Position?: string;
}

// Simplified configuration types
