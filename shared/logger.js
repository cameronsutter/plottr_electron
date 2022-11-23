import { makeMainProcessClient } from '../src/app/mainProcessClient'

const { logInfo, logWarn, logError } = makeMainProcessClient()

const logger = {
  info: (...args) => {
    return logInfo(
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
    return logWarn(
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
    return logError(
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
