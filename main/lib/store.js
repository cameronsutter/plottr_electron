import fs from 'fs'
import path from 'path'
import { cloneDeep, set, get } from 'lodash'

const { readFile, open, writeFile, lstat, mkdir } = fs.promises

class Store {
  store = {}
  watchers = new Set()

  constructor(userDataPath, logger, { name, watch, defaults, onInvalidStore }) {
    logger.info(`Constructing store for: ${name}`)

    this.name = name
    this.watch = watch
    this.defaults = defaults || {}
    this.onInvalidStore = onInvalidStore
    this.logger = logger
    this.userDataPath = userDataPath
    this.path = path.join(userDataPath, `${name}.json`)
    this.activeWrite = null
    this.initialReadComplete = false

    this._readStore().then(() => {
      this.initialReadComplete = true
      if (this.watch) {
        this.watchStore()
      }
    })
  }

  stop = () => {
    if (this.watcher && typeof this.watcher.close === 'function') {
      this.watcher.close()
    }
  }

  activeWriteRequest = () => {
    return this.activeWrite || Promise.resolve(true)
  }

  watchStore = () => {
    this.watcher = fs.watchFile(this.path, (currentFileStats, previousFileStats) => {
      if (currentFileStats.mtimeMs === previousFileStats.mtimeMs) {
        // File didn't actually change.  It was probably just
        // accessed.
        return
      }
      if (!currentFileStats.isFile()) {
        this.logger.warn(
          `File for store connected to ${this.name} at ${this.path} dissapeared.  Setting store to empty.`
        )
        this.store = {}
        this.writeStore()
        this.publishChangesToWatchers()
        return
      }
      this._readStore().then(() => {
        this.publishChangesToWatchers()
      })
    })
  }

  publishChangesToWatchers = () => {
    this.watchers.forEach((cb) => {
      cb({
        ...this.defaults,
        ...this.store,
      })
    })
  }

  onDidAnyChange = (cb) => {
    this.watchers.add(cb)
    return () => {
      this.watchers.delete(cb)
    }
  }

  afterActiveWrite = (f) => {
    return this.activeWriteRequest().then(() => {
      return f()
    })
  }

  currentStore = () => {
    return this.afterActiveWrite(() => {
      if (this.initialReadComplete) {
        return this.store
      }

      return this._readStore().then(() => {
        return this.store
      })
    })
  }

