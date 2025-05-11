/**
 * API response type definitions for the Minimax client library
 */

import { MinimaxResource } from './index';

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
 * Response from a batch operation
 */
export interface BatchOperationResponse<T> {
  /**
   * Results of successful operations
   */
  results: T[];
  
  /**
   * Errors that occurred during the batch operation
   */
  errors?: Array<{
    /**
     * Index of the failed operation
     */
    index: number;
    
    /**
     * Error message
     */
    message: string;
    
    /**
     * Error details
     */
    details?: any;
  }>;
}

/**
 * Invoice response type
 */
export interface InvoiceResponse extends MinimaxResource {
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
  Items?: InvoiceItemResponse[];
}

/**
 * Invoice item response type
 */
export interface InvoiceItemResponse extends MinimaxResource {
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
 * Customer response type
 */
export interface CustomerResponse extends MinimaxResource {
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
 * Product response type
 */
export interface ProductResponse extends MinimaxResource {
  /**
   * Product code
   */
  Code: string;
  
  /**
   * Product name
   */
  Name: string;
  
  /**
   * Product description
   */
  Description?: string;
  
  /**
   * Unit price
   */
  UnitPrice: number;
  
  /**
   * Currency code
   */
  CurrencyCode: string;
  
  /**
   * Tax rate
   */
  TaxRate?: number;
  
  /**
   * Whether the product is active
   */
  IsActive: boolean;
}

/**
 * Tax rate response type
 */
export interface TaxRateResponse extends MinimaxResource {
  /**
   * Tax rate code
   */
  Code: string;
  
  /**
   * Tax rate name
   */
  Name: string;
  
  /**
   * Tax rate percentage
   */
  Rate: number;
  
  /**
   * Whether the tax rate is active
   */
  IsActive: boolean;
}

/**
 * Currency response type
 */
export interface CurrencyResponse extends MinimaxResource {
  /**
   * Currency code (ISO 4217)
   */
  Code: string;
  
  /**
   * Currency name
   */
  Name: string;
  
  /**
   * Currency symbol
   */
  Symbol: string;
  
  /**
   * Exchange rate to base currency
   */
  ExchangeRate?: number;
  
  /**
   * Whether this is the base currency
   */
  IsBase: boolean;
}
