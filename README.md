# Minimax Client

A TypeScript client library for the Minimax accounting API (https://moj.minimax.rs/RS/API/).

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

## Usage

```typescript
import { MinimaxClient } from 'minimax-client';

// Initialize the client
const client = new MinimaxClient({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Authenticate
await client.authenticate({
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

## License

MIT
