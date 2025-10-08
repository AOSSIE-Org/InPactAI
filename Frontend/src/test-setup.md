# Test Setup Guide

This document explains how to set up and run tests for the analytics and brand settings components.

## Prerequisites

To run the tests, you'll need to install testing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

## Test Configuration

Create a `vitest.config.ts` file in the Frontend directory:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create a `src/test-setup.ts` file:

```typescript
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

## Running Tests

Add test scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

Run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Files

The following test files have been created:

### Analytics Components
- `src/components/analytics/__tests__/performance-overview.test.tsx`
- `src/components/analytics/__tests__/metrics-chart.test.tsx`

### Content Components
- `src/components/content/__tests__/content-linking.test.tsx`

### Brand Components
- `src/components/brand/__tests__/social-account-connection.test.tsx`

### Pages
- `src/pages/__tests__/Analytics.test.tsx`

## Test Coverage

The tests cover:

1. **Component Rendering**: Ensures components render correctly with different props
2. **User Interactions**: Tests button clicks, form submissions, and user input
3. **State Management**: Verifies component state changes and updates
4. **Error Handling**: Tests error scenarios and fallback behavior
5. **Loading States**: Ensures loading indicators work correctly
6. **API Integration**: Mocks API calls and tests response handling

## Mocking Strategy

The tests use various mocking strategies:

- **External Libraries**: Recharts, Sonner toast notifications
- **API Calls**: Fetch requests with different response scenarios
- **Browser APIs**: localStorage, window.open, URL.createObjectURL
- **React Context**: Auth context for user authentication
- **Component Dependencies**: Child components are mocked for isolation

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Cleanup**: Tests clean up after themselves using beforeEach/afterEach
3. **Realistic Data**: Tests use realistic mock data that matches expected formats
4. **Error Scenarios**: Tests include both success and error cases
5. **Accessibility**: Tests use accessible queries when possible
6. **Performance**: Tests are fast and don't make real network requests

## Troubleshooting

Common issues and solutions:

1. **Import Errors**: Ensure path aliases are configured correctly in vitest.config.ts
2. **Component Not Found**: Check that components are exported correctly
3. **Mock Issues**: Verify mocks are cleared between tests
4. **Async Issues**: Use waitFor for async operations
5. **DOM Issues**: Ensure jsdom environment is configured

## Future Improvements

Consider adding:

1. **E2E Tests**: Cypress or Playwright for full user workflows
2. **Visual Regression Tests**: Chromatic or similar for UI consistency
3. **Performance Tests**: Bundle size and runtime performance monitoring
4. **Integration Tests**: Test component interactions with real APIs
5. **Accessibility Tests**: Automated a11y testing with jest-axe