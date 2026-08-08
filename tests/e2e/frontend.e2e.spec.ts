import { expect, test } from '@playwright/test'

test.describe('Trivoxo frontend', () => {
  test('loads the homepage and advances the featured story', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/Trivoxo/)
    const heading = page.locator('h1').first()
    await expect(heading).toContainText('Experience Ghana')
    await expect(page.getByRole('button', { name: 'Find experiences' })).toBeVisible()

    const initialHeading = await heading.textContent()
    await page.getByRole('button', { name: 'Next featured story' }).click()
    await expect(heading).not.toHaveText(initialHeading ?? '')
  })

  test('switches theme and exposes an accessible mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000')

    const themeButton = page.getByRole('button', { name: /Switch to (light|dark) theme/ })
    await themeButton.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/)

    const menuButton = page.getByRole('button', { name: 'Open menu' })
    await menuButton.click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')
  })
})
