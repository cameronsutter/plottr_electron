import mixpanel from 'mixpanel-browser'
import { screen } from 'electron'

export function storageKey (fileName) {
  let index = fileName.lastIndexOf('/') + 1
  let name = fileName.substr(index).replace(/\s/g, '_').replace('.pltr', '')
  return `history-${name}`
}

let dayOfTrial
export function setDayOfTrial (num) {
  dayOfTrial = num
}

class MixpanelQueue {
  constructor () {
    var size = screen.getPrimaryDisplay().size
    this.queue = []
    this.superProps = {
      arch: process.arch,
      platform: process.platform,
      screen_size: `${size.width}x${size.height}`,
    }
  }

  push (event, attrs={}) {
    // TODO: save to localStorage
    let allAttrs = {
      ...attrs
      online: navigator.onLine,
      day_of_trial: dayOfTrial,
    }
    this.queue.push({title: event, attributes: allAttrs})
    if (navigator.onLine) {
      this.flush()
    }
  }

  flush () {
    // TODO: read from localStorage
    do {
      let event = this.queue.shift()
      if (event && process.env.NODE_ENV !== 'dev') {
        var attrs = Object.assign({}, event.attributes, this.superProps)
        mixpanel.track(event.title, attrs)
      }
    } while (this.queue.length > 0)
  }
}

export const MPQ = new MixpanelQueue()

window.addEventListener('online',  MPQ.flush.bind(MPQ))
