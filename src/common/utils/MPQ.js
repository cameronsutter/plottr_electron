import mixpanel from 'mixpanel-browser'
import { USER } from '../../file-system/stores'
import log from 'electron-log'
import { helpers } from 'pltr/v2'

const {
  beats: { reduce },
} = helpers

const superProps = { platform: process.platform }

let daysLeft
let isTrial = false
export function setTrialInfo(isTrialMode, num) {
  isTrial = isTrialMode
  daysLeft = num
}

class MixpanelQueue {
  queue = []

  projectEventStats(event, basicAttrs = {}, state) {
    if (!event || process.env.NODE_ENV == 'development') return
    if (!USER.get('payment_id')) return

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
  }

  push(event, attrs = {}) {
    if (!event || process.env.NODE_ENV == 'development') return
    if (!USER.get('payment_id')) return

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
  }

  flush() {
    if (process.env.NODE_ENV == 'development') return

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
