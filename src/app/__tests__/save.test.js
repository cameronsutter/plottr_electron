import { omit } from 'lodash'

import { emptyFile, actions } from 'pltr/v2'

import { configureStore } from './fixtures/testStore'
import { saveFile, backupFile } from '../save'

const CONSOLE_LOGGER = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
}

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
  store.dispatch(actions.project.setResuming(true))
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
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      user: {
        ...oldSettings.user,
        enableOfflineMode: false,
      },
    })
  )
  return store.getState().present
}
const offlineLocalFileWithOfflineDisabledState = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device:///tmp/a-dummy-file.pltr'
    )
  )
  store.dispatch(actions.project.setOffline(true))
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      user: {
        ...oldSettings.user,
        enableOfflineMode: false,
      },
    })
  )
  return store.getState().present
}
const offlineLocalFileWithOfflineEnabledState = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device:///tmp/a-dummy-file.pltr'
    )
  )
  store.dispatch(actions.project.setOffline(true))
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      user: {
        ...oldSettings.user,
        enableOfflineMode: true,
      },
    })
  )
  return store.getState().present
}
const onlineWithOfflineDisabledAndLocalBackupDisabledState = () => {
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
  store.dispatch(actions.project.setOffline(false))
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      user: {
        ...oldSettings.user,
        enableOfflineMode: false,
        localBackups: false,
      },
    })
  )
  return store.getState().present
}
const onlineWithOfflineDisabledAndLocalBackupEnabledState = () => {
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
  store.dispatch(actions.project.setOffline(false))
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      user: {
        ...oldSettings.user,
        enableOfflineMode: false,
        localBackups: true,
      },
    })
  )
  return store.getState().present
}
const offlineWithOfflineEnabledState = () => {
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
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      user: {
        ...oldSettings.user,
        enableOfflineMode: true,
      },
    })
  )
  return store.getState().present
}
const localFileWithBackupsDisabled = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://abcdefghowilovetowritethesetests'
    )
  )
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      backup: false,
    })
  )
  return store.getState().present
}
const localFileWithBackupsEnabled = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device://abcdefghowilovetowritethesetests'
    )
  )
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      backup: true,
    })
  )
  return store.getState().present
}
const localFileWithBackupsEnabledThatPointsAtOfflineModeFile = () => {
  const store = initialStore()
  store.dispatch(
    actions.ui.loadFile(
      'Test Pro file',
      false,
      EMPTY_FILE,
      EMPTY_FILE.file.version,
      'device:///offline/a-file.pltr'
    )
  )
  const oldSettings = store.getState().present.settings.appSettings
  store.dispatch(
    actions.settings.setAppSettings({
      ...oldSettings,
      backup: true,
    })
  )
  return store.getState().present
}

