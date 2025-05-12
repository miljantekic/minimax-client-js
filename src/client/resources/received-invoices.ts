/**
 * Received Invoices module
 * 
 * Module for interacting with received invoices in the Minimax API
 */

import { BaseResource } from './base-resource';

/**
 * Invoice resource
 */
export interface Invoice {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
  
  /**
   * Invoice number
   */
  Number: string;
  
  /**
   * Invoice date
   */
  Date: string;
  
  /**
   * Invoice due date
   */
  DueDate: string;
  
  /**
   * Customer ID
   */
  CustomerId: string;
  
  /**
   * Total amount
   */
  TotalAmount: number;
  
  /**
   * Currency code
   */
  CurrencyCode: string;
  
  /**
   * Invoice status
   */
  Status: 'Draft' | 'Issued' | 'Paid' | 'Cancelled';
  
  /**
   * Invoice items
   */
  Items?: InvoiceItem[];
}

/**
 * Invoice item
 */
export interface InvoiceItem {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
  
  /**
   * Product ID
   */
  ProductId?: string;
  
  /**
   * Description
   */
  Description: string;
  
  /**
   * Quantity
   */
  Quantity: number;
  
  /**
   * Unit price
   */
  UnitPrice: number;
  
  /**
   * Discount percentage
   */
  DiscountPercentage?: number;
  
  /**
   * Tax rate
   */
  TaxRate?: number;
  
  /**
   * Total amount
   */
  TotalAmount: number;
}

/**
 * Invoice creation parameters
 */
export interface CreateInvoiceParams {
  /**
   * Customer ID
   */
  CustomerId: string;
  
  /**
   * Invoice date (YYYY-MM-DD)
   */
  Date: string;
  
  /**
   * Invoice due date (YYYY-MM-DD)
   */
  DueDate: string;
  
  /**
   * Currency code
   */
  CurrencyCode: string;
  
  /**
   * Invoice items
   */
  Items: Array<{
    /**
     * Product ID
     */
    ProductId?: string;
    
    /**
     * Description
     */
    Description: string;
    
    /**
     * Quantity
     */
    Quantity: number;
    
    /**
     * Unit price
     */
    UnitPrice: number;
    
    /**
     * Discount percentage
     */
    DiscountPercentage?: number;
    
    /**
     * Tax rate
     */
    TaxRate?: number;
  }>;
}

/**
 * Invoice update parameters
 */
export interface UpdateInvoiceParams {
  /**
   * Customer ID
   */
  CustomerId?: string;
  
  /**
   * Invoice date (YYYY-MM-DD)
   */
  Date?: string;
  
  /**
   * Invoice due date (YYYY-MM-DD)
   */
  DueDate?: string;
  
  /**
   * Currency code
   */
  CurrencyCode?: string;
  
  /**
   * Invoice items
   */
  Items?: Array<{
    /**
     * Item ID (required for existing items)
     */
    Id?: string;
    
    /**
     * Product ID
     */
    ProductId?: string;
    
    /**
     * Description
     */
    Description?: string;
    
    /**
     * Quantity
     */
    Quantity?: number;
    
    /**
     * Unit price
     */
    UnitPrice?: number;
    
    /**
     * Discount percentage
     */
    DiscountPercentage?: number;
    
    /**
     * Tax rate
     */
    TaxRate?: number;
  }>;
}

/**
 * Invoice list response
 */
interface InvoiceListResponse {
  /**
   * Array of invoices
   */
  value: Invoice[];
  
  /**
   * Total count of invoices (if requested)
   */
  '@odata.count'?: number;
}

/**
 * Invoice filter options
 */
export interface InvoiceFilterOptions {
  /**
   * Filter by customer ID
   */
  customerId?: string;
  
  /**
   * Filter by status
   */
  status?: 'Draft' | 'Issued' | 'Paid' | 'Cancelled';
  
  /**
   * Filter by date from (inclusive)
   */
  dateFrom?: string;
  
  /**
   * Filter by date to (inclusive)
   */
  dateTo?: string;
  
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
 * Received Invoices module
 */
export class ReceivedInvoicesModule extends BaseResource {
  /**
   * Base endpoint for received invoices
   * The actual endpoint will be constructed as api/orgs/{organizationId}/receivedInvoices
   */
  protected readonly endpoint = 'receivedinvoices';
  
  /**
   * Get all received invoices
   * 
   * @param options Filter options
   * @returns Promise resolving to an array of invoices
   */
  public async getAll(options: InvoiceFilterOptions = {}): Promise<Invoice[]> {
    const params: Record<string, any> = {};
    
    // Build filter string
    const filters: string[] = [];
    
    if (options.customerId) {
      filters.push(`CustomerId eq '${options.customerId}'`);
    }
    
    if (options.status) {
      filters.push(`Status eq '${options.status}'`);
    }
    
    if (options.dateFrom) {
      filters.push(`Date ge ${options.dateFrom}`);
    }
    
    if (options.dateTo) {
      filters.push(`Date le ${options.dateTo}`);
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
    
    const response = await this.client.get<InvoiceListResponse>(this.getEndpoint(), { params });
    return response.value;
  }
  
  /**
   * Get an invoice by ID
   * 
   * @param id Invoice ID
   * @returns Promise resolving to the invoice
   */
  public async get(id: string): Promise<Invoice> {
    return this.client.get<Invoice>(this.getEndpoint(id));
  }
  
  /**
   * Create a new invoice
   * 
   * @param params Invoice creation parameters
   * @returns Promise resolving to the created invoice
   */
  public async create(params: CreateInvoiceParams): Promise<Invoice> {
    return this.client.post<Invoice>(this.endpoint, params);
  }
  
  /**
   * Update an invoice
   * 
   * @param id Invoice ID
   * @param params Invoice update parameters
   * @returns Promise resolving to the updated invoice
   */
  public async update(id: string, params: UpdateInvoiceParams): Promise<Invoice> {
    return this.client.put<Invoice>(this.getEndpoint(id), params);
  }
  
  /**
   * Delete an invoice
   * 
   * @param id Invoice ID
   * @returns Promise resolving when the invoice is deleted
   */
  public async delete(id: string): Promise<void> {
    await this.client.delete(this.getEndpoint(id));
  }
  
  /**
   * Issue an invoice
   * 
   * @param id Invoice ID
   * @returns Promise resolving to the issued invoice
   */
  public async issue(id: string): Promise<Invoice> {
    return this.client.post<Invoice>(this.getEndpoint(`${id}/issue`));
  }
  
  /**
   * Mark an invoice as paid
   * 
   * @param id Invoice ID
   * @param paymentDate Payment date (YYYY-MM-DD)
   * @returns Promise resolving to the paid invoice
   */
  public async markAsPaid(id: string, paymentDate: string): Promise<Invoice> {
    return this.client.post<Invoice>(this.getEndpoint(`${id}/pay`), { paymentDate });
  }
  
  /**
   * Cancel an invoice
   * 
   * @param id Invoice ID
   * @returns Promise resolving to the cancelled invoice
   */
  public async cancel(id: string): Promise<Invoice> {
    return this.client.post<Invoice>(this.getEndpoint(`${id}/cancel`));
  }
}
