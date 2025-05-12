/**
 * Customers module
 * 
 * Module for interacting with customers in the Minimax API
 */

import { BaseResource } from './base-resource';

/**
 * Customer resource
 */
export interface Customer {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
  
  /**
   * Customer name
   */
  Name: string;
  
  /**
   * Tax number
   */
  TaxNumber?: string;
  
  /**
   * Registration number
   */
  RegistrationNumber?: string;
  
  /**
   * Email
   */
  Email?: string;
  
  /**
   * Phone
   */
  Phone?: string;
  
  /**
   * Address
   */
  Address?: {
    Street?: string;
    City?: string;
    PostalCode?: string;
    Country?: string;
  };
  
  /**
   * Customer type
   */
  Type?: 'Individual' | 'Company';
  
  /**
   * Whether the customer is active
   */
  IsActive: boolean;
}

/**
 * Customer creation parameters
 */
export interface CreateCustomerParams {
  /**
   * Customer name
   */
  Name: string;
  
  /**
   * Tax number
   */
  TaxNumber?: string;
  
  /**
   * Registration number
   */
  RegistrationNumber?: string;
  
  /**
   * Email
   */
  Email?: string;
  
  /**
   * Phone
   */
  Phone?: string;
  
  /**
   * Address
   */
  Address?: {
    Street?: string;
    City?: string;
    PostalCode?: string;
    Country?: string;
  };
  
  /**
   * Customer type
   */
  Type?: 'Individual' | 'Company';
  
  /**
   * Whether the customer is active
   */
  IsActive?: boolean;
}

/**
 * Customer update parameters
 */
export interface UpdateCustomerParams {
  /**
   * Customer name
   */
  Name?: string;
  
  /**
   * Tax number
   */
  TaxNumber?: string;
  
  /**
   * Registration number
   */
  RegistrationNumber?: string;
  
  /**
   * Email
   */
  Email?: string;
  
  /**
   * Phone
   */
  Phone?: string;
  
  /**
   * Address
   */
  Address?: {
    Street?: string;
    City?: string;
    PostalCode?: string;
    Country?: string;
  };
  
  /**
   * Customer type
   */
  Type?: 'Individual' | 'Company';
  
  /**
   * Whether the customer is active
   */
  IsActive?: boolean;
}

/**
 * Customer list response
 */
interface CustomerListResponse {
  /**
   * Array of customers
   */
  value: Customer[];
  
  /**
   * Total count of customers (if requested)
   */
  '@odata.count'?: number;
}

/**
 * Customer filter options
 */
export interface CustomerFilterOptions {
  /**
   * Filter by name (contains)
   */
  name?: string;
  
  /**
   * Filter by tax number
   */
  taxNumber?: string;
  
  /**
   * Filter by type
   */
  type?: 'Individual' | 'Company';
  
  /**
   * Filter by active status
   */
  isActive?: boolean;
  
  /**
   * Maximum number of results to return
   */
  limit?: number;
  
  /**
   * Number of results to skip
   */
  offset?: number;
  
  /**
   * Whether to include the total count
   */
  count?: boolean;
}

/**
 * Customers module
 */
export class CustomersModule extends BaseResource {
  /**
   * Base endpoint for customers
   */
  protected readonly endpoint = 'customers';
  
  /**
   * Get all customers
   * 
   * @param options Filter options
   * @returns Promise resolving to an array of customers
   */
  public async getAll(options: CustomerFilterOptions = {}): Promise<Customer[]> {
    const params: Record<string, any> = {};
    
    // Build filter string
    const filters: string[] = [];
    
    if (options.name) {
      filters.push(`contains(Name, '${options.name}')`);
    }
    
    if (options.taxNumber) {
      filters.push(`TaxNumber eq '${options.taxNumber}'`);
    }
    
    if (options.type) {
      filters.push(`Type eq '${options.type}'`);
    }
    
    if (options.isActive !== undefined) {
      filters.push(`IsActive eq ${options.isActive}`);
    }
    
    if (filters.length > 0) {
      params.$filter = filters.join(' and ');
    }
    
    // Add pagination
    if (options.limit) {
      params.$top = options.limit;
    }
    
    if (options.offset) {
      params.$skip = options.offset;
    }
    
    // Add count
    if (options.count) {
      params.$count = true;
    }
    
    const response = await this.client.get<CustomerListResponse>(this.endpoint, { params });
    return response.value;
  }
  
  /**
   * Get a customer by ID
   * 
   * @param id Customer ID
   * @returns Promise resolving to the customer
   */
  public async get(id: string): Promise<Customer> {
    return this.client.get<Customer>(this.getEndpoint(id));
  }
  
  /**
   * Create a new customer
   * 
   * @param params Customer creation parameters
   * @returns Promise resolving to the created customer
   */
  public async create(params: CreateCustomerParams): Promise<Customer> {
    return this.client.post<Customer>(this.endpoint, params);
  }
  
  /**
   * Update a customer
   * 
   * @param id Customer ID
   * @param params Customer update parameters
   * @returns Promise resolving to the updated customer
   */
  public async update(id: string, params: UpdateCustomerParams): Promise<Customer> {
    return this.client.put<Customer>(this.getEndpoint(id), params);
  }
  
  /**
   * Delete a customer
   * 
   * @param id Customer ID
   * @returns Promise resolving when the customer is deleted
   */
  public async delete(id: string): Promise<void> {
    await this.client.delete(this.getEndpoint(id));
  }
}
