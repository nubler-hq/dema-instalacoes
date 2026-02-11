import { igniter } from '@/igniter'
import { exampleController } from '@/features/example'

/**
 * @description Main application router configuration
 * @see https://github.com/felipebarcelospro/igniter-js
 */
export const AppRouter = igniter.router({
  baseURL: process.env.NEXT_PUBLIC_IGNITER_APP_URL || 'http://localhost:3000',
  basePATH: process.env.NEXT_PUBLIC_IGNITER_APP_BASE_PATH || '/api/v1',
  controllers: {
    example: exampleController
  }
})

export type AppRouter = typeof AppRouter
