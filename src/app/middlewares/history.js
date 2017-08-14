import deep from 'deep-diff'
import { storageKey } from './helpers'
import { FILE_LOADED, RESET, NEW_FILE, CHANGE_CURRENT_VIEW, CHANGE_ORIENTATION } from 'constants/ActionTypes'

const BLACKLIST = [FILE_LOADED, NEW_FILE, CHANGE_CURRENT_VIEW, RESET, CHANGE_ORIENTATION]
const CLEARHISTORY = [FILE_LOADED, NEW_FILE]

const history = store => next => action => {
  var before = store.getState()
  var key = storageKey(before.file.fileName)
  const result = next(action)

  if (BLACKLIST.indexOf(action.type) === -1) {
    var after = store.getState()
    var diff = deep.diff(before, after)

    if (diff) {
      // look for dirty file diffs
      diff = diff.filter((d) => {
        return !(d.path[0] === 'file' && d.path[1] === 'dirty')
      })
      if (diff.length > 0) {
        var historyList = JSON.parse(window.localStorage.getItem(key)) || []
        historyList.push({id: nextId.id(), action: action, diff: diff, before: before, after: after})
        window.localStorage.setItem(key, JSON.stringify(historyList.slice(-15)))
      }
    }
  }

  if (CLEARHISTORY.indexOf(action.type) !== -1) {
    window.localStorage.setItem(key, JSON.stringify([]))
  }

  return result
}

function NextId () {
  var nextId = 0
  this.id = function () {
    return nextId++
  }
}
var nextId = new NextId()

export default history
