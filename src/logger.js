const CONSOLE_LOGGER = {
  info: (...args) => {
    console.log(args[0], {
      extraArgs: args.slice(1),
    })
  },
  warn: (...args) => {
    console.warn(args[0], {
      extraArgs: args.slice(1),
    })
  },
  error: (...args) => {
    console.error(args[0], {
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
