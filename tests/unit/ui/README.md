# UI Component Tests for RateThisRepo

This directory contains tests for the UI components of the RateThisRepo extension.

## Overview

The UI component tests verify the functionality of:

- Icon rendering and SVG generation
- Element creation and manipulation
- Style application and management
- Component initialization and rendering

## Running Tests

Run the tests using:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Manual Testing

For manual testing of component rendering in a browser, use the component test utility:

```javascript
// Copy utility.js to your dist folder or modify webpack.config.js to include it
// Then in the browser console:
runUIComponentTests();
```

This will render test versions of all UI components for visual inspection.

## Common Issues and Solutions

### SVG Rendering Issues

If SVGs aren't rendering properly:

1. Ensure the SVG string includes the `xmlns` attribute
2. Verify SVG path data is correctly formatted
3. Check that styles for SVG elements are properly applied

### Component Initialization Issues

If components aren't initializing correctly:

1. Check TypeScript property initialization (use definite assignment if needed)
2. Verify DOM elements are created with proper attributes
3. Look for console errors related to component creation

## Best Practices

1. **Test isolated components** before testing interactions
2. **Add tests for new components** when they're created
3. **Test edge cases** (empty data, extreme values)
4. **Keep tests focused** on specific functionality
5. **Mock complex dependencies** to isolate component behavior
