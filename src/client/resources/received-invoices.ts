/**
 * Received Invoices module
 * 
 * Module for interacting with received invoices in the Minimax API
 */

import { BaseResource, ListResponse } from './base-resource';

/**
 * Resource reference interface
 */
export interface ResourceReference {
  /**
   * Resource ID
   */
  ID: number;
  
  /**
   * Resource name
   */
  Name: string;
  
  /**
   * Resource URL
   */
  ResourceUrl: string;
}

/**
 * Received invoice resource
 */
export interface ReceivedInvoice {
  /**
   * Unique identifier
   */
  ReceivedInvoiceId: number;
  
  /**
   * Year
   */
  Year: number;
  
  /**
   * Invoice number
   */
  InvoiceNumber: number;
  
  /**
   * Document numbering
   */
  DocumentNumbering: ResourceReference;
  
  /**
   * Document reference
   */
  DocumentReference: string;
  
  /**
   * Customer
   */
  Customer: ResourceReference;
  
  /**
   * Analytic
   */
  Analytic: ResourceReference;
  
  /**
   * Currency
   */
  Currency: ResourceReference;
  
  /**
   * Date issued
   */
  DateIssued: string;
  
  /**
   * Transaction date
   */
  DateTransaction: string;
  
  /**
   * Due date
   */
  DateDue: string;
  
  /**
   * Date received
   */
  DateReceived: string;
  
  /**
   * Invoice amount
   */
  InvoiceAmount: number;
  
  /**
   * Status
   */
  Status: string;
  
  /**
   * Payment status
   */
  PaymentStatus: string;
  
  /**
   * Invoice value
   */
  InvoiceValue: number;
  
  /**
   * Paid value
   */
  PaidValue: number;
  
  /**
   * Record modified date
   */
  RecordDtModified: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
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
   * Invoice ID
   */
  InvoiceId: string;
  
  /**
   * Item description
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
   * Tax rate percentage
   */
  TaxRatePercentage: number;
  
  /**
   * Total amount
   */
  TotalAmount: number;
}

/**
 * Invoice create data
 */
export interface InvoiceCreateData {
  /**
   * Invoice data for creation
   */
  [key: string]: any;
}

/**
 * Invoice update data
 */
export interface InvoiceUpdateData {
  /**
   * Row version for concurrency control
   */
  RowVersion: string;
  
  /**
   * Other invoice data for update
   */
  [key: string]: any;
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
 * Received invoices list response
 */
export type ReceivedInvoicesListResponse = ListResponse<ReceivedInvoice>;

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
   * @returns Promise resolving to an array of received invoices
   */
  public async getAll(options: InvoiceFilterOptions = {}): Promise<ReceivedInvoice[]> {
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
      
    const response = await this.client.get<ReceivedInvoicesListResponse>(this.getEndpoint(), { params });
    return response.Rows;
  }
  
  /**
   * Get a received invoice by ID
   * 
   * @param id Received invoice ID
   * @returns Promise resolving to the received invoice
   */
  public async get(id: string): Promise<ReceivedInvoice> {
    return this.client.get<ReceivedInvoice>(this.getEndpoint(id));
  }
  
  /**
   * Create a new received invoice
   * 
   * @param data Invoice data
   * @returns Promise resolving to the created received invoice
   */
  public async create(data: InvoiceCreateData): Promise<ReceivedInvoice> {
    return this.client.post<ReceivedInvoice>(this.getEndpoint(), data);
  }
  
  /**
   * Update a received invoice
   * 
   * @param id Received invoice ID
   * @param data Invoice data with RowVersion
   * @returns Promise resolving to the updated received invoice
   */
  public async update(id: string, data: InvoiceUpdateData): Promise<ReceivedInvoice> {
    return this.client.put<ReceivedInvoice>(this.getEndpoint(id), data);
  }
  
  /**
   * Delete a received invoice
   * 
   * @param id Received invoice ID
   * @param rowVersion RowVersion for concurrency control
   * @returns Promise resolving when the received invoice is deleted
   */
  public async delete(id: string, rowVersion: string): Promise<void> {
    return this.client.delete(this.getEndpoint(id), {
      params: { RowVersion: rowVersion }
    });
  }
  
  /**
   * Issue a received invoice
   * 
   * @param id Received invoice ID
   * @returns Promise resolving to the issued received invoice
   */
  public async issue(id: string): Promise<ReceivedInvoice> {
    return this.client.post<ReceivedInvoice>(this.getEndpoint(id) + '/issue');
  }
  
  /**
   * Mark a received invoice as paid
   * 
   * @param id Received invoice ID
   * @param paymentDate Payment date (YYYY-MM-DD)
   * @returns Promise resolving to the paid received invoice
   */
  public async markAsPaid(id: string, paymentDate: string): Promise<ReceivedInvoice> {
    return this.client.post<ReceivedInvoice>(this.getEndpoint(id) + '/pay', { paymentDate });
  }
  
  /**
   * Cancel a received invoice
   * 
   * @param id Received invoice ID
   * @returns Promise resolving to the cancelled received invoice
   */
  public async cancel(id: string): Promise<ReceivedInvoice> {
    return this.client.post<ReceivedInvoice>(this.getEndpoint(id) + '/cancel');
  }
}
