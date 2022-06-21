import logger from '../../../shared/logger'

// Note: back off is in milliseconds.
//
// By default max backoff is two minutes.  i.e. the last attempt will
// wait two minutes before trying again.
export const retryWithBackOff = (
  thunk,
  log = logger,
  maxAttempts = 8,
  initialBackOffLength = 500
) => {
  let backOffInterval = initialBackOffLength
  let attemptsSoFar = 0
  function attempt() {
    return thunk().catch((error) => {
      ++attemptsSoFar
      log.warn(`Attempted an effect ${attemptsSoFar} times and it's just failed again`)
      if (attemptsSoFar > maxAttempts) {
        return Promise.reject(new Error(`Failed effect after ${maxAttempts} attempts`))
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          backOffInterval *= 2
          attempt().then(resolve, reject)
        }, backOffInterval)
      })
    })
  }
  return attempt()
}
