/**
 * Journal Types module
 * 
 * Module for interacting with journal types in the Minimax API
 */

import { BaseResource, ListResponse } from './base-resource';

/**
 * Journal Type resource
 */
export interface JournalType {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Journal type code
   */
  Code: string;
  
  /**
   * Journal type name
   */
  Name: string;
  
  /**
   * Row version for concurrency control
   */
  RowVersion: string;
}

/**
 * Journal type filter options
 */
export interface JournalTypeFilterOptions {
  /**
   * Search string - queries search for specified value across various predefined fields
   */
  searchString?: string;
  
  /**
   * Current page index starting with 1 for first page
   */
  currentPage?: number;
  
  /**
   * Page size defines number of records returned per page
   */
  pageSize?: number;
  
  /**
   * Field name that is used for sorting/ordering result rows
   */
  sortField?: string;
  
  /**
   * Sort order: A - ascending; D - descending
   */
  order?: 'A' | 'D';
}

/**
 * Journal types module
 */
export class JournalTypesModule extends BaseResource {
  /**
   * Base endpoint for journal types
   */
  protected readonly endpoint = 'journaltypes';
  
  /**
   * Get all journal types
   * 
   * @param options Filter options
   * @returns Promise resolving to an array of journal types
   */
  public async getAll(options: JournalTypeFilterOptions = {}): Promise<JournalType[]> {
    const params: Record<string, any> = {};
    
    // Add search string parameter
    if (options.searchString) {
      params.SearchString = options.searchString;
    }
    
    // Add pagination parameters
    if (options.currentPage) {
      params.CurrentPage = options.currentPage;
    }
    
    if (options.pageSize) {
      params.PageSize = options.pageSize;
    }
    
    // Add sorting parameters
    if (options.sortField) {
      params.SortField = options.sortField;
    }
    
    if (options.order) {
      params.Order = options.order;
    }
    
    const response = await this.client.get<ListResponse<JournalType>>(this.getEndpoint(), { params });
    return response.Rows;
  }
  
  /**
   * Get a journal type by ID
   * 
   * @param id Journal type ID
   * @returns Promise resolving to the journal type
   */
  public async get(id: string): Promise<JournalType> {
    return this.client.get<JournalType>(this.getEndpoint(id));
  }
  
  /**
   * Get a journal type by code
   * 
   * @param code Journal type code
   * @returns Promise resolving to the journal type
   */
  public async getByCode(code: string): Promise<JournalType> {
    return this.client.get<JournalType>(this.getEndpoint(`code(${code})`));
  }
}
