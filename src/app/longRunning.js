import { logger } from '../logger'

const handleLongTask = (entry) => {
  logger.warn(`Detected long task: ${JSON.stringify(entry)}`)
}

const handleUnknownPerformanceEntry = (entry) => {
  logger.warn(`Detected unknown performance entry: ${JSON.stringify(entry)}`)
}

const _handlePerformanceEntry = (entry) => {
  switch (entry.entryType) {
    case 'longtask': {
      handleLongTask(entry)
      break
    }
    default: {
      handleUnknownPerformanceEntry(entry)
    }
  }
}

export const instrumentLongRunningTasks = () => {
  // This ran much too slowly.  Need to rethink.
  // try {
  //   // See: https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API
  //   const observer = new PerformanceObserver(function (list) {
  //     list.getEntries().forEach((entry) => {
  //       handlePerformanceEntry(entry)
  //     })
  //   })
  //   // Wait a bit before registering the observer to let the file load.
  //   setTimeout(() => {
  //     observer.observe({ entryTypes: ['longtask'] })
  //   }, 10000)
  // } catch (error) {
  //   logger.warn('Could not register PerformanceObserver: ', error)
  // }
}
