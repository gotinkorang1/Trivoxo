import { expect, test } from '@playwright/test'

test.describe('Trivoxo frontend', () => {
  test('publishes hardened headers and reachable social-sharing images', async ({ page, request }) => {
    const response = await page.goto('http://localhost:3000')
    expect(response?.status()).toBe(200)

    const csp = response?.headers()['content-security-policy'] ?? ''
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain('https://challenges.cloudflare.com')
    expect(response?.headers()['x-content-type-options']).toBe('nosniff')
    expect(response?.headers()['cross-origin-opener-policy']).toBe('same-origin-allow-popups')
    expect(response?.headers()['critical-ch']).toBeUndefined()

    const adminResponse = await request.get('http://localhost:3000/admin/login')
    expect(adminResponse.headers()['critical-ch']).toBe('Sec-CH-Prefers-Color-Scheme')

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBe('http://localhost:3000')

    const generatedImage = await page.locator('meta[property="og:image"]').first().getAttribute('content')
    expect(generatedImage).toBeTruthy()
    const generatedResponse = await request.get(generatedImage!)
    expect(generatedResponse.status()).toBe(200)
    expect(generatedResponse.headers()['content-type']).toContain('image/png')

    const stableFallback = await request.get('http://localhost:3000/og')
    expect(stableFallback.status()).toBe(200)
    expect(stableFallback.headers()['content-type']).toContain('image/png')
  })

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

  test('connects homepage destination, date and traveller search to discovery', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000')
    const date = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    await page.getByLabel('Where do you want to go?').fill('Accra')
    await page.getByLabel('When?').fill(date)
    await page.getByLabel('Travellers').selectOption('2')
    await page.getByRole('button', { name: 'Find experiences' }).click()

    await expect(page).toHaveURL(new RegExp(`destination=Accra.*date=${date}.*travellers=2`))
    await expect(page.getByText('Date pattern checked for')).toBeVisible()
    await expect(page.getByText('Suitable for')).toBeVisible()
    await expect(page.getByRole('link', { name: /The Capital Pulse Tour/ })).toBeVisible()
  })

  test('archives ended events and does not present them as upcoming tickets', async ({ page }) => {
    await page.goto('http://localhost:3000/events')

    await expect(page.getByText('New event dates are being planned.')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Past Trivoxo moments' })).toBeVisible()
    await page.getByRole('link', { name: /Hike and Chill/ }).click()

    await expect(page.getByText('Past event').first()).toBeVisible()
    await expect(page.getByText('This event has ended.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ask about this event' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Add one/ })).toHaveCount(0)
  })

  test('guides a corporate enquiry from brief to review', async ({ page }) => {
    await page.goto('http://localhost:3000/corporate')

    await expect(
      page.getByRole('heading', { name: 'Bring your team somewhere memorable' }),
    ).toBeVisible()
    await page.getByLabel('Event or experience type').selectOption('corporate-retreat')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('heading', { name: 'Shape the experience' })).toBeVisible()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByLabel('Your name').fill('Ama Mensah')
    await page.getByLabel('Email').fill('ama@example.com')
    await page.getByLabel('Phone or WhatsApp').fill('0593962111')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('heading', { name: 'Review your brief' })).toBeVisible()
    await expect(page.locator('dd').getByText('Corporate Retreat', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send proposal request' })).toBeVisible()
  })
})
