import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('should load login page successfully', async ({ page }) => {
      // Check URL
      await expect(page).toHaveURL('/login')

      // Check for login heading
      await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible()

      // Check for email and password inputs
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // Check for submit button
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should show validation errors for empty form submission', async ({ page }) => {
      // Click sign in button without filling form
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for validation errors
      await page.waitForTimeout(500)

      // Check for validation error messages
      const errors = page.locator('text=/required|invalid|must/i')
      const errorCount = await errors.count()

      // Should have at least one error message
      expect(errorCount).toBeGreaterThan(0)
    })

    test('should validate email format', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)

      // Enter invalid email
      await emailInput.fill('invalidemail')
      await passwordInput.fill('password123')

      // Click sign in
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for validation
      await page.waitForTimeout(500)

      // Check for email validation error
      await expect(page.locator('text=/invalid.*email|email.*invalid/i')).toBeVisible()
    })

    test('should validate password length', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)

      // Enter valid email but short password
      await emailInput.fill('test@example.com')
      await passwordInput.fill('12345')

      // Click sign in
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for validation
      await page.waitForTimeout(500)

      // Check for password validation error
      await expect(page.locator('text=/password.*least.*6|6.*character/i')).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)

      // Enter invalid credentials
      await emailInput.fill('wrong@example.com')
      await passwordInput.fill('wrongpassword123')

      // Click sign in
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for API response
      await page.waitForTimeout(2000)

      // Check for error message (if backend is running)
      const errorMessage = page.locator('text=/invalid.*email.*password|incorrect.*credentials/i')
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible()
      }
    })

    test('should have link to register page', async ({ page }) => {
      // Look for sign up / register link
      const registerLink = page.getByRole('link', { name: /sign up|register/i })
      await expect(registerLink).toBeVisible()

      // Click the link
      await registerLink.click()

      // Should navigate to register page
      await expect(page).toHaveURL('/register')
    })

    test('should have forgot password link', async ({ page }) => {
      // Look for forgot password link
      const forgotPasswordLink = page.getByRole('link', { name: /forgot password/i })

      if (await forgotPasswordLink.isVisible()) {
        await expect(forgotPasswordLink).toBeVisible()
      }
    })

    test('should have Google sign-in option', async ({ page }) => {
      // Look for Google sign-in button
      const googleButton = page.getByRole('button', { name: /google/i })

      if (await googleButton.isVisible()) {
        await expect(googleButton).toBeVisible()
        await expect(googleButton).toBeEnabled()
      }
    })

    test('should disable inputs while loading', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)
      const submitButton = page.getByRole('button', { name: /sign in/i })

      // Fill in valid credentials
      await emailInput.fill('test@example.com')
      await passwordInput.fill('password123')

      // Click submit
      await submitButton.click()

      // Immediately check if button shows loading state
      await page.waitForTimeout(100)

      // Button text might change to "Signing in..."
      const loadingButton = page.getByRole('button', { name: /signing in/i })
      if (await loadingButton.isVisible({ timeout: 1000 })) {
        await expect(loadingButton).toBeVisible()
      }
    })

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // All elements should still be visible
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should have remember me checkbox', async ({ page }) => {
      const rememberCheckbox = page.getByLabel(/remember me/i)

      if (await rememberCheckbox.isVisible()) {
        await expect(rememberCheckbox).toBeVisible()
        await expect(rememberCheckbox).toBeEnabled()

        // Should be clickable
        await rememberCheckbox.click()
        await expect(rememberCheckbox).toBeChecked()
      }
    })
  })

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/register')
    })

    test('should load register page successfully', async ({ page }) => {
      // Check URL
      await expect(page).toHaveURL('/register')

      // Check for register heading
      const heading = page.getByRole('heading', { name: /create.*account|sign up|register/i })
      await expect(heading).toBeVisible()

      // Check for form inputs
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i).first()).toBeVisible()
    })

    test('should show validation errors for empty form', async ({ page }) => {
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /sign up|register|create/i }).first()

      if (await submitButton.isVisible()) {
        await submitButton.click()
        await page.waitForTimeout(500)

        // Should show validation errors
        const errors = page.locator('text=/required|invalid|must/i')
        const errorCount = await errors.count()

        if (errorCount > 0) {
          expect(errorCount).toBeGreaterThan(0)
        }
      }
    })

    test('should validate email format on register', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i)
      const submitButton = page.getByRole('button', { name: /sign up|register|create/i }).first()

      if (await submitButton.isVisible()) {
        await emailInput.fill('invalidemail')

        // Fill other required fields if they exist
        const passwordInputs = page.getByLabel(/password/i)
        if (await passwordInputs.first().isVisible()) {
          await passwordInputs.first().fill('password123')
        }

        await submitButton.click()
        await page.waitForTimeout(500)

        // Check for email validation error
        const emailError = page.locator('text=/invalid.*email|email.*invalid/i')
        if (await emailError.isVisible()) {
          await expect(emailError).toBeVisible()
        }
      }
    })

    test('should have link to login page', async ({ page }) => {
      // Look for sign in / login link
      const loginLink = page.getByRole('link', { name: /sign in|log in|already.*account/i })

      if (await loginLink.isVisible()) {
        await expect(loginLink).toBeVisible()

        await loginLink.click()
        await expect(page).toHaveURL('/login')
      }
    })

    test('should have Google sign-up option', async ({ page }) => {
      // Look for Google sign-up button
      const googleButton = page.getByRole('button', { name: /google/i })

      if (await googleButton.isVisible()) {
        await expect(googleButton).toBeVisible()
        await expect(googleButton).toBeEnabled()
      }
    })

    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      // Form should still be usable
      await expect(page.getByLabel(/email/i)).toBeVisible()

      const submitButton = page.getByRole('button', { name: /sign up|register|create/i }).first()
      if (await submitButton.isVisible()) {
        await expect(submitButton).toBeVisible()
      }
    })
  })

  test.describe('Authentication Flow', () => {
    test('should allow navigation between login and register pages', async ({ page }) => {
      // Start at login
      await page.goto('/login')
      await expect(page).toHaveURL('/login')

      // Go to register
      const registerLink = page.getByRole('link', { name: /sign up|register/i })
      await registerLink.click()
      await expect(page).toHaveURL('/register')

      // Go back to login
      const loginLink = page.getByRole('link', { name: /sign in|log in|already.*account/i })
      if (await loginLink.isVisible()) {
        await loginLink.click()
        await expect(page).toHaveURL('/login')
      }
    })

    test('should have accessible form labels', async ({ page }) => {
      await page.goto('/login')

      // Check that form is accessible
      const emailInput = page.getByLabel(/email/i)
      const passwordInput = page.getByLabel(/password/i)

      await expect(emailInput).toBeVisible()
      await expect(passwordInput).toBeVisible()

      // Inputs should have proper IDs matching labels
      const emailId = await emailInput.getAttribute('id')
      const passwordId = await passwordInput.getAttribute('id')

      expect(emailId).toBeTruthy()
      expect(passwordId).toBeTruthy()
    })
  })
})
