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

## Publishing

To publish a new version of this package to npm:

Before publishing, ensure all tests pass and the package builds correctly:

```bash
npm run lint
npm test
npm run build
```

### Dry Run

To verify what will be published without actually publishing:

```bash
npm run publish:dry
```

This will show you exactly what files will be included in the published package.

### Versioning

We follow semantic versioning. Use one of these commands to update the version:

```bash
# For bug fixes and small changes
npm run version:patch   # 0.1.0 -> 0.1.1

# For new features that don't break existing functionality
npm run version:minor   # 0.1.1 -> 0.2.0

# For breaking changes
npm run version:major   # 0.2.0 -> 1.0.0
```

These commands will:
1. Update the version in package.json
2. Create a git tag with the new version
3. Create a commit with the message "Release v[version]"

### Publishing to npm

To publish the package to npm:

```bash
npm publish
```

You must be logged in to npm with an account that has access to the @forty organization:

```bash
npm login
```

### Complete Release Process

A complete release process looks like this:

```bash
# 1. Ensure you're on the main branch with latest changes
git checkout main
git pull

# 2. Run tests and linting
npm run lint
npm test

# 3. Update version (choose one)
npm run version:patch  # or version:minor or version:major

# 4. Push the new version tag to GitHub
git push --follow-tags

# 5. Publish to npm
npm publish
```

## License

MIT
