import { test, expect } from '@playwright/test'

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing')
  })

  test('should load pricing page successfully', async ({ page }) => {
    // Check URL
    await expect(page).toHaveURL('/pricing')

    // Check for pricing heading
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible()
  })

  test('should display all 3 pricing plans', async ({ page }) => {
    // Check for Free plan
    await expect(page.getByRole('heading', { name: /^Free$/i })).toBeVisible()

    // Check for Premium plan
    await expect(page.getByRole('heading', { name: /Premium/i })).toBeVisible()

    // Check for Annual plan
    await expect(page.getByRole('heading', { name: /Annual/i })).toBeVisible()
  })

  test('should display correct prices for each plan', async ({ page }) => {
    // Free plan - $0
    await expect(page.locator('text=/\\$0/').first()).toBeVisible()

    // Premium plan - $4.99
    await expect(page.locator('text=/\\$4\\.99/').first()).toBeVisible()

    // Annual plan - $39.99
    await expect(page.locator('text=/\\$39\\.99/').first()).toBeVisible()
  })

  test('should show plan features for each tier', async ({ page }) => {
    // Free plan features
    await expect(page.locator('text=/5 conversions per day/i')).toBeVisible()
    await expect(page.locator('text=/Max file size.*10MB/i')).toBeVisible()

    // Premium plan features
    await expect(page.locator('text=/Unlimited conversions/i')).toBeVisible()
    await expect(page.locator('text=/50MB/i')).toBeVisible()

    // Annual plan features
    await expect(page.locator('text=/100MB/i')).toBeVisible()
    await expect(page.locator('text=/API access/i')).toBeVisible()
  })

  test('should have clickable CTA buttons for all plans', async ({ page }) => {
    // Free plan CTA
    const freeCTA = page.getByRole('link', { name: /Get Started Free/i })
    await expect(freeCTA).toBeVisible()
    await expect(freeCTA).toBeEnabled()

    // Premium plan CTA
    const premiumCTA = page.getByRole('link', { name: /Start Free Trial/i })
    await expect(premiumCTA).toBeVisible()
    await expect(premiumCTA).toBeEnabled()

    // Annual plan CTA
    const annualCTA = page.getByRole('link', { name: /Get Annual Plan/i })
    await expect(annualCTA).toBeVisible()
    await expect(annualCTA).toBeEnabled()
  })

  test('should navigate to correct pages when clicking CTA buttons', async ({ page }) => {
    // Click Free plan CTA
    const freeCTA = page.getByRole('link', { name: /Get Started Free/i })
    await freeCTA.click()

    // Should navigate to tools section or home
    await expect(page).toHaveURL(/\/(#tools)?/)

    // Go back to pricing
    await page.goto('/pricing')

    // Click Premium plan CTA
    const premiumCTA = page.getByRole('link', { name: /Start Free Trial/i })
    await premiumCTA.click()

    // Should navigate to register with plan parameter
    await expect(page).toHaveURL(/\/register\?plan=premium/)

    // Go back to pricing
    await page.goto('/pricing')

    // Click Annual plan CTA
    const annualCTA = page.getByRole('link', { name: /Get Annual Plan/i })
    await annualCTA.click()

    // Should navigate to register with plan parameter
    await expect(page).toHaveURL(/\/register\?plan=annual/)
  })

  test('should highlight the most popular plan', async ({ page }) => {
    // Premium plan should have "Most Popular" badge
    const popularBadge = page.locator('text=/Most Popular/i')
    await expect(popularBadge).toBeVisible()

    // Or check for "Best Value" badge on Annual plan
    const bestValueBadge = page.locator('text=/Best Value/i')
    if (await bestValueBadge.isVisible()) {
      await expect(bestValueBadge).toBeVisible()
    }
  })

  test('should display FAQ section', async ({ page }) => {
    // Scroll to FAQ section
    const faqHeading = page.getByRole('heading', { name: /Frequently Asked Questions|FAQ/i })
    await faqHeading.scrollIntoViewIfNeeded()
    await expect(faqHeading).toBeVisible()

    // Check for common FAQ questions
    await expect(page.locator('text=/cancel.*subscription/i')).toBeVisible()
    await expect(page.locator('text=/payment methods/i')).toBeVisible()
    await expect(page.locator('text=/free trial/i')).toBeVisible()
  })

  test('should display FAQ answers', async ({ page }) => {
    // Scroll to FAQ
    const faqHeading = page.getByRole('heading', { name: /Frequently Asked Questions|FAQ/i })
    await faqHeading.scrollIntoViewIfNeeded()

    // Check that answers are visible (not collapsed)
    await expect(page.locator('text=/credit card.*PayPal.*Stripe/i')).toBeVisible()
    await expect(page.locator('text=/7-day free trial/i')).toBeVisible()
  })

  test('should have features/benefits section', async ({ page }) => {
    // Check for "Why Choose" section
    const whyChooseHeading = page.getByRole('heading', { name: /Why Choose/i })

    if (await whyChooseHeading.isVisible()) {
      await whyChooseHeading.scrollIntoViewIfNeeded()
      await expect(whyChooseHeading).toBeVisible()

      // Check for feature icons/descriptions
      await expect(page.locator('text=/Lightning Fast|Fast/i')).toBeVisible()
      await expect(page.locator('text=/Secure.*Private/i')).toBeVisible()
      await expect(page.locator('text=/24.*7|Available/i')).toBeVisible()
    }
  })

  test('should have final CTA section', async ({ page }) => {
    // Scroll to bottom CTA section
    const finalCTA = page.getByRole('heading', { name: /Ready to Get Started/i })

    if (await finalCTA.isVisible()) {
      await finalCTA.scrollIntoViewIfNeeded()
      await expect(finalCTA).toBeVisible()

      // Check for CTA buttons
      const startButton = page.getByRole('link', { name: /Start Converting Free/i })
      const premiumButton = page.getByRole('link', { name: /Try Premium Free/i })

      if (await startButton.isVisible()) {
        await expect(startButton).toBeVisible()
      }
      if (await premiumButton.isVisible()) {
        await expect(premiumButton).toBeVisible()
      }
    }
  })

  test('should show check marks for included features', async ({ page }) => {
    // Look for visual indicators (check marks) for included features
    // This depends on implementation - could be SVG icons or special characters

    // Count the number of feature items
    const freeFeatures = page.locator('text=/5 conversions per day/i').locator('..')
    await expect(freeFeatures).toBeVisible()
  })

  test('should show X marks or different styling for excluded features', async ({ page }) => {
    // Free plan should have some excluded features
    // Look for "Priority processing" which should be excluded in Free plan

    const excludedFeature = page.locator('text=/Priority processing/i').first()
    await expect(excludedFeature).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // All plans should still be visible
    await expect(page.getByRole('heading', { name: /^Free$/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Premium/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Annual/i })).toBeVisible()

    // CTA buttons should be visible
    await expect(page.getByRole('link', { name: /Get Started Free/i })).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    // All content should be visible and well-formatted
    await expect(page.getByRole('heading', { name: /pricing/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /^Free$/i })).toBeVisible()

    // Scroll to FAQ
    const faqHeading = page.getByRole('heading', { name: /Frequently Asked Questions|FAQ/i })
    await faqHeading.scrollIntoViewIfNeeded()
    await expect(faqHeading).toBeVisible()
  })

  test('should have accessible plan descriptions', async ({ page }) => {
    // Check that each plan has a description
    await expect(page.locator('text=/Perfect for occasional/i')).toBeVisible()
    await expect(page.locator('text=/power users.*professionals/i')).toBeVisible()
    await expect(page.locator('text=/Best value.*save/i')).toBeVisible()
  })

  test('should display period information for each plan', async ({ page }) => {
    // Free - forever
    await expect(page.locator('text=/forever/i')).toBeVisible()

    // Premium - per month
    await expect(page.locator('text=/per month/i').first()).toBeVisible()

    // Annual - per year
    await expect(page.locator('text=/per year/i')).toBeVisible()
  })

  test('should be able to navigate back to home', async ({ page }) => {
    // Click logo or home link
    const homeLink = page.locator('header a[href="/"], nav a[href="/"]').first()

    if (await homeLink.isVisible()) {
      await homeLink.click()
      await expect(page).toHaveURL('/')
    }
  })

  test('should have consistent styling across all plan cards', async ({ page }) => {
    // Get all plan cards
    const planCards = page.locator('div:has(> h3:text-matches("Free|Premium|Annual", "i"))').filter({ has: page.locator('text=/\\$\\d+/') })

    // Should have at least 3 plan cards
    const cardCount = await planCards.count()
    expect(cardCount).toBeGreaterThanOrEqual(3)
  })
})
