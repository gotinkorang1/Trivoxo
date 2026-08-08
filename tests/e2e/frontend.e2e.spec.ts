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
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  test('selects a tour date and carries it into the guided booking flow', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/capital-pulse-tour')

    await expect(
      page.getByRole('heading', { name: 'The Capital Pulse Tour', level: 1 }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Choose your preferred date' })).toBeVisible()

    const selectedDate = page.locator('button[aria-pressed="true"]')
    await expect(selectedDate).toBeVisible()
    const selectedIsoDate = await page
      .getByRole('link', { name: 'Request this date' })
      .getAttribute('href')
    expect(selectedIsoDate).toMatch(/\/book\?date=\d{4}-\d{2}-\d{2}$/)

    await page.getByRole('link', { name: 'Request this date' }).click()
    await expect(page.getByRole('heading', { name: 'Trip essentials' })).toBeVisible()
    await expect(page.getByLabel('Preferred date')).not.toHaveValue('')

    await page.getByLabel('Adults').selectOption('3')
    await expect(page.getByText('10% group saving applied')).toBeVisible()
    await page.getByRole('button', { name: 'Continue to your details' }).click()

    await page.getByLabel('First name').fill('Ama')
    await page.getByLabel('Last name').fill('Mensah')
    await page.getByLabel('Email address').fill('ama@example.com')
    await page.getByLabel('Phone / WhatsApp').fill('0593962111')
    await page.getByRole('button', { name: 'Review your request' }).click()

    await expect(page.getByRole('heading', { name: 'Review your request' })).toBeVisible()
    await expect(page.getByText('GHS 3,780').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit trip' })).toBeVisible()
  })

  test('keeps the primary booking action visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000/experiences/capital-pulse-tour')

    await expect(page.getByRole('link', { name: 'Request to book' })).toBeVisible()

    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    await page.goto(`http://localhost:3000/experiences/capital-pulse-tour/book?date=${date}`)
    await expect(page.getByRole('button', { name: 'Continue', exact: true })).toBeVisible()
    await expect(page.getByText('2 travellers').first()).toBeVisible()
  })
})
