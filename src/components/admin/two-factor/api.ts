'use client'

/** Whether 2FA login enforcement is switched on (mirrors the server flag). */
export const TWO_FACTOR_ENFORCED = process.env.NEXT_PUBLIC_TWO_FACTOR_ENFORCED === 'true'

const API_BASE = '/api/two-factor'

export type ApiResult<T = Record<string, unknown>> = {
  ok: boolean
  status: number
  data: T & { error?: string; status?: string }
}

export async function callTwoFactor<T = Record<string, unknown>>(
  path: string,
  body?: Record<string, unknown>,
): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body ?? {}),
  })
  let data: ApiResult<T>['data']
  try {
    data = (await res.json()) as ApiResult<T>['data']
  } catch {
    data = {} as ApiResult<T>['data']
  }
  return { ok: res.ok, status: res.status, data }
}
