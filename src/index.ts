/**
 * Minimax API Client
 * A TypeScript client for the Minimax accounting API
 */

// Export version
export const VERSION = '0.1.0';

// Export client module
export { MinimaxClient } from './client';
export type { Customer, CreateCustomerParams, UpdateCustomerParams, CustomerFilterOptions } from './client';
export type { ReceivedInvoice, InvoiceItem, InvoiceCreateData, InvoiceUpdateData, InvoiceFilterOptions } from './client';

// Export resource modules
export { ReceivedInvoicesModule, CustomersModule, EmployeesModule } from './client/resources';
export type { Employee, EmployeeFilterOptions } from './client/resources';
export type { ListResponse } from './client/resources/base-resource';

// Note: The old implementation (auth, http, api, types) has been removed
// in favor of the simplified client implementation.
