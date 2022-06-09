import { DateTime } from 'luxon'

// If there were too many failures in the last ten seconds, then back
// off from logging them and use the console logger instead.
const FAILURE_WINDOW = 10000
const MAX_FAILURES_IN_WINDOW = 5

// TODO: maybe back off on too many requests as well?
export const makeErrorWindow = (name) => {
  let failureWindow = []

  const cleanWindow = () => {
    const tenSecondsAgo = DateTime.now().minus({ seconds: FAILURE_WINDOW }).toSeconds()
    failureWindow = failureWindow.filter(({ timeStamp }) => timeStamp < tenSecondsAgo)
  }

  const fail = () => {
    failureWindow.push({ timeStamp: DateTime.now().toSeconds() })
  }

  const failedTooMuchRecently = () => {
    return failureWindow.length > MAX_FAILURES_IN_WINDOW
  }

  const withErrorWindow = (f) => {
    cleanWindow()
    if (failedTooMuchRecently()) {
      console.error(`Tried ${name}.  But it's failed too much recently.  Falling back to console.`)
      return null
    }
    try {
      return f()
    } catch (error) {
      fail()
      console.error(
        'Failed to perform a error-window controlled action.  Falling back to the console.',
        error
      )
      return null
    }
  }

  return withErrorWindow
}
