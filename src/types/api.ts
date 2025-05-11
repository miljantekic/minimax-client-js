/**
 * API module base types for the Minimax client library
 */

import { MinimaxResource, QueryParams } from './index';
import { ListResponse, BatchOperationResponse } from './responses';
import { HttpRequestOptions } from './http';

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
  get(id: string, options?: HttpRequestOptions): Promise<T>;

  /**
   * List resources with optional filtering, sorting, and pagination
   */
  list(options?: ListOptions): Promise<ListResponse<T>>;

  /**
   * Create a new resource
   */
  create(params: CreateParams, options?: HttpRequestOptions): Promise<T>;

  /**
   * Update an existing resource
   */
  update(id: string, params: UpdateParams, options?: HttpRequestOptions): Promise<T>;

  /**
   * Delete a resource by ID
   */
  delete(id: string, options?: HttpRequestOptions): Promise<void>;
}

/**
 * Base interface for API modules that don't support all CRUD operations
 */
export interface ReadOnlyApiModule<T extends MinimaxResource> {
  /**
   * Get a resource by ID
   */
  get(id: string, options?: HttpRequestOptions): Promise<T>;

  /**
   * List resources with optional filtering, sorting, and pagination
   */
  list(options?: ListOptions): Promise<ListResponse<T>>;
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

/**
 * Base interface for an API module that supports batch operations
 */
export interface BatchApiModule<T extends MinimaxResource, BatchParams> {
  /**
   * Execute a batch operation
   */
  batch(params: BatchParams[], options?: BatchOperationOptions): Promise<BatchOperationResponse<T>>;
}