describe('saveFile', () => {
  describe('given a whenClientIsReady that produces a dummy saveFile', () => {
    describe('and a file that lacks the necessary keys', () => {
      it('should not call the dummy save', async () => {
        let called = false
        const _saveFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = (f) => {
          return f({
            saveFile: _saveFile,
          })
        }
        let threw = false
        try {
          await saveFile(whenClientIsReady, CONSOLE_LOGGER)(omit(EMPTY_FILE, 'file'))
        } catch (error) {
          threw = true
          expect(called).toBeFalsy()
        }
        expect(threw).toBeTruthy()
      })
    })
    describe('and a full file state that has no file URL', () => {
      it('should not call the dummy saveFile', async () => {
        const state = stateWithoutFileURL()
        let called = false
        const _saveFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = (f) => {
          return f({
            saveFile: _saveFile,
          })
        }
        await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
        expect(called).toBeFalsy()
      })
    })
    describe('and a full file state with a Pro file URL', () => {
      describe('and the store notes that Plottr is resuming', () => {
        it('should not call the dummy saveFile', async () => {
          const state = resumingState()
          let called = false
          const _saveFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = (f) => {
            return f({
              saveFile: _saveFile,
            })
          }
          await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
          expect(called).toBeFalsy()
        })
      })
      describe('and Plottr is offline', () => {
        describe('and offline mode is disabled', () => {
          it('should not call the dummy saveFile', async () => {
            const state = offlineWithOfflineDisabledState()
            let called = false
            const _saveFile = () => {
              called = true
              return Promise.resolve()
            }
            const whenClientIsReady = (f) => {
              return f({
                saveFile: _saveFile,
              })
            }
            await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
            expect(called).toBeFalsy()
          })
        })
        describe('and offline mode is enabled', () => {
          it('should not call saveFile, but instead it should call soveOfflineFile', async () => {
            const state = offlineWithOfflineEnabledState()
            let calledSaveFile = false
            const _saveFile = () => {
              calledSaveFile = true
              return Promise.resolve()
            }
            let calledSaveOfflineFile = false
            const saveOfflineFile = () => {
              calledSaveOfflineFile = true
              return Promise.resolve()
            }
            const whenClientIsReady = (f) => {
              return f({
                saveFile: _saveFile,
                saveOfflineFile,
              })
            }
            await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
            expect(calledSaveFile).toBeFalsy()
            expect(calledSaveOfflineFile).toBeTruthy()
          })
        })
      })
      describe('and Plottr is not offline', () => {
        it('should call save file', async () => {
          const state = stateForProFile()
          let called = false
          const _saveFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = (f) => {
            return f({
              saveFile: _saveFile,
            })
          }
          await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
          expect(called).toBeTruthy()
        })
      })
    })
    describe('and a device-stored file', () => {
      it('should call the dummy saveFile', async () => {
        const state = stateForDeviceFile()
        let called = false
        const _saveFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = (f) => {
          return f({
            saveFile: _saveFile,
          })
        }
        await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
        expect(called).toBeTruthy()
      })
      describe('and Plottr is offline', () => {
        describe('and offline mode is disabled', () => {
          it('should call the dummy saveFile', async () => {
            const state = offlineLocalFileWithOfflineDisabledState()
            let called = false
            const _saveFile = () => {
              called = true
              return Promise.resolve()
            }
            let calledSaveOfflineFile = false
            const saveOfflineFile = () => {
              calledSaveOfflineFile = true
              return Promise.resolve()
            }
            const whenClientIsReady = (f) => {
              return f({
                saveFile: _saveFile,
                saveOfflineFile,
              })
            }
            await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
            expect(calledSaveOfflineFile).toBeFalsy()
            expect(called).toBeTruthy()
          })
        })
        describe('and offline mode is enabled', () => {
          it('should call the dummy saveFile', async () => {
            const state = offlineLocalFileWithOfflineEnabledState()
            let calledSaveFile = false
            const _saveFile = () => {
              calledSaveFile = true
              return Promise.resolve()
            }
            let calledSaveOfflineFile = false
            const saveOfflineFile = () => {
              calledSaveOfflineFile = true
              return Promise.resolve()
            }
            const whenClientIsReady = (f) => {
              return f({
                saveFile: _saveFile,
                saveOfflineFile,
              })
            }
            await saveFile(whenClientIsReady, CONSOLE_LOGGER)(state)
            expect(calledSaveFile).toBeFalsy()
            expect(calledSaveOfflineFile).toBeTruthy()
          })
        })
      })
    })
  })
})

