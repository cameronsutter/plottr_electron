import log from 'electron-log'

const logger = {
  info: (...args) => {
    log.info(
      args[0],
      JSON.stringify(
        {
          extraArgs: args.slice(1),
        },
        null,
        2
      )
    )
  },
  warn: (...args) => {
    log.warn(
      args[0],
      JSON.stringify(
        {
          extraArgs: args.slice(1),
        },
        null,
        2
      )
    )
  },
  error: (...args) => {
    log.error(
      args[0],
      JSON.stringify(
        {
          extraArgs: args.slice(1),
        },
        null,
        2
      )
    )
  },
}

export default logger
