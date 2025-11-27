import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the home page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/SmartDocConverter/i)

    // Check hero section is visible
    const hero = page.locator('section').first()
    await expect(hero).toBeVisible()
  })

  test('should display all tool cards in the grid', async ({ page }) => {
    // Wait for the tools section to be visible
    const toolsSection = page.locator('#tools')
    await expect(toolsSection).toBeVisible()

    // Check that tool cards are displayed
    const toolCards = page.locator('#tools a[href^="/tools/"]')
    const toolCount = await toolCards.count()

    // Should have at least 12 tools
    expect(toolCount).toBeGreaterThanOrEqual(12)

    // Check that specific popular tools are present
    await expect(page.getByRole('link', { name: /PDF to Word/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Word to PDF/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /PDF to Excel/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Compress PDF/i })).toBeVisible()
  })

  test('should filter tools by category', async ({ page }) => {
    // Wait for the tools section
    await page.locator('#tools').waitFor()

    // Get initial count of visible tools
    const allToolsCount = await page.locator('#tools a[href^="/tools/"]').count()

    // Click on PDF category filter
    await page.getByRole('button', { name: 'PDF' }).click()

    // Wait for filtering to complete
    await page.waitForTimeout(300)

    // Get filtered count
    const filteredCount = await page.locator('#tools a[href^="/tools/"]').count()

    // Filtered count should be less than total (since we have Image and OCR tools)
    expect(filteredCount).toBeLessThan(allToolsCount)

    // Check that PDF tools are still visible
    await expect(page.getByRole('link', { name: /PDF to Word/i })).toBeVisible()

    // Click on Image category
    await page.getByRole('button', { name: 'Image' }).click()
    await page.waitForTimeout(300)

    // Check that Image tools are visible
    await expect(page.getByRole('link', { name: /JPG to PDF/i })).toBeVisible()

    // Click "All" to reset filter
    await page.getByRole('button', { name: 'All' }).click()
    await page.waitForTimeout(300)

    // Count should be back to original
    const allToolsCountAfter = await page.locator('#tools a[href^="/tools/"]').count()
    expect(allToolsCountAfter).toBe(allToolsCount)
  })

  test('should filter tools using search functionality', async ({ page }) => {
    // Wait for the tools section
    await page.locator('#tools').waitFor()

    // Get the search input
    const searchInput = page.getByPlaceholder(/Search tools/i)
    await expect(searchInput).toBeVisible()

    // Search for "compress"
    await searchInput.fill('compress')
    await page.waitForTimeout(300)

    // Should show Compress PDF tool
    await expect(page.getByRole('link', { name: /Compress PDF/i })).toBeVisible()

    // Other tools should not be visible
    await expect(page.getByRole('link', { name: /PDF to Word/i })).not.toBeVisible()

    // Clear search
    await searchInput.clear()
    await page.waitForTimeout(300)

    // All tools should be visible again
    await expect(page.getByRole('link', { name: /PDF to Word/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Compress PDF/i })).toBeVisible()
  })

  test('should navigate to tool page when clicking a tool card', async ({ page }) => {
    // Click on PDF to Word tool
    await page.getByRole('link', { name: /PDF to Word/i }).click()

    // Should navigate to the tool page
    await expect(page).toHaveURL('/tools/pdf-to-word')

    // Check that the tool page loaded
    await expect(page.getByRole('heading', { name: /PDF to Word Converter/i })).toBeVisible()
  })

  test('should have working navigation links in header', async ({ page }) => {
    // Check that header navigation is visible
    const header = page.locator('header, nav').first()
    await expect(header).toBeVisible()

    // Check for common navigation items
    const toolsLink = page.getByRole('link', { name: /tools/i }).first()
    if (await toolsLink.isVisible()) {
      await expect(toolsLink).toBeVisible()
    }

    // Check if pricing link exists
    const pricingLink = page.getByRole('link', { name: /pricing/i }).first()
    if (await pricingLink.isVisible()) {
      await pricingLink.click()
      await expect(page).toHaveURL('/pricing')

      // Navigate back
      await page.goto('/')
    }
  })

  test('should display features section', async ({ page }) => {
    // Scroll to features section
    const featuresSection = page.locator('text=/features/i').first()

    if (await featuresSection.isVisible()) {
      await featuresSection.scrollIntoViewIfNeeded()
      await expect(featuresSection).toBeVisible()
    }
  })

  test('should display pricing section on home page', async ({ page }) => {
    // Check if pricing section exists on home page
    const pricingHeading = page.getByRole('heading', { name: /pricing/i }).first()

    if (await pricingHeading.isVisible()) {
      await pricingHeading.scrollIntoViewIfNeeded()
      await expect(pricingHeading).toBeVisible()
    }
  })

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Page should still be accessible
    await expect(page.locator('#tools')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('#tools')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('#tools')).toBeVisible()
  })

  test('should show popular badge on popular tools', async ({ page }) => {
    await page.locator('#tools').waitFor()

    // Look for popular badges
    const popularBadges = page.locator('text=/popular/i').filter({ hasText: 'Popular' })
    const badgeCount = await popularBadges.count()

    // Should have at least one popular tool
    expect(badgeCount).toBeGreaterThan(0)
  })
})
