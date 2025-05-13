# NPM Publishing Guide

This document provides detailed instructions for publishing the `minimax-client` package to npm.

## Prerequisites

Before publishing, ensure you have:

1. An npm account with access to the `minimax-client` package
2. Logged in to npm on your local machine (`npm login`)
3. All tests passing and linting checks completed
4. The latest code from the main branch

## Publishing Process

### 1. Prepare the Package

Ensure the package is ready for publishing:

```bash
# Pull latest changes
git checkout main
git pull

# Install dependencies
npm install

# Run linting and tests
npm run lint
npm run test

# Build the package
npm run build
```

### 2. Verify Package Contents

Run a dry-run publish to verify what will be included in the package:

```bash
npm run publish:dry
```

This will show you exactly what files will be included in the published package. Verify that:

- Only necessary files are included
- No sensitive information or development files are included
- The package size is reasonable

### 3. Update Version

We follow semantic versioning (SemVer):

- **Patch** (`0.1.0` → `0.1.1`): Bug fixes and minor changes
- **Minor** (`0.1.1` → `0.2.0`): New features that don't break existing functionality
- **Major** (`0.2.0` → `1.0.0`): Breaking changes

Use one of these commands to update the version:

```bash
# For bug fixes
npm run version:patch

# For new features
npm run version:minor

# For breaking changes
npm run version:major
```

These commands will:
- Update the version in package.json
- Create a git tag with the new version
- Create a commit with the message "Release v[version]"

### 4. Push Changes

Push the new version tag and commit to GitHub:

```bash
git push --follow-tags
```

### 5. Publish to npm

Finally, publish the package to npm:

```bash
npm publish
```

The package will be published with public access

### 6. Verify Publication

After publishing, verify that the package is available on npm:

```bash
npm view minimax-client
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

```bash
# Re-login to npm
npm login

# Verify you're logged in
npm whoami
```

### Package Visibility

If the package is not visible to others, check the access settings:

```bash
npm access ls-packages
```

To make the package public if it was accidentally published as private:

```bash
npm access public minimax-client
```

### Version Conflicts

If you get a version conflict error, it means that version already exists. You'll need to update to a new version:

```bash
npm version patch
npm publish
```

## Maintaining Multiple Versions

To maintain multiple versions of the package:

1. Create a maintenance branch for the previous version:
   ```bash
   git checkout -b maintenance-v0.x
   ```

2. Make your fixes on this branch

3. Update the version appropriately:
   ```bash
   npm version patch
   ```

4. Publish the specific version:
   ```bash
   npm publish
   ```

## Deprecating Versions

If a version needs to be deprecated:

```bash
npm deprecate minimax-client@"<0.2.0" "Critical security issue, please update to 0.2.0 or later"
```
