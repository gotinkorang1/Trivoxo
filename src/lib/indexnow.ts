import type { CollectionAfterChangeHook } from 'payload'

/**
 * IndexNow — instantly tell participating engines (Bing, Yandex, Seznam, Naver)
 * that a URL changed, instead of waiting for a crawl. No-op until INDEXNOW_KEY
 * is set, and never throws, so it can't affect a save.
 */
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const KEY_PATH = '/indexnow-key.txt'

function indexNowConfig(): { key: string; base: string } | null {
  const key = process.env.INDEXNOW_KEY
  const base = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/$/, '')
  // Only submit real, public URLs.
  if (!key || !base || base.includes('localhost')) return null
  return { key, base }
}

/** Fire-and-forget submission of one or more site paths (e.g. '/experiences/x'). */
export function pingIndexNow(paths: string[]): void {
  const cfg = indexNowConfig()
  if (!cfg || paths.length === 0) return
  let host: string
  try {
    host = new URL(cfg.base).host
  } catch {
    return
  }
  const body = {
    host,
    key: cfg.key,
    keyLocation: `${cfg.base}${KEY_PATH}`,
    urlList: paths.map((p) => `${cfg.base}${p}`),
  }
  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  }).catch((error) => {
    console.error('IndexNow submission failed', error)
  })
}

/**
 * afterChange hook that submits a document's public URL to IndexNow once it is
 * published. `pathFor` maps the document's slug to its public path.
 */
export function indexNowOnPublish(pathFor: (slug: string) => string): CollectionAfterChangeHook {
  return ({ doc }) => {
    const record = doc as { _status?: string; slug?: string } | null
    // Draft-enabled collections only ping when the live version is published.
    if (record?._status && record._status !== 'published') return doc
    if (record?.slug) pingIndexNow([pathFor(record.slug)])
    return doc
  }
}
