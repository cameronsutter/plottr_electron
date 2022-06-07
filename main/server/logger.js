export const logger = {
  info: (...args) => {
    process.send(`[Socket Server]: ${JSON.stringify(args, null, 2)}`)
  },
  warn: (...args) => {
    process.send(`[Socket Server]: ${JSON.stringify(args, null, 2)}`)
  },
  error: (...args) => {
    console.error('[Socket Server]: ', JSON.stringify(args, null, 2))
    process.send(`[Socket Server]: ${JSON.stringify(args, null, 2)}`)
  },
}
