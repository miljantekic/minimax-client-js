/**
 * Journals module
 * 
 * Module for interacting with journals and journal entries in the Minimax API
 */

import { BaseResource, ListResponse } from './base-resource';

/**
 * Journal search result
 */
export interface JournalSearch {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Journal name
   */
  Name: string;
  
  /**
   * Journal code
   */
  Code: string;
  
  /**
   * Journal type ID
   */
  JournalTypeId: string;
  
  /**
   * Journal type name
   */
  JournalTypeName: string;
  
  /**
   * Whether the journal is active
   */
  IsActive: boolean;
}

/**
 * Journal entries search result
 */
export interface JournalEntriesSearch {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Journal ID
   */
  JournalId: string;
  
  /**
   * Journal name
   */
  JournalName: string;
  
  /**
   * Document number
   */
  DocumentNumber: string;
  
  /**
   * Document date
   */
  DocumentDate: string;
  
  /**
   * Posting date
   */
  PostingDate: string;
  
  /**
   * Description
   */
  Description?: string;
  
  /**
   * Reference
   */
  Reference?: string;
  
  /**
   * Total debit amount
   */
  TotalDebitAmount: number;
  
  /**
   * Total credit amount
   */
  TotalCreditAmount: number;
}

/**
 * Journal resource
 */
export interface Journal {
  /**
   * Unique identifier
   */
  Id: string;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
  
  /**
   * Journal name
   */
  Name: string;
  
  /**
   * Journal code
   */
  Code: string;
  
  /**
   * Journal type ID
   */
  JournalTypeId: string;
  
  /**
   * Whether the journal is active
   */
  IsActive: boolean;
  
  /**
   * VAT entries
   */
  VATEntries?: VATEntry[];
}

/**
 * VAT Entry
 */
export interface VATEntry {
  /**
   * Unique identifier
   */
  Id?: string;
  
  /**
   * Concurrency control token
   */
  RowVersion?: string;
  
  /**
   * VAT code
   */
  VATCode: string;
  
  /**
   * VAT rate
   */
  VATRate: number;
  
  /**
   * VAT base amount
   */
  VATBase: number;
  
  /**
   * VAT amount
   */
  VATAmount: number;
}

/**
 * Journal creation parameters
 */
export interface CreateJournalParams {
  /**
   * Journal name
   */
  Name: string;
  
  /**
   * Journal code
   */
  Code: string;
  
  /**
   * Journal type ID
   */
  JournalTypeId: string;
  
  /**
   * Whether the journal is active
   */
  IsActive?: boolean;
}

/**
 * Journal update parameters
 */
export interface UpdateJournalParams {
  /**
   * Journal name
   */
  Name?: string;
  
  /**
   * Journal code
   */
  Code?: string;
  
  /**
   * Journal type ID
   */
  JournalTypeId?: string;
  
  /**
   * Whether the journal is active
   */
  IsActive?: boolean;
  
  /**
   * Concurrency control token
   */
  RowVersion: string;
}

/**
 * Journal filter options
 */
export interface JournalFilterOptions {
  /**
   * Date to
   */
  dateTo?: string;
  
  /**
   * Date from
   */
  dateFrom?: string;
  
  /**
   * Journal ID
   */
  journalId?: string;
  
  /**
   * Journal type
   */
  journalType?: string;
  
  /**
   * Journal description
   */
  description?: string;
  
  /**
   * Journal status (O - Draft, P - Confirmed, A - Automatic)
   */
  status?: 'O' | 'P' | 'A';
  
  /**
   * Current page index (starting with 1 for first page)
   */
  currentPage?: number;
  
  /**
   * Page size (number of records per page)
   */
  pageSize?: number;
  
  /**
   * Field name for sorting/ordering results
   */
  sortField?: string;
  
  /**
   * Sort order (A - ascending, D - descending)
   */
  order?: 'A' | 'D';
}

/**
 * Journal entry filter options
 */
export interface JournalEntryFilterOptions {
  /**
   * Journal type
   */
  journalType?: string;
  
  /**
   * Journal description
   */
  description?: string;
  
  /**
   * Analytic ID
   */
  analyticId?: string;
  
  /**
   * Customer ID
   */
  customerId?: string;
  
  /**
   * Employee ID
   */
  employeeId?: string;
  
  /**
   * Journal status
   */
  status?: string;
  
  /**
   * Currency
   */
  currency?: string;
  
  /**
   * Date to
   */
  dateTo?: string;
  
  /**
   * Date from
   */
  dateFrom?: string;
  
  /**
   * Account
   */
  account?: string;
  
  /**
   * Current page index (starting with 1 for first page)
   */
  currentPage?: number;
  
  /**
   * Page size (number of records per page)
   */
  pageSize?: number;
  
  /**
   * Field name for sorting/ordering results
   */
  sortField?: string;
  
  /**
   * Sort order (A - ascending, D - descending)
   */
  order?: 'A' | 'D';
}

/**
 * Journals module
 */
export class JournalsModule extends BaseResource {
  /**
   * Base endpoint for journals
   */
  protected readonly endpoint = 'journals';
  
