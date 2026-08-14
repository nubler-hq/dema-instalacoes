import { createIgniterClient } from '@igniter-js/core/client'
import { AppRouter } from '@/igniter.router'

/**
 * @description Igniter.js client for frontend usage
 * @see https://github.com/felipebarcelospro/igniter-js
 */
export const client = createIgniterClient<AppRouter>({
  baseURL: process.env.NEXT_PUBLIC_IGNITER_APP_URL || 'http://localhost:3000',
  basePATH: process.env.NEXT_PUBLIC_IGNITER_APP_BASE_PATH || '/api/v1',
  router: () => {
    return AppRouter
  }
})

export type IgniterClient = typeof client
