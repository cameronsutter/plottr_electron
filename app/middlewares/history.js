import deep from 'deep-diff'

const history = store => next => action => {
  var before = store.getState()
  const result = next(action)
  if (action.type !== 'FILE_LOADED') {
    var after = store.getState()
    var diff = deep.diff(before, after)

    if (diff) {
      // look for dirty file diffs
      diff = diff.filter((d) => {
        return !(d.path[0] === 'file' && d.path[1] === 'dirty')
      })
      if (diff.length > 0) {
        var historyList = JSON.parse(window.localStorage.getItem('history')) || []
        historyList.unshift({action: action, diff: diff, before: before, after: after})
        // console.log(historyList)

        window.localStorage.setItem('history', JSON.stringify(historyList.slice(0, 10)))
      }
    }
  } else {
    // window.localStorage.setItem('history', JSON.stringify([]))
  }

  return result
}

export default history
