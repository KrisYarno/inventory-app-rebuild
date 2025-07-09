# Mass Update Feature Test Suite

This directory contains comprehensive tests for the inventory mass update (journal) feature.

## Test Structure

```
__tests__/
├── unit/                    # Unit tests for individual functions
│   ├── use-journal.test.ts  # Journal store hook tests
│   └── inventory-validation.test.ts  # Validation logic tests
├── integration/             # API integration tests
│   └── batch-adjust-api.test.ts  # Batch adjustment endpoint tests
├── components/              # React component tests
│   └── review-changes-dialog.test.tsx  # Review dialog component tests
└── e2e/                     # End-to-end workflow tests
    └── mass-update-flow.test.tsx  # Complete user journey tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests only
npm run test:components    # Component tests only
npm run test:e2e          # End-to-end tests only

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# CI mode (for automated testing)
npm run test:ci
```

## Test Coverage Areas

### 1. Unit Tests (`test:unit`)
- **Journal Store (use-journal.test.ts)**
  - Adding/updating adjustments
  - Removing adjustments
  - Clearing all adjustments
  - Computing totals (additions, removals, net)
  - Edge cases (zero changes, large numbers)

- **Validation Logic (inventory-validation.test.ts)**
  - Positive/negative adjustment validation
  - Insufficient inventory detection
  - Optimistic locking validation
  - Batch validation with multiple errors

### 2. Integration Tests (`test:integration`)
- **Batch Adjust API (batch-adjust-api.test.ts)**
  - Authentication requirements
  - Request body validation
  - Successful batch processing
  - Transaction atomicity
  - Error handling (DB errors, validation errors)
  - Optimistic locking conflicts

### 3. Component Tests (`test:components`)
- **Review Changes Dialog (review-changes-dialog.test.tsx)**
  - Rendering with adjustments
  - Summary statistics calculation
  - Negative stock warnings
  - Button states (enabled/disabled)
  - Accessibility (ARIA attributes)
  - User interactions (confirm/cancel)

### 4. End-to-End Tests (`test:e2e`)
- **Complete Mass Update Flow (mass-update-flow.test.tsx)**
  - Loading products
  - Making multiple adjustments
  - Review dialog flow
  - Successful submission
  - Error handling scenarios
  - Search/filter during editing
  - Optimistic lock handling

## Key Test Scenarios

### Critical Paths
1. **Save Functionality**
   - Multiple products adjusted simultaneously
   - All changes saved atomically
   - Proper cleanup after save

2. **Error Handling**
   - Negative stock prevention
   - Network/API failures
   - Concurrent edit conflicts
   - Invalid data rejection

3. **Data Integrity**
   - Version checking (optimistic locking)
   - Transaction rollback on failure
   - Accurate quantity calculations
   - Audit trail creation

### Edge Cases
- Empty adjustments (no changes)
- Very large adjustment values
- Decimal quantities (if supported)
- Rapid successive saves
- Browser refresh during editing

## Testing Best Practices

1. **Isolation**: Each test is independent and doesn't rely on others
2. **Mocking**: External dependencies (API, auth) are mocked
3. **Accessibility**: Tests verify ARIA attributes and keyboard navigation
4. **Error Messages**: Tests verify user-friendly error messages
5. **Performance**: Tests complete quickly (<100ms for unit, <500ms for integration)

## Continuous Integration

The test suite is designed to run in CI environments:

```bash
npm run test:ci
```

This command:
- Runs all tests
- Generates coverage reports
- Exits with appropriate codes for CI/CD
- Outputs results in CI-friendly format

## Coverage Goals

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

View coverage report after running tests:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Debugging Tests

To debug a specific test:
```bash
# Run in watch mode
npm run test:watch

# Run with verbose output
node scripts/test-runner.js unit --verbose

# Run a specific test file
npx jest __tests__/unit/use-journal.test.ts
```

## Adding New Tests

When adding new features:
1. Write unit tests for new functions/hooks
2. Add integration tests for new API endpoints
3. Create component tests for new UI elements
4. Update e2e tests to cover new workflows
5. Ensure coverage thresholds are maintained

## Common Test Utilities

The test suite includes several utilities:
- Mock session providers
- Query client wrappers
- Render helpers with providers
- Common test data factories

See `jest.setup.js` for global test configuration and mocks.