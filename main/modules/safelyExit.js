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
    logger.info('Socket server is not busy.  Quitting Plottr now!')
    app.quit()
    return true
  }

  const quitWhenDone = () => {
    const attemptToQuit = () => {
      if (!quit()) {
        setTimeout(attemptToQuit, 5000)
      }
    }
    attemptToQuit()
  }

  return {
    busy,
    done,
    quit,
    quitWhenDone,
  }
}

export default makeSafelyExitModule
