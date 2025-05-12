/**
 * Organizations module for the Minimax client
 * Handles operations related to organizations
 */

import { BaseResource } from './base-resource';

/**
 * Organization interface
 */
export interface Organization {
  /**
   * Organization ID
   */
  ID: string;
  
  /**
   * Organization name
   */
  Name: string;
  
  /**
   * Resource URL
   */
  ResourceUrl: string;
}

/**
 * Organization with access interface
 */
export interface OrganizationWithAccess {
  /**
   * Organization
   */
  Organisation: Organization;
  
  /**
   * API access
   */
  APIAccess: string;
  
  /**
   * Mobile access
   */
  MobileAccess: string;
}

/**
 * Organizations response
 */
export interface OrganizationsResponse {
  /**
   * Rows of organizations
   */
  Rows: OrganizationWithAccess[];
  
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
 * Organizations module
 */
export class OrganizationsModule extends BaseResource {
  /**
   * Endpoint for organizations
   */
  protected readonly endpoint = 'api/currentuser/orgs';
  
  /**
   * Get all organizations for the current user
   * 
   * @returns Promise that resolves to a list of organizations
   */
  public async getAll(): Promise<Organization[]> {
    const response = await this.client.get<OrganizationsResponse>(this.endpoint);
    
    // Extract organizations from the response
    return response.Rows.map(row => row.Organisation);
  }
  
  /**
   * Find organization by name
   * 
   * @param name Name to find
   * @returns Promise that resolves to the organization or null if not found
   */
  public async findByName(name: string): Promise<Organization | null> {
    const organizations = await this.getAll();
    return organizations.find(org => org.Name === name) || null;
  }
  
  /**
   * Find organization by identifier (alias for findByName)
   * 
   * @param identifier Organization identifier (registration number) to find
   * @returns Promise that resolves to the organization or null if not found
   */
  public async findByIdentifier(identifier: string): Promise<Organization | null> {
    return this.findByName(identifier);
  }
}
