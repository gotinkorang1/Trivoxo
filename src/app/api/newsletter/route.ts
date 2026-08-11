import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  checkRateLimit,
  rateLimitResponseHeaders,
} from '@/lib/rate-limit'

/**
 * Newsletter subscription (§23). Accepts the homepage footer/hero form post,
 * upserts a subscriber, and redirects back. Best-effort: if the DB is
 * unreachable we still redirect rather than error the user's browser.
 */
export async function POST(request: Request) {
  const home = new URL('/', request.url)

  let email: string | null = null
  try {
    const form = await request.formData()
    email = String(form.get('email') ?? '').trim().toLowerCase()
  } catch {
    // ignore malformed body
  }

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    home.searchParams.set('newsletter', 'invalid')
    return NextResponse.redirect(home, { status: 303 })
  }

  const rateLimit = await checkRateLimit('newsletterSubscribe', request.headers)
  if (!rateLimit.allowed) {
    home.searchParams.set('newsletter', 'limited')
    return NextResponse.redirect(home, {
      status: 303,
      headers: rateLimitResponseHeaders(rateLimit),
    })
  }

  try {
    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'newsletter-subscribers',
      where: { email: { equals: email } },
      limit: 1,
    })
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'newsletter-subscribers',
        data: { email, source: 'homepage', active: true },
      })
    }
    home.searchParams.set('newsletter', 'ok')
  } catch (err) {
    console.error('Newsletter subscribe failed', err)
    home.searchParams.set('newsletter', 'error')
  }

  return NextResponse.redirect(home, {
    status: 303,
    headers: rateLimitResponseHeaders(rateLimit),
  })
}
