# Changelog

All notable changes to **React Unified Storage** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release
- Comprehensive documentation and examples
- CI/CD pipeline with automated testing and publishing

## [1.0.0] - 2025-09-28

### Added
- ✨ **Core Storage Library** (`@sitharaj08/react-unified-storage-core`)
  - Multiple storage drivers: IndexedDB, localStorage, sessionStorage, memory
  - Automatic driver selection with `auto` mode
  - End-to-end encryption with AES-GCM and PBKDF2 key derivation
  - Automatic gzip compression for data optimization
  - Cross-tab synchronization via BroadcastChannel API
  - Schema validation and migration support with Zod
  - TTL (Time To Live) support for automatic data expiration
  - Versioning system for data evolution
  - Comprehensive metadata tracking (timestamps, driver info, versions)
  - Collection API for structured data management
  - Framework-agnostic design for universal usage

- 🚀 **React Integration** (`@sitharaj08/react-unified-storage`)
  - `StorageProvider` context provider for configuration
  - `useStore` hook with automatic re-rendering
  - `useStoreSuspense` hook for Suspense integration
  - `useCollection` hook for collection operations
  - TypeScript-first with full type safety
  - SSR-safe with automatic memory fallback

- 🛠️ **Developer Experience**
  - Full TypeScript support with generated .d.ts files
  - Comprehensive JSDoc documentation
  - Vitest testing framework with high coverage
  - ESLint configuration for code quality
  - Size limit monitoring (<6KB core, <10KB React gzipped)
  - Monorepo setup with pnpm workspaces

- 📚 **Documentation & Examples**
  - Complete README with API reference
  - Interactive example application
  - Contributing guidelines
  - Development setup instructions

### Technical Details

#### Storage Drivers
- **IndexedDB**: Large storage capacity (~50MB+), persistent, async
- **localStorage**: Small storage (~5-10MB), persistent, sync
- **sessionStorage**: Tab-scoped storage, sync
- **Memory**: Unlimited capacity, tab-scoped, fastest

#### Security Features
- AES-GCM encryption with 256-bit keys
- PBKDF2 key derivation with 100,000 iterations
- Random IV generation per operation
- Secure key management and cleanup

#### Performance Optimizations
- Lazy initialization and connection pooling
- Efficient data serialization with compression
- Minimal memory footprint
- Optimized bundle size with tree shaking support

#### Type Safety
- Strict TypeScript configuration
- Generic type support for all operations
- Runtime schema validation with Zod
- Comprehensive error handling with typed errors

### Breaking Changes
- Initial release - no breaking changes

### Dependencies
- **Runtime**: `fflate@^0.8.0`, `zod@^3.22.0` (peer)
- **React**: `react@^16.8.0 || ^17.0.0 || ^18.0.0` (peer)
- **Build**: `typescript@^5.0.0`, `tsup@^7.0.0`, `vitest@^0.34.0`

---

## Version History

### Development Phase (Pre-1.0.0)

#### 0.1.0-alpha - Internal Development
- Basic storage driver implementations
- Core encryption and compression utilities
- Initial React hooks and provider
- Basic testing setup

#### 0.2.0-alpha - Feature Complete
- All storage drivers implemented
- Encryption and compression working
- Cross-tab synchronization
- Collection API
- React integration complete

#### 0.3.0-alpha - Production Ready
- Comprehensive test coverage
- Documentation and examples
- CI/CD pipeline
- Performance optimizations
- Bundle size optimization

---

## Migration Guide

### From 0.x to 1.0.0

No migration needed - this is the initial stable release.

### Future Breaking Changes

#### Planned for 2.0.0
- [ ] React Native AsyncStorage driver
- [ ] DevTools integration
- [ ] Advanced query API for collections
- [ ] Plugin system for custom drivers

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## Acknowledgments

- **Zod** for runtime type validation
- **fflate** for high-performance compression
- **BroadcastChannel API** for cross-tab communication
- **Vitest** for fast and reliable testing
- **TypeScript** for type safety
- **pnpm** for efficient monorepo management

---

*For older versions, see the [Git history](https://github.com/sitharaj08/react-unified-storage/commits/main).*</content>
<parameter name="filePath">/Users/admin/Documents/react-unified-storage/CHANGELOG.md