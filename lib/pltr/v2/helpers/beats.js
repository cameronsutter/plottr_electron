import { t as i18n } from 'plottr_locales'
import { beat } from '../store/initialState'
import { isSeries as isSeriesString } from './books'
import * as tree from '../reducers/tree'

export function beatOneIsPrologue(sortedBookBeats) {
  return sortedBookBeats[0].title == i18n('Prologue')
}

export function beatTitle(beat, offset) {
  if (isSeries(beat)) {
    return beat.title == 'auto'
      ? i18n('Beat {number}', { number: beat.position + offset + 1 })
      : beat.title
  } else {
    return beat.title == 'auto'
      ? i18n('Chapter {number}', { number: beat.position + offset + 1 })
      : beat.title
  }
}

export function editingBeatLabel(beat, offset, isSeries) {
  if (isSeries) {
    return i18n('Beat {number} title', { number: beat.position + offset + 1 })
  } else {
    return i18n('Chapter {number} title', { number: beat.position + offset + 1 })
  }
}

export function beatPositionTitle(beat, offset, isSeries) {
  if (isSeries) {
    return i18n('Beat {number}', { number: beat.position + offset + 1 })
  } else {
    return i18n('Chapter {number}', { number: beat.position + offset + 1 })
  }
}

export function insertBeat(position, beats, newId, bookId) {
  var newBeat = Object.assign({}, beat, { id: newId, bookId: bookId })

  beats.splice(position, 0, newBeat)
  return beats
}

export function isSeries({ bookId }) {
  return isSeriesString(bookId)
}

export const nextId = (beats) =>
  Object.values(beats)
    .flatMap((book) => tree.nextId('id')(book))
    .reduce((maxId, id) => Math.max(id - 1, maxId), 0) + 1
