import log from 'electron-log'

const CONSOLE_LOGGER = {
  info: (...args) => {
    log.info(args[0], {
      extraArgs: args.slice(1),
    })
  },
  warn: (...args) => {
    log.warn(args[0], {
      extraArgs: args.slice(1),
    })
  },
  error: (...args) => {
    log.error(args[0], {
      extraArgs: args.slice(1),
    })
  },
}

const LOGGER = CONSOLE_LOGGER

export const logger = {
  info: (...args) => {
    LOGGER.info(args[0], {
      extraArgs: args.slice(1),
    })
  },
  warn: (...args) => {
    LOGGER.warn(args[0], {
      extraArgs: args.slice(1),
    })
  },
  error: (...args) => {
    LOGGER.error(args[0], {
      extraArgs: args.slice(1),
    })
  },
}
