/**
 * Employees module
 * 
 * Module for interacting with employees in the Minimax API
 */

import { BaseResource, ListResponse } from './base-resource';

/**
 * Employee resource
 */
export interface Employee {
  /**
   * Employee ID
   */
  ID: string;
  
  /**
   * First name
   */
  FirstName: string;
  
  /**
   * Last name
   */
  LastName: string;
  
  /**
   * Full name
   */
  FullName: string;
  
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
  Address?: string;
  
  /**
   * Position
   */
  Position?: string;
  
  /**
   * Department
   */
  Department?: string;
  
  /**
   * Status (Active/Inactive)
   */
  Status: string;
  
  /**
   * Employment date
   */
  EmploymentDate?: string;
  
  /**
   * Termination date
   */
  TerminationDate?: string;
  
  /**
   * Record modified date
   */
  RecordDtModified?: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
}

/**
 * Employees list response
 */
export type EmployeesListResponse = ListResponse<Employee>;

/**
 * Employee filter options
 */
export interface EmployeeFilterOptions {
  /**
   * Filter by status
   */
  status?: 'Active' | 'Inactive';
  
  /**
   * Filter by department
   */
  department?: string;
  
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
 * Employees module
 */
export class EmployeesModule extends BaseResource {
  /**
   * Base endpoint for employees
   * The actual endpoint will be constructed as api/orgs/{organizationId}/employees
   */
  protected readonly endpoint = 'employees';
  
  /**
   * Get all employees
   * 
   * @param options Filter options
   * @returns Promise resolving to an array of employees
   */
  public async getAll(options: EmployeeFilterOptions = {}): Promise<Employee[]> {
    const params: Record<string, any> = {};
    
    // Add pagination
    if (options.limit) {
      params.pageSize = options.limit;
    }
    
    if (options.offset) {
      const page = Math.floor(options.offset / (options.limit || 10)) + 1;
      params.page = page;
    }
    
    // Add count
    if (options.count) {
      params.$count = true;
    }
    
    // Add filters
    if (options.status) {
      params.status = options.status;
    }
    
    if (options.department) {
      params.department = options.department;
    }
      
    const response = await this.client.get<EmployeesListResponse>(this.getEndpoint(), { params });
    return response.Rows;
  }
  
  /**
   * Get an employee by ID
   * 
   * @param id Employee ID
   * @returns Promise resolving to the employee
   */
  public async get(id: string): Promise<Employee> {
    return this.client.get<Employee>(this.getEndpoint(id));
  }
  
  /**
   * Create a new employee
   * 
   * @param data Employee data
   * @returns Promise resolving to the created employee
   */
  public async create(data: Omit<Employee, 'ID' | 'RowVersion'>): Promise<Employee> {
    return this.client.post<Employee>(this.getEndpoint(), data);
  }
  
  /**
   * Update an employee
   * 
   * @param id Employee ID
   * @param data Employee data with RowVersion
   * @returns Promise resolving to the updated employee
   */
  public async update(id: string, data: Partial<Employee> & { RowVersion: string }): Promise<Employee> {
    return this.client.put<Employee>(this.getEndpoint(id), data);
  }
  
  /**
   * Delete an employee
   * 
   * @param id Employee ID
   * @param rowVersion RowVersion for concurrency control
   * @returns Promise resolving when the employee is deleted
   */
  public async delete(id: string, rowVersion: string): Promise<void> {
    return this.client.delete(this.getEndpoint(id), {
      params: { RowVersion: rowVersion }
    });
  }
}
