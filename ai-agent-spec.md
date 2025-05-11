# Minimax Client - AI Agent Development Specification

## Project Context

The minimax-client is a TypeScript library for interacting with the Minimax accounting service API (https://moj.minimax.rs/RS/API/). This document provides comprehensive instructions for AI agents continuing the development of this project.

## Technology Stack

- **Language**: TypeScript
- **Target Environment**: Node.js backend (not browser)
- **HTTP Client**: Axios
- **Testing Framework**: Jest
- **Package Manager**: npm or yarn
- **CI/CD**: GitHub Actions
- **Documentation**: TSDoc + Markdown

## Development Guidelines

### TypeScript Standards

- Maintain strict type safety (use `strict: true` in tsconfig)
- Use interfaces over types when representing objects
- Create comprehensive type definitions for all API entities
- Export all public-facing types for consumers
- Use generics to create reusable components

### Code Structure

- Follow modular design principles
- Create focused modules for distinct API categories
- Implement abstract base classes where appropriate
- Use dependency injection for testability
- Create builder patterns for complex object construction

### Error Handling

- Create custom error classes extending from a base error
- Preserve original error messages from the API
- Add contextual information to errors
- Use descriptive error names for filtering
- Implement consistent error handling patterns throughout

### Testing Strategy

- Unit test all components in isolation 
- Use mocks for API responses
- Test error handling paths
- Create integration tests for end-to-end flows
- Maintain 80%+ code coverage

### Documentation Approach

- Document all public methods and classes
- Include examples in documentation
- Use JSDoc tags consistently
- Create usage examples for common scenarios
- Document error handling approaches

## Development Process

1. Start with core infrastructure:
   - Set up TypeScript configuration
   - Implement authentication module
   - Create HTTP client with interceptors

2. Create entity-specific API modules:
   - Begin with Invoices (highest priority)
   - Implement CRUD operations for each entity
   - Add specialized methods as needed

3. Test all components:
   - Write unit tests during development
   - Create integration tests for full workflows

4. Document the library:
   - Generate API documentation
   - Create usage examples
   - Document edge cases and error handling

## API Understanding

### Authentication

The Minimax API uses OAuth 2.0 with password grant type:

1. Client must register an application in Minimax portal
2. Authentication request includes:
   - client_id
   - client_secret
   - grant_type=password
   - username
   - password
   - scope=minimax.rs

3. Authentication response provides:
   - access_token
   - refresh_token
   - expires_in (seconds)

4. Tokens must be managed:
   - Store tokens securely
   - Refresh before expiration
   - Handle authentication failures

### Concurrency Control

Minimax API uses RowVersion field for concurrency control:

1. Each entity includes a RowVersion field
2. When updating, the client must include the original RowVersion
3. If another process modified the record, API returns a concurrency error
4. Client should fetch the latest version and retry the operation

### API Response Patterns

The API generally follows these patterns:

1. Collection responses:
   - May include pagination information
   - Use consistent data envelope structure

2. Single entity responses:
   - Include RowVersion for concurrency control
   - Use consistent structure

3. Error responses:
   - Provide error messages (often in Serbian)
   - May include validation details
   - HTTP status codes follow standard conventions

## Entity Relationships

Understanding the relationships between Minimax entities is crucial:

- Invoices relate to Customers, Products, Tax Rates, and Currencies
- Customers may have related Contacts and Addresses
- Products may have Categories and Tax Rate assignments
- Chart of Accounts follows a hierarchical structure
- Organizations provide multi-company support

## Implementation Priorities

1. Authentication and session management
2. Invoices API (highest priority)
3. Customers/Partners API
4. Products/Services API
5. Chart of Accounts
6. Supporting entities (tax rates, currencies, etc.)
7. Reports API

## Special Considerations

1. **Language**: The API responses and documentation are primarily in Serbian, but our client library should use English for:
   - Method names
   - Documentation
   - Custom error messages
   - Logs and debugging information

2. **Session Management**: Implement robust session handling with:
   - Automatic token refresh
   - Session timeout handling
   - Multiple organization support

3. **Error Translation**: Do not translate API error messages, but:
   - Wrap in typed errors for better handling
   - Add context where appropriate
   - Provide developer-friendly error properties

4. **Concurrency Strategy**: Create utilities to:
   - Extract RowVersion from responses
   - Add RowVersion to update requests
   - Implement retry strategies for concurrency errors

## Debugging Tips

When debugging API issues:

1. Examine raw request/response pairs
2. Check for Serbian characters encoding issues
3. Verify authentication token validity
4. Check RowVersion handling
5. Validate request payload structures

## Publishing Strategy

For NPM package publishing:

1. Use semantic versioning
2. Include TypeScript type definitions
3. Create both CommonJS and ES Module builds
4. Minimize dependencies
5. Include README with quick start guide
