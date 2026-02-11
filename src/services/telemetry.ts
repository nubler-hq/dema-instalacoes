import { createTelemetryService } from '@igniter-js/core'

/**
 * Telemetry service for tracking requests and errors.
 * 
 * @remarks
 * Provides telemetry tracking with configurable options.
 * 
 * @see https://github.com/felipebarcelospro/igniter-js/tree/main/packages/core
 */
export const telemetry = createTelemetryService({
  enableTracing: process.env.IGNITER_TELEMETRY_ENABLE_TRACING === 'true',
  enableMetrics: process.env.IGNITER_TELEMETRY_ENABLE_METRICS === 'true',
  enableEvents: process.env.IGNITER_TELEMETRY_ENABLE_EVENTS === 'true',
  enableCLI: process.env.IGNITER_TELEMETRY_ENABLE_CLI_INTEGRATION === 'true',
})
