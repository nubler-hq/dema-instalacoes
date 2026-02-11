import { Igniter } from '@igniter-js/core'
import type { IgniterAppContext } from "./igniter.context"
import { logger } from "@/services/logger"
import { database } from "@/services/database"
import { telemetry } from "@/services/telemetry"

/**
 * @description Initialize the Igniter.js
 * @see https://github.com/felipebarcelospro/igniter-js
 */
export const igniter = Igniter
  .context<IgniterAppContext>()
  .logger(logger)
  .telemetry(telemetry)
  .create()
