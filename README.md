# RateThisRepo

A browser extension for analyzing GitHub repositories and providing quality metrics.

## Features

- Analyzes GitHub repositories to provide quality metrics
- Shows repository health indicators
- Provides detailed scores for popularity, activity, community, maintenance, and documentation
- Identifies strengths and areas for improvement
- Offers comprehensive metrics with collapsible sections
- Explains the scoring methodology
- Works across multiple browsers (Chrome, Firefox, Edge)

For a detailed list of changes between versions, please see the [CHANGELOG](CHANGELOG.md).

## Architecture

RateThisRepo is built with WXT (Web Extension Tools), providing a modern, type-safe framework for browser extensions.

### Project Structure

```
ratethisrepo/
├── src/                 # Source code
│   ├── analysis/        # Analysis algorithms and insights
│   ├── assets/          # CSS and other assets
│   ├── entrypoints/     # Extension entrypoints
│   │   ├── background.ts    # Service worker script
│   │   ├── content/         # Content scripts
│   │   ├── options/         # Options page
│   │   └── popup/           # Browser action popup
│   ├── interfaces/      # TypeScript interfaces
│   ├── services/        # Core services (messaging, storage, state)
│   ├── ui/              # UI components
│   │   ├── components/  # Reusable UI components
│   │   ├── helpers/     # UI helper functions
│   │   └── services/    # UI services
│   └── utils/           # Utility functions and constants
├── public/              # Static assets
│   └── icons/           # Extension icons
├── tests/               # Test files
│   └── unit/            # Unit tests
├── .wxt/                # WXT generated files
├── wxt.config.ts        # WXT configuration
└── tsconfig.json        # TypeScript configuration
```

### Key Technical Features

- **WXT Framework**: Modern build system and cross-browser compatibility
- **Shadow DOM**: Complete UI isolation with encapsulated styles
- **Tailwind CSS**: Utility-first styling with custom components
- **TypeScript**: Type-safe development throughout the codebase
- **Service Worker**: Reliable background processing with lifecycle management
- **State Management**: Centralized state with event-based updates
- **Messaging**: Type-safe communication between contexts

## Development

### Prerequisites

- Node.js 16+
- pnpm 8+ (we use pnpm as our package manager for faster, more reliable builds)

### Setup

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install
```

### Development Commands

```bash
# Development mode with hot reload
pnpm dev

# Development mode for Firefox
pnpm dev:firefox

# Build for production
pnpm build

# Build for Firefox
pnpm build:firefox

# Create distribution zip
pnpm zip

# Create Firefox distribution zip
pnpm zip:firefox

# Check types without building
pnpm check-types

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix
```

### Loading the Extension

#### Chrome/Edge

1. Run `pnpm build`
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `.output/chrome-mv3` folder from this project

#### Firefox

1. Run `pnpm build:firefox`
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on"
4. Select any file in the `.output/firefox-mv2` folder

## Styling Guidelines

The extension uses TailwindCSS integrated with Shadow DOM for isolated styling. This approach prevents our styles from affecting the GitHub page and vice versa.

### CSS Class Naming Convention

- Use Tailwind utility classes for general styling (spacing, colors, layout)
- Use `rtr-` prefixed classes for custom behaviors and components
- Example: `<div class="flex items-center p-2 rtr-bg-success-light">...</div>`

### Shadow DOM Integration

- All UI components use WXT's `createShadowRootUi` with `cssInjectionMode: 'ui'`
- Add `BUTTON_CLASSES.COMPONENT` to container elements for base styling
- Set `overflow: visible` on shadow hosts to prevent animation clipping

### Status Classes

Use these semantic classes for consistent color coding:

| Status | Text | Background | Light Background | Border |
|--------|------|------------|------------------|--------|
| Success | `rtr-success` | `rtr-bg-success` | `rtr-bg-success-light` | `rtr-border-success` |
| Warning | `rtr-warning` | `rtr-bg-warning` | `rtr-bg-warning-light` | `rtr-border-warning` |
| Error | `rtr-error` | `rtr-bg-error` | `rtr-bg-error-light` | `rtr-border-error` |

### Animation Classes

- `rtr-animate-pulse`: For pulsing animations
- `rtr-button-active`: For active toggle state
- `rtr-button-default`: For default toggle state

### Component Styling

- `rtr-component`: Base class for all containers in Shadow DOM
- `rtr-button-container`: Container for buttons with proper spacing for animations
- `rtr-tooltip`: Class for tooltips with standard styling
- `rtr-bar`: Progress bar with transitions

### How to Use

Import the constants from `ui/styles/button-animations.ts`:

```typescript
import { BUTTON_CLASSES } from '@/ui/styles/button-animations';

// In your component:
container.classList.add(BUTTON_CLASSES.COMPONENT);
button.classList.add(BUTTON_CLASSES.DEFAULT);
```

## Contributing

Contributions are welcome! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

## License

MIT