  // This doesn't need to wait for active writes because it's
  // internal.  Please don't use it externally, That will lead to race
  // conditions.  Use `currentStore` instead!!
  _readStore = () => {
    return readFile(this.path)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          const createStore = () => {
            // The store doesn't yet exist.  Create it.
            this.store = this.defaults
            return this.writeStore().then(() => {
              return JSON.stringify(this.store)
            })
          }
          // Does the user data folder exist?
          return lstat(this.userDataPath)
            .then(createStore)
            .catch((dataDirError) => {
              // Use data folder doesn't exist.  Create it.
              if (dataDirError.code === 'ENOENT') {
                this.logger.warn(
                  `User data path doesn't exist at: ${this.userDataPath}.  Attempting to create it.`
                )
                return mkdir(this.userDataPath, { recursive: true })
                  .then(() => {
                    return new Promise((resolve) => {
                      setTimeout(resolve, Math.random(1000) + 1000)
                    })
                  })
                  .then(createStore)
              }
              return Promise.reject(dataDirError)
            })
            .then(createStore)
        }
        this.logger.error(`Failed to construct store for ${this.name} at ${this.path}`, error)
        throw new Error(`Failed to construct store for ${this.name} at ${this.path}`, error)
      })
      .then((storeContents) => {
        try {
          this.store =
            storeContents.toString() === ''
              ? this.defaults
              : {
                  ...this.defaults,
                  ...JSON.parse(storeContents),
                }
          return this.store
        } catch (error) {
          this.logger.error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
          if (this.onInvalidStore) {
            this.logger.info('Recovering with supplied recovery function.')
            return this.onInvalidStore()
          }

          throw new Error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
        }
      })
  }

  has = (key) => {
    return !!this.get(key)
  }

  writeStore = () => {
    return this.activeWriteRequest().then(() => {
      this.activeWrite = open(this.path, 'w+')
        .then((fileHandle) => {
          return writeFile(
            fileHandle,
            JSON.stringify(
              {
                ...this.defaults,
                ...this.store,
              },
              null,
              2
            )
          )
            .then(() => {
              return fileHandle.sync().then(() => {
                return fileHandle.close()
              })
            })
            .then(() => {
              this.publishChangesToWatchers()
            })
        })
        .catch((error) => {
          this.logger.error(`Failed to write ${this.store} store for ${this.path}`, error)
          throw new Error(`Failed to write ${this.store} store for ${this.path}`, error)
        })
        .finally(() => {
          this.activeWrite = null
        })
    })
  }

  set = (storeOrKey, value) => {
    return this.afterActiveWrite(() => {
      if (typeof value !== 'undefined') {
        const key = `${storeOrKey}`
        this.store = cloneDeep(this.store)
        set(this.store, key, value)
        return this.writeStore()
          .then(() => {
            this.publishChangesToWatchers()
          })
          .then(() => true)
      }

      const store = storeOrKey
      if (typeof store !== 'object') {
        return Promise.reject(`Tried to set store to non-object: ${store}`)
      }
      this.store = cloneDeep(store)
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  // Use this if you have full stops in your key that you don't want
  // the store to interpret as nested objects.
  setRawKey = (key, value) => {
    if (!key) {
      const message = `Attempted to set key: ${key} to ${value} but (as you can see, there's no key)`
      this.logger.error(message)
      return Promise.reject(new Error(message))
    }
    return this.afterActiveWrite(() => {
      this.store = cloneDeep(this.store)
      this.store[key] = value
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  clear = () => {
    return this.afterActiveWrite(() => {
      this.store = {}
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  delete = (id) => {
    return this.afterActiveWrite(() => {
      this.store = cloneDeep(this.store)
      delete this.store[id]
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  filter = (predicate) => {
    return this.afterActiveWrite(() => {
      this.store = Object.entries(cloneDeep(this.store)).reduce((acc, next) => {
        const [key, value] = next
        if (predicate(value, key)) {
          return {
            ...acc,
            [key]: value,
          }
        }
        return acc
      }, {})
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  mapValues = (f) => {
    return this.afterActiveWrite(() => {
      this.store = Object.entries(cloneDeep(this.store)).reduce((acc, next) => {
        const [key, value] = next
        return {
          ...acc,
          [key]: f(value),
        }
      }, {})
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  map = (f) => {
    return this.afterActiveWrite(() => {
      this.store = Object.entries(cloneDeep(this.store)).reduce((acc, next) => {
        const [key, value] = next
        const newKeyValue = f(value, key)
        return {
          ...acc,
          ...newKeyValue,
        }
      }, {})
      return this.writeStore()
        .then(() => {
          this.publishChangesToWatchers()
        })
        .then(() => true)
    })
  }

  some = (predicate) => {
    return this.afterActiveWrite(() => {
      return Object.entries(this.store).some(([key, value]) => {
        return predicate(value, key)
      })
    })
  }

  get = (key) => {
    if (typeof key !== 'undefined') {
      return get(this.store, key) || get(this.defaults, key)
    }

    return {
      ...this.defaults,
      ...this.store,
    }
  }

  // Use this if you have full stops in your key that you don't want
  // the store to interpret as nested objects.
  getRawKey = (key) => {
    if (typeof key !== 'undefined') {
      return this.store[key] || this.defaults[key]
    }

    return {
      ...this.defaults,
      ...this.store,
    }
  }
}

export default Store
