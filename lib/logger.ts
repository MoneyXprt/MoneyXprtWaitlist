// lib/logger.ts
// Isomorphic logger: lightweight on client, structured logs on server.
import { env } from '@/lib/config/env'

type Meta = Record<string, unknown> | undefined

const isServer = typeof window === 'undefined'

function safeMeta(meta: Meta) {
  if (!meta) return undefined
  try {
    // Avoid circular structures
    JSON.stringify(meta)
    return meta
  } catch {
    return { note: 'meta not serializable' }
  }
}

function serverLog(level: 'info'|'warn'|'error'|'debug', msg: string, meta?: Meta) {
  const line = JSON.stringify({
    level,
    msg,
    ts: new Date().toISOString(),
    ...safeMeta(meta),
  })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else if (level === 'debug') console.debug(line)
  else console.log(line)
}

function clientLog(level: 'info'|'warn'|'error'|'debug', msg: string, meta?: Meta) {
  const args = meta ? [msg, meta] : [msg]
  if (level === 'error') console.error(...args)
  else if (level === 'warn') console.warn(...args)
  else if (level === 'debug') console.debug(...args)
  else console.info(...args)
}

const log = {
  info: (msg: string, meta?: Meta) => (isServer ? serverLog('info', msg, meta) : clientLog('info', msg, meta)),
  warn: (msg: string, meta?: Meta) => (isServer ? serverLog('warn', msg, meta) : clientLog('warn', msg, meta)),
  error: (msg: string, meta?: Meta) => (isServer ? serverLog('error', msg, meta) : clientLog('error', msg, meta)),
  debug: (msg: string, meta?: Meta) => (isServer ? serverLog('debug', msg, meta) : clientLog('debug', msg, meta)),
}

export default log

