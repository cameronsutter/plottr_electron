import mixpanel from 'mixpanel-browser'
import { remote } from 'electron'
const screen = remote.screen

export function storageKey (fileName) {
  let index = fileName.lastIndexOf('/') + 1
  let name = fileName.substr(index).replace(/\s/g, '_').replace('.pltr', '')
  return `history-${name}`
}

let daysLeft
let isTrial
export function setTrialInfo (isTrialMode, num) {
  isTrial = isTrialMode
  daysLeft = num
}

class MixpanelQueue {
  constructor () {
    var size = screen.getPrimaryDisplay().size
    this.queue = []
    this.superProps = {
      platform: process.platform,
      screen_size: `${size.width}x${size.height}`,
    }
  }

  defaultEventStats (event, basicAttrs={}, state) {
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
  }

  push (event, attrs={}) {
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
