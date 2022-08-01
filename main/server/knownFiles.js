import path from 'path'

const makeKnownFilesModule = (stores, fileModule, logger) => {
  const { knownFilesStore } = stores
  const { offlineFilesFilesPath } = fileModule

  const removeFromKnownFiles = (id) => {
    return knownFilesStore.delete(id)
  }

  const addKnownFileWithFix = (filePath) => {
    // We also don't want to track recent files that don't have a path.
    if (!filePath || filePath === '') return null

    // We don't want to track recent files when they're offline files.
    if (filePath.startsWith(offlineFilesFilesPath)) return null

    const normalisedPath = path.normalize(filePath)
    return knownFilesStore
      .currentStore()
      .then((knownFiles) => {
        const existingId = Object.keys(knownFiles).find((id) => {
          const existingPath = knownFiles[id].path
          const existingNormalisedPath = existingPath && path.normalize(existingPath)
          return existingNormalisedPath === normalisedPath
        })
        if (existingId) {
          return existingId
        } else {
          // for some reason, .size doesn't work in prod here (but it does in temp_files.js)
          // in prod, it doesn't update in time
          let newId = Math.max(...Object.keys(knownFiles).map(Number)) + 1
          // FIX UP: some people's known_files got into a bad state and this fixes that
          if (knownFilesStore.has('-Infinity')) {
            let badData = knownFilesStore.get('-Infinity')
            knownFilesStore.set('1', badData)
          }
          // and this prevents it
          if (newId < 1 || !Object.keys(knownFiles).length) {
            newId = 1
          }
          knownFilesStore.set(`${newId}`, {
            path: filePath,
            lastOpened: Date.now(),
          })
          return newId
        }
      })
      .catch((error) => {
        logger.error('Error getting the current store to add a known file', filePath)
        return Promise.reject(error)
      })
  }

  const addKnownFile = (filePath) => {
    // We also don't want to track recent files that don't have a path.
    if (!filePath || filePath === '') return

    // We don't want to track recent files when they're offline files.
    if (filePath.startsWith(offlineFilesFilesPath)) return

    knownFilesStore
      .currentStore()
      .then((files) => {
        const matches = Object.values(files)
          .filter(({ path }) => path)
          .filter((value) => path.normalize(value.path) == path.normalize(filePath))
        if (matches.length > 1) {
          logger.info(
            `Found <${matches.length}> matches for known files for path: ${filePath}.  Eliminating all but one.`
          )
          const firstMatch = Object.entries(files).find((entry) => {
            return entry[1].path === filePath
          })
          try {
            const withoutHits = Object.entries(files).reduce(
              (acc, entry) => {
                const key = entry[0]
                const value = entry[1]
                if (path.normalize(value.path) === path.normalize(filePath)) {
                  return acc
                }
                return {
                  ...acc,
                  [key]: value,
                }
              },
              {
                [firstMatch[0]]: firstMatch[1],
              }
            )
            knownFilesStore.set(withoutHits)
          } catch (error) {
            logger.error('Failed to remove file', error)
          }
        } else if (matches.length > 0) {
          const fileEntry = Object.entries(files).find(
            (entry) => path.normalize(entry[1].path) == path.normalize(filePath)
          )
          knownFilesStore.set(`${fileEntry[0]}.lastOpened`, Date.now())
        } else {
          let nextKey = Math.max(...Object.keys(files).map(Number)) + 1
          knownFilesStore.set(`${nextKey}`, {
            path: filePath,
            lastOpened: Date.now(),
          })
        }
      })
      .catch((error) => {
        logger.error('Error reading the known files store to add a known file', filePath, error)
        return Promise.reject(error)
      })
  }

  const editKnownFilePath = (oldFilePath, newFilePath) => {
    return knownFilesStore
      .currentStore()
      .then((knownFiles) => {
        const key = Object.keys(knownFiles).find(
          (id) => path.normalize(knownFiles[id].path) == path.normalize(oldFilePath)
        )
        const file = knownFilesStore.get(key)
        return knownFilesStore.set(key, {
          ...file,
          path: newFilePath,
        })
      })
      .catch((error) => {
        logger.error('Error editing known file path: ')
        return Promise.reject(error)
      })
  }

  const updateLastOpenedDate = (id) => {
    return knownFilesStore.set(`${id}.lastOpened`, Date.now())
  }

  return {
    removeFromKnownFiles,
    addKnownFileWithFix,
    addKnownFile,
    editKnownFilePath,
    updateLastOpenedDate,
  }
}

export default makeKnownFilesModule
