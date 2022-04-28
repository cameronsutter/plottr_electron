export const logger = {
  info: (...args) => {
    console.log('[Socket Server]: ', ...args)
  },
  warn: (...args) => {
    console.warn('[Socket Server]: ', ...args)
  },
  error: (...args) => {
    console.error('[Socket Server]: ', ...args)
  },
}
