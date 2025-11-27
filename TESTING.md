# Testing Documentation

## Overview

SmartDocConverter uses Jest and React Testing Library for comprehensive testing of components, utilities, and application logic.

## Test Structure

```
__tests__/
├── components/
│   ├── FileUploader.test.tsx
│   └── ProgressBar.test.tsx
└── lib/
    └── utils.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Generate coverage report
```bash
npm run test:coverage
```

## Test Coverage

### FileUploader Component Tests (18 tests)
- Renders with default and custom props
- Handles file selection via input
- Displays uploaded file information
- Handles file removal
- Replaces/adds files based on maxFiles setting
- Validates file size limits
- Respects disabled state
- Applies custom className
- Generates unique file IDs

### ProgressBar Component Tests (18 tests)
- Renders with default props
- Shows/hides progress label
- Clamps progress to 0-100 range
- Handles decimal progress values
- Renders with different sizes (sm, md, lg)
- Renders with different variants (default, success, error)
- Applies custom className
- Maintains smooth animations
- Properly structures nested elements

### Utils Functions Tests (18 tests)

#### cn() utility
- Merges class names correctly
- Handles conditional class names
- Filters out falsy values
- Resolves Tailwind class conflicts
- Handles empty input and arrays
- Supports object-style class names

#### formatFileSize() utility
- Formats bytes, KB, MB, GB correctly
- Handles 0 bytes edge case
- Rounds to 2 decimal places
- Handles large file sizes
- Returns consistent format

## Configuration Files

### jest.config.js
- Next.js-specific Jest configuration
- Module path aliasing (@/ to src/)
- Environment setup for jsdom
- Coverage collection settings

### jest.setup.js
- Imports @testing-library/jest-dom
- Provides custom matchers like toBeInTheDocument()

## Writing New Tests

### Component Test Template

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import { YourComponent } from '@/components/YourComponent'

// Mock dependencies if needed
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Utility Test Template

```typescript
import { yourUtility } from '@/lib/utils'

describe('yourUtility', () => {
  it('works as expected', () => {
    expect(yourUtility('input')).toBe('expected output')
  })
})
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on how components behave from a user's perspective
2. **Use Descriptive Test Names**: Clearly describe what the test validates
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
4. **Mock External Dependencies**: Isolate component logic from external dependencies
5. **Test Edge Cases**: Include tests for boundary conditions and error states
6. **Keep Tests Fast**: Avoid unnecessary delays or timeouts
7. **Clean Up**: Ensure tests don't leave side effects

## Common Testing Utilities

### From @testing-library/react
- `render()`: Render a component
- `screen`: Query rendered elements
- `fireEvent`: Trigger events
- `waitFor()`: Wait for async operations
- `userEvent`: Simulate user interactions

### Custom Matchers from jest-dom
- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveStyle()`
- `toBeVisible()`
- `toBeDisabled()`

## Debugging Tests

### View rendered output
```typescript
import { render, screen, debug } from '@testing-library/react'

const { debug } = render(<Component />)
debug() // Prints DOM to console
```

### Use screen.logTestingPlaygroundURL()
```typescript
screen.logTestingPlaygroundURL()
// Opens Testing Playground with current DOM
```

## Continuous Integration

Tests are configured to run in CI/CD pipelines. Ensure all tests pass before merging pull requests.

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
