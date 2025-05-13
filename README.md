# Minimax Client

[![npm version](https://img.shields.io/badge/npm-v0.1.2-blue)](https://www.npmjs.com/package/minimax-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: Development](https://img.shields.io/badge/Status-Development-orange)](https://www.npmjs.com/package/minimax-client)

A TypeScript client library for the Minimax accounting API (https://moj.minimax.rs/RS/API/).

> **⚠️ IMPORTANT**: This library is still in active development and not intended for production use. Breaking changes may occur between versions.

## Features

- TypeScript-based with full type definitions
- Node.js backend usage (not browser)
- Axios for HTTP client
- Handle authentication and sessions internally
- English for library interface, preserve original API error messages
- Handle concurrency with RowVersion

## Installation

```bash
npm install minimax-client
```

Or with yarn:

```bash
yarn add minimax-client
```

## Usage

```typescript
import { MinimaxClient } from 'minimax-client';

// Initializes the client and authenticates
const client = new MinimaxClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  username: 'your-username',
  password: 'your-password',
});

// Use the API
const invoices = await client.invoices.getAll();
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Available Scripts

- `npm run clean` - Clean the dist directory
- `npm run build` - Build the project
- `npm run build:dev` - Build the project in watch mode
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without making changes

## API Resources

The client provides access to the following Minimax API resources:

- Invoices
- Customers
- Journals
- (More resources coming soon)

## Error Handling

```typescript
try {
  const result = await client.invoices.getById('invalid-id');
} catch (error) {
  if (error.isMinimaxError) {
    // Handle Minimax API error
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
  } else {
    // Handle network or other errors
    console.error('Unexpected error:', error);
  }
}
```

## Documentation

For more detailed information about the Minimax API and how to use this client, please refer to:

- [API Reference](./docs/api-reference.md)
- [API Endpoints](./docs/api-endpoints.md)
- [NPM Publishing Guide](./docs/npm-publishing.md)

## License

MIT
