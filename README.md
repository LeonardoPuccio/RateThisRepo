# RateThisRepo
For when size really doesn't matter

A Chrome extension for analyzing GitHub repositories and providing quality metrics.

## Project Structure

```
ratethisrepo/
├── dist/                # Built extension files (load this folder in Chrome)
├── icons/               # Extension icons
├── scripts/             # Utility scripts
├── src/                 # Source code
│   ├── analysis/        # Analysis algorithms and insights
│   │   └── insights/    # Strengths and recommendations analyzers
│   ├── interfaces/      # TypeScript interfaces
│   ├── options/         # Options page UI files
│   ├── popup/           # Popup UI files
│   ├── ui/              # UI components
│   │   ├── components/  # Main UI components
│   │   │   ├── metrics/ # Detailed metrics components
│   │   │   │   └── cards/ # Specialized metric card components
│   │   ├── helpers/     # UI helper functions
│   │   └── services/    # UI services (styles, drag)
│   ├── utils/           # Utility functions
│   ├── background.ts    # Extension background script
│   ├── config.ts        # Global configuration and debug settings
│   ├── constants.ts     # Shared constants
│   ├── content.ts       # Content script injected into GitHub pages
│   └── manifest.json    # Extension manifest
├── tests/               # Test files
│   ├── unit/            # Unit tests
│   └── utils/           # Test utilities
├── .gitignore           # Git ignore file
├── jest.config.js       # Jest configuration
├── package.json         # Node.js dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── webpack.config.js    # Webpack configuration
```

## Development

### Setup

```bash
# Install dependencies
npm install
```

### Build

```bash
# Build the extension for production
npm run build

# Build for development with debugging enabled
npm run build:dev

# Watch for changes during development
npm run dev

# Type check without compiling
npm run check-types

# Run tests
npm run test
```

### Version Management

```bash
# Increment patch version (0.2.0 → 0.2.1)
npm run version:patch

# Increment minor version (0.2.0 → 0.3.0)
npm run version:minor

# Increment major version (0.2.0 → 1.0.0)
npm run version:major
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder from this project

## Architecture

The extension follows a component-based architecture with clear separation of concerns:

- **Analysis Engine**: Evaluates repository metrics and generates insights
- **UI Components**: Modular components for displaying analysis results
- **Utility Services**: Helper functions and services for specific tasks

### Key Components

- **AnalysisPanel**: Main container for the analysis results
- **HealthIndicators**: Displays repository health status indicators
- **DetailedMetricsPanel**: Coordinates display of metrics and insights
- **Specialized Cards**: Individual components for specific metric displays

## Features

- Analyzes GitHub repositories to provide quality metrics
- Shows repository health indicators
- Provides detailed scores for popularity, activity, community, maintenance, and documentation
- Identifies strengths and areas for improvement
- Offers comprehensive metrics with collapsible sections
- Explains the scoring methodology
- Options page to customize UI elements
- Development/production build modes with debugging utilities

## Changelog

### 0.2.0 (March 29, 2025)

#### Added
- Options page with toggle for floating button visibility
- Debug utilities and separate build modes for development/production
- Improved state synchronization between popup and content script
- Version management scripts for easier versioning
- Environment-based configuration system
- Better storage handling for state persistence

#### Fixed
- Fixed synchronization issues between popup and floating button
- Fixed panel state persistence between page reloads

### 0.1.0 (March 28, 2025)

#### Added
- Initial release with GitHub repository analysis
- Refactored UI components for better maintainability
- Standardized UI component rendering approach
- Implemented component-based architecture
- Added collapsible metric panels
- Detailed repository health indicators
- Comprehensive scoring system for repository quality

## License

MIT
