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

    await page.getByRole('link', { name: '7 days' }).click()
    await expect(page).toHaveURL('http://localhost:3000/admin?period=7')
    await expect(page.getByRole('link', { name: '7 days' })).toHaveAttribute('aria-current', 'page')
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
