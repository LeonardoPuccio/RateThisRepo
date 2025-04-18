# Changelog

All notable changes to the RateThisRepo extension will be documented in this file.

## [0.3.0] - Unreleased

### Added
- WXT framework migration for cross-browser compatibility
- Shadow DOM encapsulation for proper UI isolation
- Tailwind CSS integration for styling components
- Modular architecture with clear separation of concerns
- Type-safe messaging architecture
- Service worker lifecycle management
- State management with event system
- Enhanced error handling with Shadow DOM error display

### Changed
- Refactored content script into smaller, focused modules
- Converted background/content scripts to use WXT patterns
- Improved UI components with Shadow DOM encapsulation
- Enhanced testing infrastructure with Vitest
- Replaced Chrome API calls with browser API pattern
- Improved error boundaries for component initialization

### Fixed
- Global overlay replaced with Shadow DOM internal overlay 
- JS-based tooltips converted to CSS-only approach
- Resource cleanup when components are removed
- Proper error handling for invalid data

## [0.2.0] - 2025-03-29

### Added
- Options page with toggle for floating button visibility
- Debug utilities and separate build modes for development/production
- Improved state synchronization between popup and content script
- Version management scripts for easier versioning
- Environment-based configuration system
- Better storage handling for state persistence

### Fixed
- Fixed synchronization issues between popup and floating button
- Fixed panel state persistence between page reloads

## [0.1.0] - 2025-03-28

### Added
- Initial release with GitHub repository analysis
- Refactored UI components for better maintainability
- Standardized UI component rendering approach
- Implemented component-based architecture
- Added collapsible metric panels
- Detailed repository health indicators
- Comprehensive scoring system for repository quality
