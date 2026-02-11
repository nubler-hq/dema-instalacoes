import { igniter } from '@/igniter'
import { z } from 'zod'

/**
 * @description Example controller demonstrating Igniter.js features
 * @see https://github.com/felipebarcelospro/igniter-js
 */
export const exampleController = igniter.controller({
  path: '/example',
  actions: {
    // Health check action
    health: igniter.query({
      path: '/',
      handler: async ({ request, response, context }) => {
        context.logger.info('Health check requested')
        return response.success({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          features: {
            store: false,
            jobs: false,
            mcp: false,
            logging: true
          }
        })
      }
    })
  }
})
