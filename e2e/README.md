# E2E Tests for SmartDocConverter

This directory contains end-to-end (E2E) tests for the SmartDocConverter application using Playwright.

## Test Structure

- **home.spec.ts** - Tests for the home page including tool grid, filtering, and navigation
- **conversion.spec.ts** - Tests for the document conversion flow (upload, convert, download)
- **auth.spec.ts** - Tests for authentication (login, register, validation)
- **pricing.spec.ts** - Tests for the pricing page (plans, CTA buttons, FAQ)
- **fixtures/** - Test files used in E2E tests (e.g., test.pdf)

## Running Tests

### Run all tests (headless mode)
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/home.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## View Test Reports

After running tests, view the HTML report:
```bash
npm run test:e2e:report
```

## Test Configuration

The Playwright configuration is in `playwright.config.ts` at the root level. It includes:

- **Base URL**: http://localhost:3000
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Web Server**: Automatically starts Next.js dev server before tests
- **Retries**: 2 retries on CI, 0 locally
- **Screenshots**: Captured on failure
- **Videos**: Retained on failure
- **Traces**: Captured on first retry

## Writing Tests

### Best Practices

1. **Use proper locators**: Prefer role-based selectors and text content
   ```typescript
   await page.getByRole('button', { name: /sign in/i })
   await page.getByLabel(/email/i)
   ```

2. **Wait for elements**: Use Playwright's auto-waiting
   ```typescript
   await expect(page.locator('#tools')).toBeVisible()
   ```

3. **Test user flows**: Focus on user journeys, not implementation details
   ```typescript
   // Good: Test the user action
   await page.getByRole('link', { name: /PDF to Word/i }).click()

   // Avoid: Testing implementation details
   await page.locator('.tool-card:nth-child(1)').click()
   ```

4. **Use test fixtures**: Keep test data in the fixtures directory
   ```typescript
   const testFilePath = path.join(__dirname, 'fixtures', 'test.pdf')
   ```

5. **Group related tests**: Use describe blocks
   ```typescript
   test.describe('Login Page', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/login')
     })
     // ... tests
   })
   ```

## CI/CD Integration

Tests are configured to run in CI with:
- Single worker (sequential execution)
- 2 retries on failure
- Headless mode
- Full test reports as artifacts

## Troubleshooting

### Tests fail with "Timeout waiting for page"
- Ensure Next.js dev server is running or can be started
- Increase timeout in playwright.config.ts webServer section

### File upload tests fail
- Verify test.pdf exists in e2e/fixtures/
- Check file permissions

### Browser-specific failures
- Run tests in that specific browser to debug
- Use `--headed` and `--debug` flags to see what's happening

### Flaky tests
- Add appropriate waits for dynamic content
- Use Playwright's auto-waiting features
- Avoid fixed timeouts when possible

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - Use `npx playwright codegen http://localhost:3000`
