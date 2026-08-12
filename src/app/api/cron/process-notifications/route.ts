import config from '@payload-config'
import { getPayload } from 'payload'
import { processNotifications } from '@/lib/notifications'
import { processAdminNotifications } from '@/lib/admin-notification-delivery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const payload = await getPayload({ config })
  const result = await processNotifications(payload, { limit: 50 })
  const staffAlerts = await processAdminNotifications(payload, { limit: 50 })
  return Response.json({ ok: true, ...result, staffAlerts })
}