  /**
   * Get all journals
   * 
   * @param options Filter options
   * @returns Promise resolving to an array of journal search results
   */
  public async getAll(options: JournalFilterOptions = {}): Promise<JournalSearch[]> {
    const params: Record<string, any> = {};
    
    // Add filter parameters directly to the query
    if (options.dateTo) {
      params.DateTo = options.dateTo;
    }
    
    if (options.dateFrom) {
      params.DateFrom = options.dateFrom;
    }
    
    if (options.journalId) {
      params.JournalId = options.journalId;
    }
    
    if (options.journalType) {
      params.JournalType = options.journalType;
    }
    
    if (options.description) {
      params.Description = options.description;
    }
    
    if (options.status) {
      params.Status = options.status;
    }
    
    // Add pagination
    if (options.currentPage) {
      params.CurrentPage = options.currentPage;
    }
    
    if (options.pageSize) {
      params.PageSize = options.pageSize;
    }
    
    // Add sorting
    if (options.sortField) {
      params.SortField = options.sortField;
    }
    
    if (options.order) {
      params.Order = options.order;
    }
    
    const response = await this.client.get<ListResponse<JournalSearch>>(this.getEndpoint(), { params });
    return response.Rows;
  }
  
  /**
   * Get a journal by ID
   * 
   * @param id Journal ID
   * @returns Promise resolving to the journal
   */
  public async get(id: string): Promise<Journal> {
    return this.client.get<Journal>(this.getEndpoint(id));
  }
  
  /**
   * Create a new journal
   * 
   * @param params Journal creation parameters
   * @returns Promise resolving to the created journal
   */
  public async create(params: CreateJournalParams): Promise<Journal> {
    return this.client.post<Journal>(this.endpoint, params);
  }
  
  /**
   * Update a journal
   * 
   * @param id Journal ID
   * @param params Journal update parameters
   * @returns Promise resolving to the updated journal
   */
  public async update(id: string, params: UpdateJournalParams): Promise<Journal> {
    return this.client.put<Journal>(this.getEndpoint(id), params);
  }
  
  /**
   * Delete a journal
   * 
   * @param id Journal ID
   * @returns Promise resolving when the journal is deleted
   */
  public async delete(id: string): Promise<void> {
    await this.client.delete(this.getEndpoint(id));
  }
  
  /**
   * Get a VAT entry by ID
   * 
   * @param journalId Journal ID
   * @param vatId VAT entry ID
   * @returns Promise resolving to the VAT entry
   */
  public async getVATEntry(journalId: string, vatId: string): Promise<VATEntry> {
    return this.client.get<VATEntry>(this.getEndpoint(`${journalId}/vat/${vatId}`));
  }
  
  /**
   * Create a new VAT entry
   * 
   * @param journalId Journal ID
   * @param vatEntry VAT entry
   * @returns Promise resolving when the VAT entry is created
   */
  public async createVATEntry(journalId: string, vatEntry: VATEntry): Promise<void> {
    await this.client.post(this.getEndpoint(`${journalId}/vat`), vatEntry);
  }
  
  /**
   * Update a VAT entry
   * 
   * @param journalId Journal ID
   * @param vatId VAT entry ID
   * @param vatEntry VAT entry
   * @returns Promise resolving when the VAT entry is updated
   */
  public async updateVATEntry(journalId: string, vatId: string, vatEntry: VATEntry): Promise<void> {
    await this.client.put(this.getEndpoint(`${journalId}/vat/${vatId}`), vatEntry);
  }
  
  /**
   * Delete a VAT entry
   * 
   * @param journalId Journal ID
   * @param vatId VAT entry ID
   * @returns Promise resolving when the VAT entry is deleted
   */
  public async deleteVATEntry(journalId: string, vatId: string): Promise<void> {
    await this.client.delete(this.getEndpoint(`${journalId}/vat/${vatId}`));
  }
  
  /**
   * Get all journal entries
   * 
   * @param options Filter options
   * @returns Promise resolving to an array of journal entries search results
   */
  public async getAllJournalEntries(options: JournalEntryFilterOptions = {}): Promise<JournalEntriesSearch[]> {
    const params: Record<string, any> = {};
    
    // Add filter parameters directly to the query
    if (options.journalType) {
      params.JournalType = options.journalType;
    }
    
    if (options.description) {
      params.Description = options.description;
    }
    
    if (options.analyticId) {
      params.AnalyticID = options.analyticId;
    }
    
    if (options.customerId) {
      params.CustomerID = options.customerId;
    }
    
    if (options.employeeId) {
      params.EmployeeId = options.employeeId;
    }
    
    if (options.status) {
      params.Status = options.status;
    }
    
    if (options.currency) {
      params.Currency = options.currency;
    }
    
    if (options.dateTo) {
      params.DateTo = options.dateTo;
    }
    
    if (options.dateFrom) {
      params.DateFrom = options.dateFrom;
    }
    
    if (options.account) {
      params.Account = options.account;
    }
    
    // Add pagination
    if (options.currentPage) {
      params.CurrentPage = options.currentPage;
    }
    
    if (options.pageSize) {
      params.PageSize = options.pageSize;
    }
    
    // Add sorting
    if (options.sortField) {
      params.SortField = options.sortField;
    }
    
    if (options.order) {
      params.Order = options.order;
    }
    
    const response = await this.client.get<ListResponse<JournalEntriesSearch>>(this.getEndpoint('journal-entries'), { params });
    return response.Rows;
  }
}
