const sequencePromises = (promiseThunks) => {
  function iter(thunks, acc) {
    if (thunks.length <= 0) {
      return Promise.resolve(acc)
    }

    const currentThunk = thunks[0]
    const remaining = thunks.slice(1)
    return currentThunk().then((result) => {
      return iter(remaining, [result, ...acc])
    })
  }

  return iter(promiseThunks, [])
}

module.exports = { sequencePromises }
