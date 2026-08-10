import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import { seedTestUser, cleanupTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin Panel', () => {
  test.describe.configure({ mode: 'serial', timeout: 60_000 })

  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.getByRole('heading', {
      name: /Good (morning|afternoon|evening)/,
    })
    await expect(dashboardArtifact).toBeVisible()
    await expect(page.getByRole('region', { name: 'Business overview' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Quick actions' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Revenue & booking trend' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Booking sources' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Recent bookings' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Upcoming departures' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Needs attention' })).toBeVisible()

    const sevenDayPeriod = page.getByRole('link', { name: '7 days' })
    await expect(sevenDayPeriod).toHaveAttribute('href', '/admin?period=7')
    await page.waitForTimeout(1_000)
    await sevenDayPeriod.click()
    await expect(page).toHaveURL('http://localhost:3000/admin?period=7', { timeout: 15_000 })
    await expect(page.getByRole('link', { name: '7 days' })).toHaveAttribute('aria-current', 'page')
  })

  test('dashboard branding and controls remain usable on mobile', async () => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('http://localhost:3000/admin?period=30', {
      waitUntil: 'domcontentloaded',
    })

    await expect(page.locator('.tvx-admin-icon')).toBeVisible()
    await expect(page.locator('.tvx-section-heading__icon')).toHaveCount(7)
    await expect(page.getByRole('heading', { name: 'Quick actions' })).toBeVisible()
    await expect(page.locator('.tvx-stat-card').first()).toBeVisible()
    await expect(page.getByText('Operations pulse')).toBeVisible()
    await expect(page.getByText('Live database')).toBeVisible()

    const hasHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    )
    expect(hasHorizontalOverflow).toBe(false)
    await page.waitForTimeout(1_000)

    const mobileNav = page.locator('.nav')
    const mobileNavClasses = await mobileNav.getAttribute('class')
    if (!mobileNavClasses?.includes('nav--nav-open')) {
      await page.locator('.template-default__nav-toggler').click()
    }
    await expect(mobileNav).toHaveClass(/nav--nav-open/)
    const bookingsNavLink = mobileNav.getByRole('link', { name: 'Bookings', exact: true })
    await expect(bookingsNavLink).toBeVisible()
    await expect(bookingsNavLink).toHaveAttribute('href', '/admin/collections/bookings')

    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page).toHaveURL(/^http:\/\/localhost:3000\/admin\/collections\/users(?:\?.*)?$/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can navigate to edit view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users/create')
    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
