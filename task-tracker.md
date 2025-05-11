# Minimax Client Task Tracker

## Project Overview
This project aims to create a TypeScript client for the Minimax accounting API (https://moj.minimax.rs/RS/API/). The client will be published as an NPM package for use in Node.js backends.

## Project Status
- **Current Phase**: Project Configuration
- **Completion**: 17%
- **Last Task ID**: 9
- **Last Updated**: 2025-05-12

## Task Tracking Table

| ID | Phase | Task | Status | Priority | Dependencies | Notes ID |
|----|----------|------|--------|----------|--------------|----------|
| 1 | Project Structure | Create basic directory structure | ✅ | High | None | N1 |
| 2 | Project Structure | Document API reference information | ✅ | High | None | N2 |
| 3 | Project Configuration | Create tsconfig.json | ✅ | High | None | N3 |
| 4 | Project Configuration | Configure ESLint and Prettier | ✅ | Medium | None | N4 |
| 5 | Project Configuration | Set up Jest for testing | ✅ | High | #3 | N5 |
| 6 | Project Configuration | Configure TypeScript build process | ✅ | High | #3 | N6 |
| 7 | Project Configuration | Set up GitHub Actions for CI/CD | ⏳ | Low | #3, #5 | N7 |
| 8 | Project Configuration | Create NPM package configuration | ✅ | Medium | None | N8 |
| 9 | Type Definitions | Define base type interfaces | ✅ | High | #3 | N9 |
| 10 | Type Definitions | Create API response types | ⏳ | High | #9 | N10 |
| 11 | Type Definitions | Define error types | ⏳ | High | #9 | N11 |
| 12 | Type Definitions | Create type definitions for configuration | ⏳ | Medium | #9 | N12 |
| 13 | Authentication Module | Implement OAuth2 client | ⏳ | High | #9, #11 | N13 |
| 14 | Authentication Module | Add token storage mechanism | ⏳ | High | #13 | N14 |
| 15 | Authentication Module | Create token refresh handling | ⏳ | High | #13, #14 | N15 |
| 16 | Authentication Module | Implement session management | ⏳ | High | #13, #14, #15 | N16 |
| 17 | Authentication Module | Add error handling for authentication | ⏳ | High | #11, #13 | N17 |
| 18 | Authentication Module | Write unit tests for auth module | ⏳ | High | #13, #16, #17 | N18 |
| 19 | HTTP Client | Create base HTTP client | ⏳ | High | #9, #11, #13 | N19 |
| 20 | HTTP Client | Implement request/response interceptors | ⏳ | High | #19 | N20 |
| 21 | HTTP Client | Add error handling middleware | ⏳ | High | #11, #19 | N21 |
| 22 | HTTP Client | Create retry mechanism | ⏳ | Medium | #19, #20 | N22 |
| 23 | HTTP Client | Implement concurrency handling for RowVersion | ⏳ | High | #19, #20 | N23 |
| 24 | HTTP Client | Write unit tests for HTTP client | ⏳ | High | #19, #23 | N24 |
| 25 | Base API Client | Create abstract base API client class | ⏳ | High | #19, #23 | N25 |
| 26 | Base API Client | Implement pagination handling | ⏳ | Medium | #25 | N26 |
| 27 | Base API Client | Add filtering capability | ⏳ | Medium | #25 | N27 |
| 28 | Base API Client | Create sorting mechanism | ⏳ | Medium | #25 | N28 |
| 29 | Base API Client | Write unit tests for base client | ⏳ | High | #25, #28 | N29 |
| 30 | Invoices API | Define invoice types and interfaces | ⏳ | High | #9, #10 | N30 |
| 31 | Invoices API | Implement create invoice functionality | ⏳ | High | #25, #30 | N31 |
| 32 | Invoices API | Add retrieve invoice methods | ⏳ | High | #25, #30 | N32 |
| 33 | Invoices API | Implement update invoice functionality | ⏳ | High | #25, #30, #23 | N33 |
| 34 | Invoices API | Add delete invoice methods | ⏳ | High | #25, #30 | N34 |
| 35 | Invoices API | Create invoice filtering capabilities | ⏳ | Medium | #27, #30 | N35 |
| 36 | Invoices API | Implement invoice line item management | ⏳ | High | #31, #33 | N36 |
| 37 | Invoices API | Add invoice payment tracking | ⏳ | Medium | #31, #33 | N37 |
| 38 | Invoices API | Write unit tests for invoice API | ⏳ | High | #30, #37 | N38 |
| 39 | Customers API | Define customer types and interfaces | ⏳ | Medium | #9, #10 | N39 |
| 40 | Customers API | Implement create customer functionality | ⏳ | Medium | #25, #39 | N40 |
| 41 | Customers API | Add retrieve customer methods | ⏳ | Medium | #25, #39 | N41 |
| 42 | Customers API | Implement update customer functionality | ⏳ | Medium | #25, #39, #23 | N42 |
| 43 | Customers API | Add delete customer methods | ⏳ | Medium | #25, #39 | N43 |
| 44 | Customers API | Create customer filtering capabilities | ⏳ | Medium | #27, #39 | N44 |
| 45 | Customers API | Write unit tests for customer API | ⏳ | Medium | #39, #44 | N45 |
| 46 | Products API | Define product types and interfaces | ⏳ | Medium | #9, #10 | N46 |
| 47 | Products API | Implement create product functionality | ⏳ | Medium | #25, #46 | N47 |
| 48 | Products API | Add retrieve product methods | ⏳ | Medium | #25, #46 | N48 |
| 49 | Products API | Implement update product functionality | ⏳ | Medium | #25, #46, #23 | N49 |
| 50 | Products API | Add delete product methods | ⏳ | Medium | #25, #46 | N50 |
| 51 | Products API | Create product filtering capabilities | ⏳ | Medium | #27, #46 | N51 |
| 52 | Products API | Write unit tests for product API | ⏳ | Medium | #46, #51 | N52 |
| 53 | Chart of Accounts API | Define account types and interfaces | ⏳ | Low | #9, #10 | N53 |
| 54 | Chart of Accounts API | Implement account retrieval methods | ⏳ | Low | #25, #53 | N54 |
| 55 | Chart of Accounts API | Create account hierarchy handling | ⏳ | Low | #54 | N55 |
| 56 | Chart of Accounts API | Add account filtering capabilities | ⏳ | Low | #27, #53 | N56 |
| 57 | Chart of Accounts API | Write unit tests for accounts API | ⏳ | Low | #53, #56 | N57 |
| 58 | Organizations API | Define organization types | ⏳ | Medium | #9, #10 | N58 |
| 59 | Organizations API | Implement organization listing | ⏳ | Medium | #25, #58 | N59 |
| 60 | Organizations API | Add organization selection functionality | ⏳ | Medium | #59 | N60 |
| 61 | Organizations API | Write unit tests for organizations API | ⏳ | Medium | #58, #60 | N61 |
| 62 | Users/Permissions API | Define user and permission types | ⏳ | Low | #9, #10 | N62 |
| 63 | Users/Permissions API | Implement user management methods | ⏳ | Low | #25, #62 | N63 |
| 64 | Users/Permissions API | Create permission handling | ⏳ | Low | #63 | N64 |
| 65 | Users/Permissions API | Write unit tests for users API | ⏳ | Low | #62, #64 | N65 |
| 66 | Tax Rates API | Define tax rate types | ⏳ | Medium | #9, #10 | N66 |
| 67 | Tax Rates API | Implement tax rate retrieval | ⏳ | Medium | #25, #66 | N67 |
| 68 | Tax Rates API | Add tax calculation helpers | ⏳ | Medium | #67 | N68 |
| 69 | Tax Rates API | Write unit tests for tax API | ⏳ | Medium | #66, #68 | N69 |
| 70 | Currencies API | Define currency types | ⏳ | Medium | #9, #10 | N70 |
| 71 | Currencies API | Implement currency retrieval | ⏳ | Medium | #25, #70 | N71 |
| 72 | Currencies API | Add exchange rate functionality | ⏳ | Medium | #71 | N72 |
| 73 | Currencies API | Write unit tests for currency API | ⏳ | Medium | #70, #72 | N73 |
| 74 | Reports API | Define report types and parameters | ⏳ | Low | #9, #10 | N74 |
| 75 | Reports API | Implement report generation methods | ⏳ | Low | #25, #74 | N75 |
| 76 | Reports API | Create report formatting helpers | ⏳ | Low | #75 | N76 |
| 77 | Reports API | Write unit tests for reports API | ⏳ | Low | #74, #76 | N77 |
| 78 | API Documentation | Document all client methods | ⏳ | Medium | All API modules | N78 |
| 79 | API Documentation | Create usage examples | ⏳ | Medium | #78 | N79 |
| 80 | API Documentation | Add TypeScript examples | ⏳ | Medium | #78 | N80 |
| 81 | API Documentation | Document error handling | ⏳ | Medium | #78 | N81 |
| 82 | Example Applications | Create basic usage example | ⏳ | Low | #30, #38 | N82 |
| 83 | Example Applications | Build invoice management example | ⏳ | Low | #38 | N83 |
| 84 | Example Applications | Create customer management example | ⏳ | Low | #45 | N84 |
| 85 | Example Applications | Build reporting example | ⏳ | Low | #77 | N85 |
| 86 | NPM Package | Configure package for publishing | ⏳ | Medium | #6, #8 | N86 |
| 87 | NPM Package | Set up versioning strategy | ⏳ | Low | #86 | N87 |
| 88 | NPM Package | Create release process | ⏳ | Low | #7, #86 | N88 |
| 89 | NPM Package | Configure access control | ⏳ | Low | #86 | N89 |
| 90 | Project Finalization | Perform security audit | ⏳ | Medium | All modules | N90 |
| 91 | Project Finalization | Optimize bundle size | ⏳ | Low | #6, #86 | N91 |
| 92 | Project Finalization | Create changelog | ⏳ | Low | #87 | N92 |
| 93 | Project Finalization | Complete documentation | ⏳ | Medium | #78, #81 | N93 |
| 94 | Project Finalization | Final testing | ⏳ | High | All modules | N94 |



## Task Notes

### N1 (Task #1)
Created basic directory structure including src/, docs/, and subdirectories.

### N2 (Task #2)
Created API reference documentation based on Minimax API documentation.

### N3 (Task #3)
Created tsconfig.json with the following configuration:
- Target: ES2020
- Module system: CommonJS
- Strict type checking enabled
- Declaration files generation enabled
- Source maps enabled
- Output directory: ./dist
- Root directory: ./src
- Includes various strict checks for better code quality
- Configured for Node.js environment

### N4 (Task #4)
Configured ESLint and Prettier for code quality and consistent formatting:
- Created .eslintrc.js with TypeScript-specific rules
- Added .prettierrc with formatting preferences
- Created .eslintignore and .prettierignore files
- Added ESLint-Prettier integration with .eslintrc.prettier.js
- Updated package.json with new scripts and dependencies:
  - lint: Basic linting command
  - lint:fix: Automatically fix linting issues
  - format: Format code with Prettier
  - format:check: Check formatting without making changes
- Added eslint-config-prettier and eslint-plugin-prettier to prevent conflicts
- Configured TypeScript-specific rules for better code quality
- Set up naming conventions for interfaces, type aliases, and enums

### N5 (Task #5)
Set up Jest for testing with the following configuration:
- Created jest.config.js with TypeScript support via ts-jest
- Configured test environment for Node.js
- Set up code coverage reporting with thresholds
- Created jest.setup.js for global test configuration
- Added test utilities in src/__tests__/test-utils.ts
- Created sample test for string utilities to verify setup
- All tests are passing with proper TypeScript integration

### N6 (Task #6)
Configured TypeScript build process with the following improvements:
- Implemented Rollup for bundling with multiple output formats (CommonJS, ESM, UMD)
- Created rollup.config.js with proper TypeScript integration
- Added source maps for better debugging
- Configured separate tsconfig.test.json for test files
- Updated ESLint configuration to properly handle test files
- Added build scripts to package.json for different build scenarios
- Created a custom build.js script for enhanced build process with detailed output
- Added .npmignore file to control which files get published to npm
- Created README.md with installation and usage instructions
- Fixed linting issues in test utilities
- Implemented explicit exclusion of test files from the build output
- Added verification step to ensure no test files are included in the distribution
- Successfully tested the build process with all formats working correctly

### N8 (Task #8)
Configured NPM package for publishing:
- Updated package.json with proper metadata and configuration
- Set package name to "minimax-client"
- Added Miljan Tekic as the author
- Configured peer dependencies for axios
- Added sideEffects: false for better tree-shaking
- Created .npmrc with publishing configuration
- Verified and updated .npmignore to exclude development files
- Updated README.md with correct installation instructions and publishing guide
- Added npm scripts for testing with coverage and prepare hook
  - The prepare script runs automatically when the package is installed as a dependency, ensuring the build is always up-to-date
  - It's also triggered before npm publish, providing an additional safety check

### N9 (Task #9)
Defined base type interfaces for the Minimax client library:
- Created core type definitions in `src/types/index.ts`:
  - `MinimaxClientConfig` for client configuration options
  - `MinimaxCredentials` for authentication credentials
  - `MinimaxToken` for OAuth2 token response
  - `MinimaxResource` as the base interface for all API resources
  - Query parameter interfaces for pagination, sorting, filtering, and expansion
  - `ListResponse` for handling paginated list responses
  - Common resource interfaces like `Organization`, `User`, `Address`, and `Contact`
- Implemented error types in `src/types/errors.ts`:
  - `MinimaxError` as the base error class
  - Specialized error classes for authentication, validation, not found, concurrency, rate limit, server, and network errors
  - Error factory function to create appropriate error instances from API responses
- Added HTTP client types in `src/types/http.ts`:
  - Request and response interceptor types
  - HTTP request options interface
  - Authentication state and token storage interfaces
  - Memory-based token storage implementation
- Created API module base types in `src/types/api.ts`:
  - Base interfaces for API modules with CRUD operations
  - Read-only API module interface
  - Options interfaces for various API operations
  - Custom action and batch operation interfaces
- Set up barrel exports in `index.ts` for easy importing

<!-- Continue with notes for remaining tasks as they are worked on -->

## Instructions for Updating This File

1. After completing a task, update its status from ⏳ to ✅
2. Add detailed notes in the Task Notes section using the Notes ID (e.g., N3)
3. Update the Project Status section with new completion percentage and date
4. If starting a new phase, update the Current Phase in Project Status
5. Commit the updated task-tracker.md to the repository

The Task Notes should include:
- What was implemented/completed
- Any design decisions made
- Challenges encountered and solutions
- Links to relevant files or PRs
- Dependencies affected
- Future considerations
