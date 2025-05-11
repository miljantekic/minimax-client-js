/**
 * API module base types for the Minimax client library
 */

import { MinimaxResource, QueryParams } from './index';
import { HttpRequestOptions } from './http';

/**
 * Base interface for API module options
 */
export interface ApiModuleOptions {
  /**
   * Organization ID to use for API calls
   */
  orgId?: string;
}

/**
 * Base interface for resource creation options
 */
export interface CreateOptions extends HttpRequestOptions {}

/**
 * Base interface for resource retrieval options
 */
export interface GetOptions extends HttpRequestOptions {}

/**
 * Base interface for resource update options
 */
export interface UpdateOptions extends HttpRequestOptions {}

/**
 * Base interface for resource deletion options
 */
export interface DeleteOptions extends HttpRequestOptions {}

/**
 * Base interface for resource listing options
 */
export interface ListOptions extends HttpRequestOptions, QueryParams {}

/**
 * Base interface for all API modules
 */
export interface ApiModule<T extends MinimaxResource, CreateParams, UpdateParams> {
  /**
   * Get a resource by ID
   */
  get(id: string, options?: GetOptions): Promise<T>;

  /**
   * List resources with optional filtering, sorting, and pagination
   */
  list(options?: ListOptions): Promise<T[]>;

  /**
   * Create a new resource
   */
  create(params: CreateParams, options?: CreateOptions): Promise<T>;

  /**
   * Update an existing resource
   */
  update(id: string, params: UpdateParams, options?: UpdateOptions): Promise<T>;

  /**
   * Delete a resource by ID
   */
  delete(id: string, options?: DeleteOptions): Promise<void>;
}

/**
 * Base interface for API modules that don't support all CRUD operations
 */
export interface ReadOnlyApiModule<T extends MinimaxResource> {
  /**
   * Get a resource by ID
   */
  get(id: string, options?: GetOptions): Promise<T>;

  /**
   * List resources with optional filtering, sorting, and pagination
   */
  list(options?: ListOptions): Promise<T[]>;
}

/**
 * Base class for implementing custom actions on API resources
 */
export interface CustomActionOptions extends HttpRequestOptions {
  /**
   * HTTP method to use for the custom action
   * @default 'POST'
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

/**
 * Base interface for batch operations
 */
export interface BatchOperationOptions extends HttpRequestOptions {
  /**
   * Whether to continue processing if an operation fails
   * @default false
   */
  continueOnError?: boolean;
}