describe('backupFile', () => {
  describe('given a whenClientIsReady that produces a dummy saveBackup', () => {
    describe('and a file that lacks the necessary keys', () => {
      it('should not call the dummy backup', async () => {
        let called = false
        const _backupFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = (f) => {
          return f({
            saveBackup: _backupFile,
            offlineFileURL: () => Promise.resolve('/offline/'),
          })
        }
        let threw = false
        try {
          await backupFile(whenClientIsReady, CONSOLE_LOGGER)(omit(EMPTY_FILE, 'file'))
        } catch (error) {
          threw = true
          expect(called).toBeFalsy()
        }
        expect(threw).toBeTruthy()
      })
    })
    describe('and a file that lacks a fileURL', () => {
      it('should not call the dummy backup', async () => {
        const state = stateWithoutFileURL()
        let called = false
        const _backupFile = () => {
          called = true
          return Promise.resolve()
        }
        const whenClientIsReady = (f) => {
          return f({
            saveBackup: _backupFile,
            offlineFileURL: () => Promise.resolve('/offline/'),
          })
        }
        await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
        expect(called).toBeFalsy()
      })
    })
    describe('given a file with a URL that points to Plottr cloud', () => {
      describe('and Plottr is offline', () => {
        describe('with offline mode disabled', () => {
          it('should not call the dummy backup', async () => {
            const state = offlineWithOfflineDisabledState()
            let called = false
            const _backupFile = () => {
              called = true
              return Promise.resolve()
            }
            const whenClientIsReady = (f) => {
              return f({
                saveBackup: _backupFile,
                offlineFileURL: () => Promise.resolve('/offline/'),
              })
            }
            await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
            expect(called).toBeFalsy()
          })
        })
        describe('with offline mode enabled', () => {
          it('should not call the dummy backup', async () => {
            const state = offlineWithOfflineEnabledState()
            let called = false
            const _backupFile = () => {
              called = true
              return Promise.resolve()
            }
            const whenClientIsReady = (f) => {
              return f({
                saveBackup: _backupFile,
                offlineFileURL: () => Promise.resolve('/offline/'),
              })
            }
            await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
            expect(called).toBeFalsy()
          })
        })
      })
      describe('and Plottr is online', () => {
        describe('with offline mode disabled', () => {
          describe('and local backups is disabled', () => {
            it('should not call the dummy backup', async () => {
              // HERE
              const state = onlineWithOfflineDisabledAndLocalBackupDisabledState()
              let called = false
              const _backupFile = () => {
                called = true
                return Promise.resolve()
              }
              const whenClientIsReady = (f) => {
                return f({
                  saveBackup: _backupFile,
                  offlineFileURL: () => Promise.resolve('/offline/'),
                })
              }
              await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
              expect(called).toBeFalsy()
            })
          })
          describe('and local backups is enabled', () => {
            it('should call the dummy backup', async () => {
              const state = onlineWithOfflineDisabledAndLocalBackupEnabledState()
              let called = false
              const _backupFile = () => {
                called = true
                return Promise.resolve()
              }
              const whenClientIsReady = (f) => {
                return f({
                  saveBackup: _backupFile,
                  offlineFileURL: () => Promise.resolve('/offline/'),
                })
              }
              await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
              expect(called).toBeTruthy()
            })
          })
        })
        describe('with offline mode enabled', () => {
          describe('and local backups is disabled', () => {
            it('should not call the dummy backup', async () => {
              const state = onlineWithOfflineDisabledAndLocalBackupDisabledState()
              let called = false
              const _backupFile = () => {
                called = true
                return Promise.resolve()
              }
              const whenClientIsReady = (f) => {
                return f({
                  saveBackup: _backupFile,
                  offlineFileURL: () => Promise.resolve('/offline/'),
                })
              }
              await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
              expect(called).toBeFalsy()
            })
          })
          describe('and local backups is enabled', () => {
            it('should call the dummy backup', async () => {
              const state = onlineWithOfflineDisabledAndLocalBackupEnabledState()
              let called = false
              const _backupFile = () => {
                called = true
                return Promise.resolve()
              }
              const whenClientIsReady = (f) => {
                return f({
                  saveBackup: _backupFile,
                  offlineFileURL: () => Promise.resolve('/offline/'),
                })
              }
              await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
              expect(called).toBeTruthy()
            })
          })
        })
      })
    })
    describe('and a URL that points to a device file', () => {
      describe('and that URL points to an offline backup file', () => {
        it('should not backup the file', async () => {
          const state = localFileWithBackupsEnabledThatPointsAtOfflineModeFile()
          let called = false
          const _backupFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = (f) => {
            return f({
              saveBackup: _backupFile,
              offlineFileURL: () => Promise.resolve('/offline/'),
            })
          }
          await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
          expect(called).toBeFalsy()
        })
      })
      describe('and backups are disabeld', () => {
        it('should not backup the file', async () => {
          const state = localFileWithBackupsDisabled()
          let called = false
          const _backupFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = (f) => {
            return f({
              saveBackup: _backupFile,
              offlineFileURL: () => Promise.resolve('/offline/'),
            })
          }
          await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
          expect(called).toBeFalsy()
        })
      })
      describe('and backups are enabled', () => {
        it('should backup the file', async () => {
          const state = localFileWithBackupsEnabled()
          let called = false
          const _backupFile = () => {
            called = true
            return Promise.resolve()
          }
          const whenClientIsReady = (f) => {
            return f({
              saveBackup: _backupFile,
              offlineFileURL: () => Promise.resolve('/offline/'),
            })
          }
          await backupFile(whenClientIsReady, CONSOLE_LOGGER)(state)
          expect(called).toBeTruthy()
        })
      })
    })
  })
})
