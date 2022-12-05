import mixpanel from 'mixpanel-browser'
import { helpers } from 'pltr/v2'

import log from '../../../shared/logger'
import { whenClientIsReady } from '../../../shared/socket-client/index'
import makeFileSystemAPIs from '../../api/file-system-apis'

const {
  beats: { reduce },
} = helpers

let daysLeft
let isTrial = false
export function setTrialInfo(isTrialMode, num) {
  isTrial = isTrialMode
  daysLeft = num
}

class MixpanelQueue {
  queue = []

  constructor() {
    this.fileSystemAPIs = makeFileSystemAPIs(whenClientIsReady)
  }

  projectEventStats(event, basicAttrs = {}, state) {
    if (!event || process.env.NODE_ENV == 'development') return
    this.fileSystemAPIs.currentUserSettings().then((user) => {
      if (!user.payment_id) return

      window.requestIdleCallback(() => {
        try {
          // average tags attached to cards
          // average characters attached to cards
          // average places attached to cards
          let totalTags = 0
          let totalChars = 0
          let totalPls = 0
          state.cards.forEach((c) => {
            totalTags += c.tags.length
            totalChars += c.characters.length
            totalPls += c.places.length
          })
          let numOfCards = state.cards.length

          let attrs = {
            ...basicAttrs,
            numOfCards: numOfCards,
            numOfCharacters: state.characters.length,
            numOfBeats: reduce(state.beats, (acc, _next) => acc + 1, 0),
            numOfLines: state.lines.length,
            numOfBooks: state.books.allIds.length,
            numOfCharCategories: state.categories.characters.length,
            avgTagsOnCards: totalTags / numOfCards,
            avgCharsOnCards: totalChars / numOfCards,
            avgPlsOnCards: totalPls / numOfCards,
          }

          this.push(event, attrs)
        } catch (error) {
          log.error(error)
        }
      })
    })
  }

  push(event, attrs = {}) {
    if (!event || process.env.NODE_ENV == 'development') return
    this.fileSystemAPIs.currentUserSettings().then((user) => {
      if (!user.get('payment_id')) return

      // TODO: save to localStorage
      let allAttrs = {
        ...attrs,
        online: navigator.onLine,
        days_left_of_trial: daysLeft,
        trial_mode: isTrial,
      }
      this.queue.push({ title: event, attributes: allAttrs })
      if (navigator.onLine && mixpanel.__loaded) {
        this.flush()
      }
    })
  }

  flush() {
    if (process.env.NODE_ENV == 'development') return

    const superProps = { platform: process.platform }

    // TODO: read from localStorage
    do {
      let event = this.queue.shift()
      if (event) {
        const attrs = Object.assign({}, event.attributes, superProps)
        try {
          mixpanel.track(event.title, attrs)
        } catch (error) {
          log.error(error)
        }
      }
    } while (this.queue.length > 0)
  }
}

const MPQ = new MixpanelQueue()
export default MPQ

window.addEventListener('online', () => MPQ.flush())
