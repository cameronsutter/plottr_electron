import { configureStore } from './fixtures/testStore'
import { emptyFile, actions } from 'pltr/v2'

const EMPTY_FILE = emptyFile('Test file')
const initialStore = () => {
  const store = configureStore()
  return store
}
const stateWithoutFileURL = () => {
  return initialStore().getState().present
}
const stateForDeviceFile = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://tmp/dummy-url-test-file.pltr'
    )
  )
  return store.getState().present
}
const stateForProFile = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'plottr://abcdefghowilovetowritethesetests'
    )
  )
  return store.getState().present
}
const resumingState = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'plottr://abcdefghowilovetowritethesetests'
    )
  )
  store.dispatch(actions.setResuming(true))
  return store.getState().present
}
const offlineWithOfflineDisabledState = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'plottr://abcdefghowilovetowritethesetests'
    )
  )
  store.dispatch(actions.project.setOffline(true))
  const oldSettings = store.getState().present.settings
  store.dispatch(
    actions.setAppSettings({
      ...oldSettings,
      appSettings: {
        ...oldSettings.appSettings,
        user: {
          ...oldSettings.appSettings.user,
          enableOfflineMode: true,
        },
      },
    })
  )
  return store.getState().present
}

describe('saveFile', () => {
  describe('given a whenClientIsReady that produces a dummy saveFile', () => {
    describe('and a full file state that has no file URL', () => {
      it('should not call the dummy saveFile', async () => {
        const state = stateWithoutFileURL()
        let called = false
        const saveFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = () => {
          return Promise.resolve({
            saveFile,
          })
        }
        await saveFile(whenClientIsReady)(state)
        expect(called).toBeFalse()
      })
    })
    describe('and a full file state with a Pro file URL', () => {
      describe('and the store notes that Plottr is resuming', () => {
        it('should not call the dummy saveFile', async () => {
          const state = resumingState()
          let called = false
          const saveFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = () => {
            return Promise.resolve({
              saveFile,
            })
          }
          await saveFile(whenClientIsReady)(state)
          expect(called).toBeFalse()
        })
      })
      describe('and Plottr is offline', () => {
        describe('and offline mode is disabled', () => {
          it('should not call the dummy saveFile', async () => {
            const state = offlineWithOfflineDisabledState()
            let called = false
            const saveFile = () => {
              called = true
              return Promise.resolve()
            }
            const whenClientIsReady = () => {
              return Promise.resolve({
                saveFile,
              })
            }
            await saveFile(whenClientIsReady)(state)
            expect(called).toBeFalse()
          })
        })
        describe('and offline mode is enabled', () => {
          it('should not call saveFile, but instead it should call soveOfflineFile', async () => {
            const state = offlineWithOfflineDisabledState()
            let calledSaveFile = false
            const saveFile = () => {
              calledSaveFile = true
              return Promise.resolve()
            }
            let calledSaveOfflineFile = false
            const saveOfflineFile = () => {
              calledSaveOfflineFile = false
              return Promise.resolve()
            }
            const whenClientIsReady = () => {
              return Promise.resolve({
                saveFile,
                saveOfflineFile,
              })
            }
            await saveFile(whenClientIsReady)(state)
            expect(calledSaveFile).toBeFalse()
            expect(calledSaveOfflineFile).toBetrue()
          })
        })
      })
      describe('and Plottr is not offline', () => {
        it('should call save file', async () => {
          const state = stateForProFile()
          let called = false
          const saveFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = () => {
            return Promise.resolve({
              saveFile,
            })
          }
          await saveFile(whenClientIsReady)(state)
          expect(called).toBeFalse()
        })
      })
    })
    describe('and a device-stored file', () => {
      it('should call the dummy saveFile', async () => {
        const state = stateForDeviceFile()
        let called = false
        const saveFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = () => {
          return Promise.resolve({
            saveFile,
          })
        }
        await saveFile(whenClientIsReady)(state)
        expect(called).toBeFalse()
      })
    })
  })
})

describe('backupFile', () => {
  
})
