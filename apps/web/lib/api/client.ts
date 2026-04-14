import { demoFetch } from '@/lib/demo-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api'
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === '1'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (DEMO_MODE) {
    return demoFetch<T>(path, init)
  }

  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const errorBody = (await response.json()) as { message?: string }
      message = errorBody.message ?? message
    } catch {
      message = response.statusText || message
    }

    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
