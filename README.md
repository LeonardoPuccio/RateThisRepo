# RateThisRepo

A Chrome extension for analyzing GitHub repositories and providing quality metrics.

## Project Structure

WXT-based extension with the following structure:

```
ratethisrepo/
├── src/                 # Source code
│   ├── analysis/        # Analysis algorithms and insights
│   ├── entrypoints/     # Extension entrypoints (background, content, popup, options)
│   │   ├── background.ts    # Background script
│   │   ├── content.ts       # Content script for GitHub pages
│   │   ├── options/         # Options page
│   │   └── popup/           # Browser action popup
│   ├── interfaces/      # TypeScript interfaces
│   ├── ui/              # UI components
│   │   ├── components/  # Reusable UI components
│   │   ├── helpers/     # UI helper functions
│   │   └── services/    # UI services
│   └── utils/           # Utility functions and constants
├── public/              # Static assets
│   └── icons/           # Extension icons
├── .wxt/                # WXT generated files
├── package.json         # Project metadata and dependencies
├── tsconfig.json        # TypeScript configuration
└── wxt.config.ts        # WXT configuration
```

## Development

### Setup

```bash
# Install dependencies
npm install
```

### Build

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Check types
npm run compile
```

### Loading the Extension

1. Run `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3` folder from this project

## Features

- Analyzes GitHub repositories to provide quality metrics
- Shows repository health indicators
- Provides detailed scores for popularity, activity, community, maintenance, and documentation
- Identifies strengths and areas for improvement
- Offers comprehensive metrics with collapsible sections
- Explains the scoring methodology
