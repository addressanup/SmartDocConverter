import { Page, expect } from '@playwright/test'

/**
 * Helper functions for E2E tests
 */

/**
 * Login helper - logs in a user with credentials
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for navigation to complete
  await page.waitForURL('/', { timeout: 5000 })
}

/**
 * Register helper - creates a new user account
 */
export async function register(
  page: Page,
  email: string,
  password: string,
  name?: string
) {
  await page.goto('/register')

  if (name) {
    const nameInput = page.getByLabel(/name/i)
    if (await nameInput.isVisible({ timeout: 1000 })) {
      await nameInput.fill(name)
    }
  }

  await page.getByLabel(/email/i).fill(email)

  const passwordInputs = page.getByLabel(/password/i)
  await passwordInputs.first().fill(password)

  // If there's a confirm password field
  const confirmPasswordInput = page.getByLabel(/confirm.*password/i)
  if (await confirmPasswordInput.isVisible({ timeout: 1000 })) {
    await confirmPasswordInput.fill(password)
  }

  await page.getByRole('button', { name: /sign up|register|create/i }).click()

  // Wait for successful registration
  await page.waitForURL('/', { timeout: 5000 })
}

/**
 * Logout helper - logs out the current user
 */
export async function logout(page: Page) {
  // Look for user menu or logout button
  const userMenu = page.locator('[aria-label*="user menu"], [aria-label*="account"]')

  if (await userMenu.isVisible({ timeout: 1000 })) {
    await userMenu.click()
  }

  const logoutButton = page.getByRole('button', { name: /log out|sign out/i })
  if (await logoutButton.isVisible({ timeout: 1000 })) {
    await logoutButton.click()
  }
}

/**
 * Upload file helper - uploads a file using the file input
 */
export async function uploadFile(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(filePath)

  // Wait for upload to complete
  await page.waitForTimeout(1000)
}

/**
 * Wait for conversion to complete
 */
export async function waitForConversion(page: Page, timeout = 30000) {
  // Wait for either success or error state
  await Promise.race([
    page.waitForSelector('text=/conversion.*complete|download/i', { timeout }),
    page.waitForSelector('text=/error|failed/i', { timeout }),
  ])
}

/**
 * Navigate to a specific tool
 */
export async function navigateToTool(page: Page, toolName: string) {
  await page.goto('/')
  await page.getByRole('link', { name: new RegExp(toolName, 'i') }).click()
  await page.waitForURL(/\/tools\/.*/)
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for user menu or logout button
  const userMenu = page.locator('[aria-label*="user menu"], [aria-label*="account"]')
  const logoutButton = page.getByRole('button', { name: /log out|sign out/i })

  return (
    (await userMenu.isVisible({ timeout: 1000 })) ||
    (await logoutButton.isVisible({ timeout: 1000 }))
  )
}

/**
 * Generate random email for testing
 */
export function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `test-${timestamp}-${random}@example.com`
}

/**
 * Generate random password
 */
export function generateTestPassword(): string {
  return `Test${Math.random().toString(36).substring(2, 15)}!`
}

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Clear all cookies and local storage
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/**
 * Take a screenshot with a custom name
 */
export async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  const element = page.locator(selector)
  await element.scrollIntoViewIfNeeded()
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
) {
  return await page.waitForResponse(
    (response) =>
      (typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())) && response.status() === 200,
    { timeout }
  )
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: any
) {
  await page.route(urlPattern, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    })
  })
}

/**
 * Check for console errors
 */
export async function checkConsoleErrors(page: Page) {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  return errors
}
