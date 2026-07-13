import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'
import {
  seedTestUser,
  cleanupTestUser,
  testUser,
  managerUser,
  creatorUser,
} from '../helpers/seedUser'

test.describe('Admin Panel — Admin role', () => {
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
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can open Posts collection', async () => {
    await page.goto('http://localhost:3000/admin/collections/posts')
    await expect(page).toHaveURL('http://localhost:3000/admin/collections/posts')
    await expect(page.locator('h1', { hasText: 'Posts' }).first()).toBeVisible()
  })

  test('can open Projects collection', async () => {
    await page.goto('http://localhost:3000/admin/collections/projects')
    await expect(page.locator('h1', { hasText: 'Projects' }).first()).toBeVisible()
  })

  test('can manage Users', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    await expect(page.locator('h1', { hasText: 'Users' }).first()).toBeVisible()
  })
})

test.describe('Admin Panel — Manager role', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: managerUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can open Posts but not Users nav', async () => {
    await page.goto('http://localhost:3000/admin/collections/posts')
    await expect(page.locator('h1', { hasText: 'Posts' }).first()).toBeVisible()

    await page.goto('http://localhost:3000/admin/collections/users')
    // Users collection is hidden for non-admins; expect redirect or forbidden/empty
    await expect(page).not.toHaveURL(/\/admin\/collections\/users$/)
  })
})

test.describe('Admin Panel — Creator role', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()
    const context = await browser.newContext()
    page = await context.newPage()
    await login({ page, user: creatorUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('can open Posts create view', async () => {
    await page.goto('http://localhost:3000/admin/collections/posts/create')
    await expect(page.locator('input[name="title"]').first()).toBeVisible({ timeout: 15000 })
  })
})
