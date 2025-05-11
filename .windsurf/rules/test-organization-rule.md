---
trigger: model_decision
description: When writing any tests
---

# Test Organization Rule

## Overview
This document defines the standard test organization pattern for the Minimax client library. Following these guidelines ensures consistency across the codebase and makes tests easier to locate and maintain.

## Test Directory Structure

### Location
All tests should be placed in the `src/__tests__` directory, mirroring the structure of the source code.

### Naming Conventions
- Test files should be named with the `.test.ts` suffix
- Test directories should match the source code directory names
- Test files should match the source file names they are testing

### Example Structure
```
src/
├── __tests__/           # Root test directory
│   ├── auth/            # Tests for auth module
│   │   └── oauth2.test.ts
│   ├── api/             # Tests for API modules
│   │   ├── invoices.test.ts
│   │   └── customers.test.ts
│   ├── utils/           # Tests for utility functions
│   │   └── string-utils.test.ts
│   └── test-utils.ts    # Common test utilities
├── auth/                # Auth module source
│   ├── index.ts
│   └── oauth2.ts
├── api/                 # API modules source
│   ├── index.ts
│   ├── invoices.ts
│   └── customers.ts
└── utils/               # Utility functions
    └── string-utils.ts
```

## Test File Organization

### Structure
Each test file should:
1. Import the module being tested and any dependencies
2. Set up any mocks or test fixtures
3. Organize tests using `describe` blocks that mirror the class/module structure
4. Use nested `describe` blocks for methods/functions
5. Use clear `it` statements that describe the expected behavior

### Example Test File
```typescript
/**
 * Tests for [Module Name]
 */

import { ModuleName } from '../../path/to/module';
// Import dependencies and test utilities

describe('ModuleName', () => {
  // Setup code
  
  describe('methodName', () => {
    it('should do something when given valid input', () => {
      // Test code
    });
    
    it('should handle error cases appropriately', () => {
      // Test code
    });
  });
  
  // More tests for other methods
});
```

## Best Practices
1. Use mocks for external dependencies (axios, fs, etc.)
2. Keep tests isolated and independent
3. Clean up after tests using `beforeEach` and `afterEach`
4. Use descriptive test names that explain the expected behavior
5. Follow the AAA pattern: Arrange, Act, Assert
6. Aim for high test coverage, especially for critical paths

## Implementation
All new tests should follow this structure. Existing tests should be migrated to this structure as they are modified or updated.
