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

## Features

- Analyzes GitHub repositories to provide quality metrics
- Shows repository health indicators
- Provides detailed scores for popularity, activity, community, maintenance, and documentation
- Identifies strengths and areas for improvement
- Offers comprehensive metrics with collapsible sections
- Explains the scoring methodology
