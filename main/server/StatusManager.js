import { v4 as uuid } from 'uuid'

import { BUSY, DONE } from '../../shared/socket-server-message-types'

class StatusManager {
  activeConnections = new Set()
  tasks = []
  logger = {
    info: () => {},
    warn: () => {},
    error: () => {},
  }

  constructor(logger) {
    this.logger = logger
  }

  acceptConnection(webSocket) {
    this.activeConnections.add(webSocket)
  }

  registerTask(work) {
    this.notifyBusy()
    work.then(() => {
      this.tasks = this.tasks.filter((otherTask) => {
        return otherTask !== work
      })
      if (this.tasks.length === 0) {
        this.notifyDone()
      }
    })
  }

  broadcast(message) {
    this.activeConnections.forEach((connection) => {
      try {
        connection.send(
          JSON.stringify({ type: message, payload: {}, messageId: uuid(), result: null })
        )
      } catch (error) {
        this.logger.error(
          `Removing a connection from the status manager because it errored out with`,
          error
        )
        this.activeConnections.delete(connection)
      }
    })
  }

  notifyBusy() {
    this.broadcast(BUSY)
  }

  notifyDone() {
    this.broadcast(DONE)
  }
}

export default StatusManager
