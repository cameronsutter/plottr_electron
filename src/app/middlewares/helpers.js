import mixpanel from 'mixpanel-browser'
import USER from '../../common/utils/user_info'
import { remote } from 'electron'
const screen = remote.screen

export function storageKey (fileName) {
  let index = fileName.lastIndexOf('/') + 1
  let name = fileName.substr(index).replace(/\s/g, '_').replace('.pltr', '')
  return `history-${name}`
}

let daysLeft
let isTrial = false
export function setTrialInfo (isTrialMode, num) {
  isTrial = isTrialMode
  daysLeft = num
}

const superProps = {platform: process.platform}

class MixpanelQueue {
  queue = []

  defaultEventStats (event, basicAttrs={}, state) {
    if (!event || process.env.NODE_ENV == 'development') return
    if (!USER.get('payment_id')) return

    window.requestIdleCallback(() => {
      // average tags attached to cards
      // average characters attached to cards
      // average places attached to cards
      let totalTags = 0
      let totalChars = 0
      let totalPls = 0
      state.cards.forEach(c => {
        totalTags += c.tags.length
        totalChars += c.characters.length
        totalPls += c.places.length
      })
      let numOfCards = state.cards.length

      let attrs = {
        ...basicAttrs,
        numOfCards: numOfCards,
        numOfCharacters: state.characters.length,
        numOfChapters: state.chapters.length,
        numOfLines: state.lines.length,
        numOfBooks: state.books.allIds.length,
        zoomLevel: state.ui.zoomIndex,
        numOfCharCategories: state.categories.characters.length,
        avgTagsOnCards: totalTags / numOfCards,
        avgCharsOnCards: totalChars / numOfCards,
        avgPlsOnCards: totalPls / numOfCards,
      }

      this.push(event, attrs)
    })
  }

  push (event, attrs={}) {
    if (!event || process.env.NODE_ENV == 'development') return
    if (!USER.get('payment_id')) return

    // TODO: save to localStorage
    let allAttrs = {
      ...attrs,
      online: navigator.onLine,
      days_left_of_trial: daysLeft,
      trial_mode: isTrial,
    }
    this.queue.push({title: event, attributes: allAttrs})
    if (navigator.onLine) {
      this.flush()
    }
  }

  flush () {
    if (process.env.NODE_ENV == 'development') return

    // TODO: read from localStorage
    do {
      let event = this.queue.shift()
      if (event) {
        const attrs = Object.assign({}, event.attributes, superProps)
        mixpanel.track(event.title, attrs)
      }
    } while (this.queue.length > 0)
  }
}

export const MPQ = new MixpanelQueue()

window.addEventListener('online',  () => MPQ.flush())
