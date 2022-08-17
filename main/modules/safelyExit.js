import { app } from 'electron'

const makeSafelyExitModule = (logger) => {
  let isBusy = false

  const busy = () => {
    isBusy = true
  }

  const done = () => {
    isBusy = false
  }

  const quit = () => {
    if (isBusy) {
      logger.warn(
        'Quit requested, but the socket server indicated that it was busy and has not indicated that it is done yet.'
      )
      return false
    }
    app.quit()
    return true
  }

  return {
    busy,
    done,
    quit,
  }
}

export default makeSafelyExitModule
