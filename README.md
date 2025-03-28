# RateThisRepo
For when size really doesn't matter

A Chrome extension for analyzing GitHub repositories and providing quality metrics.

## Project Structure

```
ratethisrepo/
├── dist/                # Built extension files (load this folder in Chrome)
├── icons/               # Extension icons
├── src/                 # Source code
│   ├── analysis/        # Analysis algorithms and insights
│   │   └── insights/    # Strengths and recommendations analyzers
│   ├── interfaces/      # TypeScript interfaces
│   ├── popup/           # Popup UI files
│   ├── ui/              # UI components
│   │   ├── components/  # Main UI components
│   │   │   ├── metrics/ # Detailed metrics components
│   │   │   │   └── cards/ # Specialized metric card components
│   │   ├── helpers/     # UI helper functions
│   │   └── services/    # UI services (styles, drag)
│   ├── utils/           # Utility functions
│   ├── background.ts    # Extension background script
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
# Build the extension
npm run build

# Watch for changes during development
npm run dev

# Type check without compiling
npm run check-types

# Run tests
npm run test
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

## License

MIT
