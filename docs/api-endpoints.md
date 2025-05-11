# Minimax API Endpoints Reference

This document outlines the key endpoints available in the Minimax API. It serves as a guide for implementing the client library modules. The information is based on the Swagger documentation and available API references.

## Base URLs

- API Base: `https://moj.minimax.rs/RS/API/`
- Authentication: `https://moj.minimax.rs/RS/AUT/oauth20/token`

## Authentication Endpoints

- **POST** `/oauth20/token`: OAuth 2.0 token endpoint
  - Used for initial authentication and token refresh

## Organizations and Users

- **GET** `/api/currentuser/orgs`: Get organizations accessible to the current user
- **GET** `/api/currentuser`: Get current user information
- **PUT** `/api/currentuser/defaultorg/{orgId}`: Set default organization

## Invoices (Priority)

### Sales Invoices

- **GET** `/api/orgs/{orgId}/invoices`: List sales invoices
- **GET** `/api/orgs/{orgId}/invoices/{id}`: Get a specific sales invoice
- **POST** `/api/orgs/{orgId}/invoices`: Create a new sales invoice
- **PUT** `/api/orgs/{orgId}/invoices/{id}`: Update a sales invoice
- **DELETE** `/api/orgs/{orgId}/invoices/{id}`: Delete a sales invoice
- **PUT** `/api/orgs/{orgId}/invoices/{id}/issue`: Issue an invoice
- **PUT** `/api/orgs/{orgId}/invoices/{id}/cancel`: Cancel an invoice
- **PUT** `/api/orgs/{orgId}/invoices/{id}/pay`: Mark invoice as paid

### Purchase Invoices

- **GET** `/api/orgs/{orgId}/purchaseinvoices`: List purchase invoices
- **GET** `/api/orgs/{orgId}/purchaseinvoices/{id}`: Get a specific purchase invoice
- **POST** `/api/orgs/{orgId}/purchaseinvoices`: Create a new purchase invoice
- **PUT** `/api/orgs/{orgId}/purchaseinvoices/{id}`: Update a purchase invoice
- **DELETE** `/api/orgs/{orgId}/purchaseinvoices/{id}`: Delete a purchase invoice
- **PUT** `/api/orgs/{orgId}/purchaseinvoices/{id}/book`: Book a purchase invoice
- **PUT** `/api/orgs/{orgId}/purchaseinvoices/{id}/pay`: Mark purchase invoice as paid

### Credit Notes

- **GET** `/api/orgs/{orgId}/creditnotes`: List credit notes
- **GET** `/api/orgs/{orgId}/creditnotes/{id}`: Get a specific credit note
- **POST** `/api/orgs/{orgId}/creditnotes`: Create a new credit note
- **PUT** `/api/orgs/{orgId}/creditnotes/{id}`: Update a credit note
- **DELETE** `/api/orgs/{orgId}/creditnotes/{id}`: Delete a credit note

## Customers/Partners

- **GET** `/api/orgs/{orgId}/partners`: List all partners/customers
- **GET** `/api/orgs/{orgId}/partners/{id}`: Get a specific partner/customer
- **POST** `/api/orgs/{orgId}/partners`: Create a new partner/customer
- **PUT** `/api/orgs/{orgId}/partners/{id}`: Update a partner/customer
- **DELETE** `/api/orgs/{orgId}/partners/{id}`: Delete a partner/customer
- **GET** `/api/orgs/{orgId}/partners/{id}/contacts`: Get partner contacts
- **POST** `/api/orgs/{orgId}/partners/{id}/contacts`: Add a contact to partner
- **PUT** `/api/orgs/{orgId}/partners/{id}/contacts/{contactId}`: Update partner contact
- **DELETE** `/api/orgs/{orgId}/partners/{id}/contacts/{contactId}`: Delete partner contact

## Products/Services

- **GET** `/api/orgs/{orgId}/products`: List all products/services
- **GET** `/api/orgs/{orgId}/products/{id}`: Get a specific product/service
- **POST** `/api/orgs/{orgId}/products`: Create a new product/service
- **PUT** `/api/orgs/{orgId}/products/{id}`: Update a product/service
- **DELETE** `/api/orgs/{orgId}/products/{id}`: Delete a product/service
- **GET** `/api/orgs/{orgId}/productcategories`: Get product categories
- **POST** `/api/orgs/{orgId}/productcategories`: Create a product category

## Chart of Accounts

- **GET** `/api/orgs/{orgId}/coa`: Get chart of accounts
- **GET** `/api/orgs/{orgId}/coa/{accountId}`: Get a specific account
- **GET** `/api/orgs/{orgId}/transactions`: Get transactions
- **GET** `/api/orgs/{orgId}/transactions/{id}`: Get a specific transaction

## Tax Rates

- **GET** `/api/orgs/{orgId}/taxrates`: Get available tax rates
- **GET** `/api/orgs/{orgId}/taxrates/{id}`: Get a specific tax rate

## Currencies

- **GET** `/api/orgs/{orgId}/currencies`: Get available currencies
- **GET** `/api/orgs/{orgId}/currencies/{id}`: Get a specific currency
- **GET** `/api/orgs/{orgId}/exchangerates`: Get exchange rates
- **POST** `/api/orgs/{orgId}/exchangerates`: Create an exchange rate

## Reports

- **POST** `/api/orgs/{orgId}/reports/balancesheet`: Generate balance sheet report
- **POST** `/api/orgs/{orgId}/reports/incomestatement`: Generate income statement report
- **POST** `/api/orgs/{orgId}/reports/agedreceivables`: Generate aged receivables report
- **POST** `/api/orgs/{orgId}/reports/agedpayables`: Generate aged payables report
- **GET** `/api/orgs/{orgId}/reports/{id}`: Get a generated report

## Common Query Parameters

Many endpoints support the following query parameters:

- `$filter`: OData-style filtering
- `$orderby`: Sorting options
- `$top`: Maximum number of records to return
- `$skip`: Number of records to skip (for pagination)
- `$expand`: Related entities to include

## Common Response Structures

Most entity responses include:

- `Id`: Unique identifier
- `Name` or `Title`: Entity name
- `RowVersion`: Concurrency control token
- Creation and modification timestamps
- Entity-specific properties

## Relationship Information

- Invoices reference Partners (customers) via `PartnerId`
- Invoice lines reference Products via `ProductId`
- Products may reference Categories via `CategoryId`
- Transactions reference Chart of Accounts via `AccountId`

## Notes on Implementation

1. All endpoints require authentication
2. Most endpoints are organization-specific
3. Update operations require RowVersion for concurrency control
4. Many endpoints support filtering and pagination
5. Complex operations (issue invoice, book transaction) have dedicated endpoints

This document is a guideline. The actual implementation should be based on exploring the API through the Swagger documentation and testing endpoints.
