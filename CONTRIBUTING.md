# Contributing to React Unified Storage

Thank you for your interest in contributing to React Unified Storage! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)
- [Release Process](#release-process)

## 🤝 Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher
- **pnpm**: Version 8.15.0 or higher
- **Git**: Latest stable version

### Quick Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/react-unified-storage.git
cd react-unified-storage

# Install dependencies
pnpm install

# Run initial checks
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## 🛠️ Development Setup

### Monorepo Structure

This is a pnpm monorepo with the following packages:

```
react-unified-storage/
├── packages/
│   ├── core/           # Core storage functionality
│   └── react/          # React bindings and hooks
├── examples/           # Example applications
│   └── react-app/      # Main demo app
├── config/             # Shared configuration
└── docs/               # Documentation (planned)
```

### Available Scripts

```bash
# Root level commands
pnpm build          # Build all packages
pnpm test           # Run all tests
pnpm lint           # Run linting
pnpm typecheck      # Run TypeScript checks

# Package level commands (run from package directory)
pnpm build          # Build specific package
pnpm dev            # Build in watch mode
pnpm test           # Run package tests
pnpm test:watch     # Run tests in watch mode
pnpm lint           # Lint package
pnpm typecheck      # Type check package
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure TypeScript types are correct

3. **Run quality checks**
   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build
   ```

4. **Test your changes**
   ```bash
   cd examples/react-app
   pnpm dev
   ```

## 🏗️ Project Structure

### Core Package (`packages/core/`)

```
src/
├── index.ts          # Main exports
├── core.ts           # Core storage functions
├── types.ts          # TypeScript definitions
├── drivers.ts        # Storage driver factory
├── drivers/          # Individual driver implementations
│   ├── memory.ts
│   ├── webstorage.ts
│   └── indexeddb.ts
├── crypto.ts         # Encryption utilities
├── compress.ts       # Compression utilities
├── broadcast.ts      # Cross-tab synchronization
└── collections.ts    # Collection API
```

### React Package (`packages/react/`)

```
src/
├── index.ts          # Main exports
├── provider.tsx      # StorageProvider component
├── hooks.ts          # React hooks
└── collections.ts    # React collection hooks
```

## 🧪 Testing

### Test Structure

Tests are organized by package and functionality:

```
packages/core/test/
├── core.test.ts      # Core functionality tests
├── drivers.test.ts   # Driver tests
└── collections.test.ts # Collection tests

packages/react/test/
├── hooks.test.ts     # Hook tests
├── provider.test.tsx # Provider tests
└── collections.test.ts # Collection tests
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests for specific package
cd packages/core && pnpm test

# Run with coverage
pnpm test --coverage
```

### Writing Tests

- Use descriptive test names
- Test both success and error cases
- Mock external dependencies when needed
- Use `fake-indexeddb` for IndexedDB tests
- Test TypeScript types with `expect-type`

Example test structure:

```typescript
import { describe, it, expect } from 'vitest';
import { setup, read, write } from '../src/core';

describe('Storage Operations', () => {
  it('should store and retrieve data', async () => {
    await setup({ driver: 'memory' });
    await write('test', { value: 42 });
    const result = await read('test');
    expect(result).toEqual({ value: 42 });
  });
});
```

## 📝 Submitting Changes

### Commit Guidelines

We follow conventional commits:

```bash
# Feature commits
git commit -m "feat: add new storage driver"

# Bug fixes
git commit -m "fix: handle encryption errors gracefully"

# Documentation
git commit -m "docs: update API reference"

# Refactoring
git commit -m "refactor: simplify driver selection logic"

# Tests
git commit -m "test: add collection API tests"
```

### Pull Request Process

1. **Create a PR** from your feature branch to `main`
2. **Fill out the PR template** with:
   - Clear description of changes
   - Breaking changes (if any)
   - Testing instructions
   - Screenshots (if UI changes)

3. **Ensure CI passes** - all checks must pass before merge

4. **Code review** - at least one maintainer review required

5. **Merge** - squash merge with descriptive commit message

### PR Checklist

- [ ] Tests pass locally
- [ ] TypeScript compilation succeeds
- [ ] Linting passes
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Commit messages follow conventions

## 📚 Documentation

### API Documentation

- Keep JSDoc comments up to date
- Update README.md for new features
- Add examples for complex functionality
- Document breaking changes

### Example Updates

When adding new features, consider updating the example app:

```bash
cd examples/react-app
# Make changes to demonstrate new functionality
pnpm dev  # Test the changes
```

## 🚀 Release Process

### Version Bumping

We use semantic versioning:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update version** in package.json files
2. **Update CHANGELOG.md** with release notes
3. **Create git tag** with version number
4. **Push to GitHub** (triggers automated release)
5. **Publish to npm** (via GitHub Actions)

### Pre-release Versions

For beta releases:

```json
{
  "version": "1.2.0-beta.1"
}
```

## 🐛 Issue Reporting

When reporting bugs:

1. **Check existing issues** first
2. **Use issue templates** when available
3. **Provide reproduction steps**
4. **Include environment details** (OS, Node version, browser)
5. **Attach minimal code examples**

## 💡 Feature Requests

For new features:

1. **Check if it fits the project scope**
2. **Provide detailed use case**
3. **Consider backward compatibility**
4. **Suggest implementation approach**

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat (if available)

## 🙏 Recognition

Contributors are recognized in:

- GitHub's contributor insights
- CHANGELOG.md release notes
- Repository README (for major contributors)

Thank you for contributing to React Unified Storage! 🎉</content>
<parameter name="filePath">/Users/admin/Documents/react-unified-storage/CONTRIBUTING.md