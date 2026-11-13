import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const vite = await createServer({
  appType: 'custom',
  server: { middlewareMode: true },
})

after(() => vite.close())

const { RetryButton } = await vite.ssrLoadModule(
  '/src/shared/components/retry-button/index.jsx',
)
const { getCouponStatus } = await vite.ssrLoadModule(
  '/src/features/dashboard/CouponsWorkspace/couponDisplay.js',
)
const { default: CouponDateRangeFields } = await vite.ssrLoadModule(
  '/src/features/dashboard/CouponsWorkspace/CouponDateRangeFields.jsx',
)
const { invalidateOrderViews } = await vite.ssrLoadModule(
  '/src/entities/order/api/order.cache.js',
)

test('RetryButton shows a usable retry action', () => {
  const html = renderToStaticMarkup(createElement(RetryButton))
  assert.match(html, /class="retry-button"/)
  assert.match(html, /Try again/)
  assert.match(html, /aria-busy="false"/)
  assert.doesNotMatch(html, /disabled=""/)
})

test('RetryButton announces and disables an in-flight retry', () => {
  const html = renderToStaticMarkup(
    createElement(RetryButton, { loading: true }),
  )
  assert.match(html, /Trying again…/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /disabled=""/)
})


test('coupon status prioritizes inactivity and checks date and usage limits', () => {
  const now = Date.now()
  const active = {
    isActive: true,
    startsAt: null,
    expiresAt: null,
    usageLimit: null,
    usageCount: 0,
  }
  assert.deepEqual(getCouponStatus({ ...active, isActive: false }), {
    label: 'Inactive',
    tone: 'neutral',
  })
  assert.equal(
    getCouponStatus({
      ...active,
      startsAt: new Date(now + 60_000).toISOString(),
    }).label,
    'Scheduled',
  )
  assert.equal(
    getCouponStatus({
      ...active,
      expiresAt: new Date(now - 60_000).toISOString(),
    }).label,
    'Expired',
  )
  assert.equal(
    getCouponStatus({ ...active, usageLimit: 2, usageCount: 2 }).label,
    'Exhausted',
  )
  assert.equal(getCouponStatus(active).label, 'Active')
})

test('coupon date fields render accessible labels and preserve selected dates', () => {
  const html = renderToStaticMarkup(
    createElement(CouponDateRangeFields, {
      startsAt: '2026-11-10T00:00',
      expiresAt: '2026-11-30T23:59:59.999',
      onChange: () => {},
    }),
  )

  assert.match(html, /aria-label="Coupon start date"/)
  assert.match(html, /aria-label="Coupon expiry date"/)
  assert.match(html, /value="2026-11-10"/)
  assert.match(html, /value="2026-11-30"/)
})

test('order updates invalidate lists, metrics, analytics, and both detail views', async () => {
  const keys = []
  const client = {
    invalidateQueries: async ({ queryKey }) => {
      keys.push(queryKey)
    },
  }
  await invalidateOrderViews(client, 'order-1')
  assert.deepEqual(keys, [
    ['orders', 'list'],
    ['orders', 'admin', 'list'],
    ['orders', 'admin', 'metrics'],
    ['orders', 'admin', 'analytics'],
    ['orders', 'order-1'],
    ['orders', 'admin', 'detail', 'order-1'],
  ])
})

test('return updates preserve order metrics while refreshing lists and details', async () => {
  const keys = []
  await invalidateOrderViews(
    {
      invalidateQueries: async ({ queryKey }) => keys.push(queryKey),
    },
    'order-1',
    { metrics: false },
  )
  assert.deepEqual(keys, [
    ['orders', 'list'],
    ['orders', 'admin', 'list'],
    ['orders', 'order-1'],
    ['orders', 'admin', 'detail', 'order-1'],
  ])
})
