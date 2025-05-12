/**
 * Base resource module
 * 
 * Base class for all API resource modules
 */

import { MinimaxClient } from '../minimax-client';

/**
 * Generic list response interface
 */
export interface ListResponse<T> {
  /**
   * Array of items
   */
  Rows: T[];
  
  /**
   * Total rows
   */
  TotalRows: number;
  
  /**
   * Current page number
   */
  CurrentPageNumber: number;
  
  /**
   * Page size
   */
  PageSize: number;
}

/**
 * Base resource module
 */
export abstract class BaseResource {
  /**
   * Base endpoint for the resource
   */
  protected abstract readonly endpoint: string;
  
  /**
   * Minimax client instance
   */
  protected readonly client: MinimaxClient;
  
  /**
   * Create a new resource module
   * 
   * @param client Minimax client instance
   */
  constructor(client: MinimaxClient) {
    this.client = client;
  }
  
  /**
   * Get the full endpoint URL for a resource
   * 
   * @param path Optional path to append to the base endpoint
   * @returns Full endpoint URL
   */
  protected getEndpoint(path?: string): string {
    // Construct the base path with the optional path parameter
    const basePath = path ? `${this.endpoint}/${path}` : this.endpoint;
    
    // If the endpoint already starts with 'api/', return it as is
    if (basePath.startsWith('api/')) {
      console.log(`Base path already starts with 'api/': ${basePath}`);
      return basePath;
    }
    
    // For organization-specific endpoints that require an organization ID
    const organizationId = this.client.getOrganizationId();
    if (organizationId && !basePath.includes('/orgs/')) {
      // Use the correct pattern: /api/orgs/{orgId}/...
      console.log(`Using organization ID: ${organizationId}`, `Base path: ${basePath}`);
      return `api/orgs/${organizationId}/${basePath}`;
    }
    
    // For non-organization-specific endpoints
    return `api/${basePath}`;
  }
}
