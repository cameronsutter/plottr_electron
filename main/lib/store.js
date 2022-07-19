import fs from 'fs'
import path from 'path'
import { isEqual, cloneDeep, set, get } from 'lodash'

const { readFile, writeFile } = fs.promises

class Store {
  store = {}
  watchers = new Set()

  constructor(userDataPath, logger, { name, watch, defaults }) {
    logger.info(`Constructing store for: ${name}`)

    this.name = name
    this.watch = watch
    this.defaults = defaults
    this.logger = logger
    this.path = path.join(userDataPath, `${name}.json`)

    this.readStore().then(() => {
      this.watchStore()
    })
  }

  watchStore = () => {
    fs.watchFile(this.path, (currentFileStats, _previousFileStats) => {
      if (!currentFileStats.isFile()) {
        this.logger.warn(
          `File for store connected to ${this.name} at ${path} dissapeared.  Setting store to empty.`
        )
        return
      }
      this.readStore().then((didChange) => {
        this.publishChangesToWatchers()
      })
    })
  }

  publishChangesToWatchers = () => {
    this.watchers.forEach((cb) => {
      cb(this.store)
    })
  }

  onDidAnyChange = (cb) => {
    this.watchers.add(cb)
    return () => {
      this.watchers.delete(cb)
    }
  }

  readStore = () => {
    return readFile(this.path)
      .catch((error) => {
        if (error.code === 'ENOENT') {
          // The store doesn't yet exist.  Create it.
          this.store = {}
          return this.writeStore().then(() => {
            return '{}'
          })
        }
        this.logger.error(`Failed to construct store for ${this.name} at ${this.path}`, error)
        throw new Error(`Failed to construct store for ${this.name} at ${this.path}`, error)
      })
      .then((storeContents) => {
        try {
          const previousValue = this.store
          this.store = storeContents.toString() === '' ? {} : JSON.parse(storeContents)
          return !isEqual(previousValue, this.store)
        } catch (error) {
          this.logger.error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
          throw new Error(
            `Contents of store for ${this.name} at ${this.path} are invalid: <${storeContents}>`,
            error
          )
        }
      })
  }

  has = (key) => {
    return !!this.store[key]
  }

  writeStore = () => {
    return writeFile(this.path, JSON.stringify(this.store)).catch((error) => {
      this.logger.error(`Failed to write ${this.store} store for {this.path}`, error)
      throw new Error(`Failed to write ${this.store} store for {this.path}`, error)
    })
  }

  set = (key, value) => {
    this.store = cloneDeep(this.store)
    set(this.store, key, value)
    return this.writeStore().then(() => true)
  }

  set = (store) => {
    this.store = cloneDeep(store)
    return this.writeStore().then(() => true)
  }

  clear = () => {
    this.store = {}
    return this.writeStore().then(() => true)
  }

  delete = (id) => {
    this.store = cloneDeep(this.store)
    delete this.store[id]
    return this.writeStore().then(() => true)
  }

  get = (key) => {
    return get(this.store, key)
  }
}

export default Store
