import { ipcRenderer } from 'electron'
import { ActionCreators } from 'redux-undo'
import { machineIdSync } from 'node-machine-id'

import { t } from 'plottr_locales'
import { connections } from 'plottr_components'
import { askToExport } from 'plottr_import_export'
import export_config from 'plottr_import_export/src/exporter/default_config'
import { actions, selectors, helpers } from 'pltr/v2'
import {
  publishRCEOperations,
  fetchRCEOperations,
  listenForChangesToEditor,
  deleteChangeSignal,
  deleteOldChanges,
  backupPublicURL,
  imagePublicURL,
  isStorageURL,
  saveImageToStorageBlob as saveImageToStorageBlobInFirebase,
  saveImageToStorageFromURL as saveImageToStorageFromURLInFirebase,
  deleteFile,
  startUI,
  firebaseUI,
  onSessionChange,
  fetchFiles,
  logOut,
  saveCustomTemplate,
  currentUser,
  listenForRCELock,
  lockRCE,
  releaseRCELock,
} from 'wired-up-firebase'

import {
  renameFile,
  saveFile,
  editKnownFilePath,
  newFile,
  uploadExisting,
  deleteCloudBackupFile,
} from './files'
import logger from '../shared/logger'
import { closeDashboard } from './dashboard-events'
import { makeFileSystemAPIs, licenseServerAPIs } from './api'
import { isWindows, isLinux, isMacOS } from './isOS'
import { isDevelopment } from './isDevelopment'

import { store } from './app/store'

import extractImages from './common/extract_images'
import { resizeImage } from './common/resizeImage'
import { downloadStorageImage } from './common/downloadStorageImage'

import { deleteTemplate, editTemplateDetails } from './common/utils/templates'
import { createFullErrorReport } from './common/utils/full_error_report'
import { createErrorReport } from './common/utils/error_reporter'
import MPQ from './common/utils/MPQ'
import { openExistingFile as _openExistingFile } from './common/utils/window_manager'
import { doesFileExist, removeFromKnownFiles, listOfflineFiles } from './common/utils/files'
import { handleCustomerServiceCode } from './common/utils/customer_service_codes'
import { notifyUser } from './notifyUser'
import { exportSaveDialog } from './export-save-dialog'
import { whenClientIsReady } from '../shared/socket-client'
import { makeMainProcessClient } from './app/mainProcessClient'

const { getVersion, hostLocale, openExternal, showOpenDialog } = makeMainProcessClient()

export const rmRF = (path, ...args) => {
  return whenClientIsReady(({ rmRf }) => {
    return rmRf(path)
  })
}

const writeFile = (filePath, data) => {
  return whenClientIsReady(({ writeFile }) => {
    return writeFile(filePath, data)
  })
}

const {
  saveAppSetting,
  startTrial,
  deleteLicense,
  saveLicenseInfo,
  saveExportConfigSettings,
  showErrorBox,
} = makeFileSystemAPIs(whenClientIsReady)

export const openFile = (fileURL, unknown) => {
  ipcRenderer.send('open-known-file', fileURL, unknown)
}

const platform = {
  undo: () => {
    store.dispatch(ActionCreators.undo())
  },
  redo: () => {
    store.dispatch(ActionCreators.redo())
  },
  hostLocale,
  appVersion: getVersion,
  defaultBackupLocation: () => {
    return whenClientIsReady(({ defaultBackupLocation }) => {
      return defaultBackupLocation()
    })
  },
  setDarkMode: (value) => {
    ipcRenderer.send('pls-set-dark-setting', value)
  },
  appQuit: () => {
    ipcRenderer.send('pls-quit')
  },
  file: {
    createNew: (template, name) => {
      const state = store.getState()
      const {
        client: { emailAddress, userId, clientId },
      } = state.present
      const fileList = selectors.knownFilesSelector(state.present)
      if (userId) {
        store.dispatch(actions.project.showLoader(true))
        store.dispatch(actions.applicationState.startCreatingCloudFile())
        newFile(emailAddress, userId, fileList, state, clientId, template, openFile, name)
          .then((fileId) => {
            logger.info('Created new file.', fileId)
            store.dispatch(actions.project.showLoader(false))
            store.dispatch(actions.applicationState.finishCreatingCloudFile())
          })
          .catch((error) => {
            logger.error('Error creating a new file', error)
            store.dispatch(actions.project.showLoader(false))
            store.dispatch(actions.applicationState.finishCreatingCloudFile())
          })
      } else {
        ipcRenderer.send('create-new-file', template, name)
      }
    },
    openExistingFile: () => {
      const state = store.getState()
      const {
        client: { userId, emailAddress },
      } = state.present
      const isLoggedIn = selectors.isLoggedInSelector(state.present)
      if (isLoggedIn) {
        store.dispatch(actions.applicationState.startUploadingFileToCloud())
      }

      store.dispatch(actions.project.showLoader(true))
      _openExistingFile(!!userId, userId, emailAddress)
        .then(() => {
          logger.info('Opened existing file')
          store.dispatch(actions.project.showLoader(false))
          if (isLoggedIn) {
            store.dispatch(actions.applicationState.finishUploadingFileToCloud())
          }
        })
        .catch((error) => {
          logger.error('Error opening existing file', error)
          showErrorBox(t('Error'), t('There was an error doing that. Try again.')).then(() => {
            store.dispatch(actions.project.showLoader(false))
            if (isLoggedIn) {
              store.dispatch(actions.applicationState.finishUploadingFileToCloud())
            }
          })
        })
    },
    doesFileExist,
    pathSep: () => {
      return whenClientIsReady(({ pathSep }) => {
        return pathSep()
      })
    },
    basename: (filePath) => {
      return whenClientIsReady(({ basename }) => {
        return basename(filePath)
      })
    },
    // FIXME: this is very poorly named.  Esp. since the second
    // parametor is a flag for whether the file is known XD
    openKnownFile: (fileURL, unknown) => {
      const state = store.getState().present
      const loadedFileURL = selectors.fileURLSelector(state)
      if (fileURL === loadedFileURL) {
        closeDashboard()
      } else {
        openFile(fileURL, unknown)
      }
    },
    deleteKnownFile: (fileURL) => {
      const state = store.getState().present
      const currentFileURL = selectors.fileURLSelector(state)
      const userId = selectors.userIdSelector(state)
      const clientId = selectors.clientIdSelector(state)
      const isLoggedIn = selectors.isLoggedInSelector(state)
      const file = isLoggedIn && selectors.fileFromFileURLSelector(state, fileURL)
      const isOnCloud = file?.isCloudFile
      if (isLoggedIn && isOnCloud) {
        if (!file) {
          logger.error(`Error deleting file at url: ${fileURL}.  File is not known to Plottr`)
          store.dispatch(actions.error.generalError('file-not-found'))
          store.dispatch(actions.project.showLoader(false))
          store.dispatch(actions.applicationState.finishDeletingFile())
          return
        }
        const { fileName } = file
        store.dispatch(actions.project.showLoader(true))
        store.dispatch(actions.applicationState.startDeletingFile())
        const id = helpers.file.fileIdFromPlottrProFile(fileURL)
        const isOffline = selectors.isOfflineSelector(state)
        const isOfflineModeEnabled = selectors.offlineModeEnabledSelector(state)

        // We can just delete the offline backup.  For now, we'll
        // leave it to the user to propogate that change to the cloud
        // if they do it while offline.  In the opposite direction,
        // the file will be cleaned up the next time we record an
        // offline file.
        if (isOffline && isOfflineModeEnabled) {
          deleteCloudBackupFile(fileName)
          return
        }

        deleteFile(id, userId, clientId)
          .then(() => {
            if (currentFileURL === fileURL) {
              store.dispatch(actions.project.selectFile(null))
            }
            logger.info(`Deleted file at path: ${fileURL}`)
            store.dispatch(actions.project.showLoader(false))
            store.dispatch(actions.applicationState.finishDeletingFile())
          })
          .catch((error) => {
            logger.error(`Error deleting file at path: ${fileURL}`, error)
            store.dispatch(actions.project.showLoader(false))
            store.dispatch(actions.applicationState.finishDeletingFile())
          })
      } else {
        ipcRenderer.send('delete-known-file', fileURL)
      }
    },
    editKnownFilePath,
    renameFile,
    removeFromKnownFiles,
    saveFile,
    readFile: (fileURL) => {
      return whenClientIsReady(({ readFile }) => {
        return readFile(fileURL)
      })
    },
    rmRF,
    writeFile,
    createFromSnowflake: (importedPath) => {
      const state = store.getState().present
      const isLoggedIntoPro = selectors.hasProSelector(state)
      ipcRenderer.send('create-from-snowflake', importedPath, isLoggedIntoPro)
    },
    createFromScrivener: (importedPath) => {
      const state = store.getState().present
      const isLoggedIntoPro = selectors.hasProSelector(state)
      ipcRenderer.send('create-from-scrivener', importedPath, isLoggedIntoPro)
    },
    joinPath: (...args) => {
      return whenClientIsReady(({ join }) => {
        return join(...args)
      })
    },
    listOfflineFiles,
  },
  update: {
    quitToInstall: () => {
      ipcRenderer.send('pls-quit-and-install')
    },
    downloadUpdate: () => {
      ipcRenderer.send('pls-download-update')
    },
    checkForUpdates: () => {
      ipcRenderer.send('pls-check-for-updates')
    },
    onUpdateError: (cb) => {
      ipcRenderer.on('updater-error', cb)
    },
    onUpdaterUpdateAvailable: (cb) => {
      ipcRenderer.on('updater-update-available', cb)
    },
    onUpdaterUpdateNotAvailable: (cb) => {
      ipcRenderer.on('updater-update-not-available', cb)
    },
    onUpdaterDownloadProgress: (cb) => {
      ipcRenderer.on('updater-download-progress', cb)
    },
    onUpdatorUpdateDownloaded: (cb) => {
      ipcRenderer.on('updater-update-downloaded', cb)
    },
    deregisterUpdateListeners: () => {
      ipcRenderer.removeAllListeners('updater-error')
      ipcRenderer.removeAllListeners('updater-update-available')
      ipcRenderer.removeAllListeners('updater-update-not-available')
      ipcRenderer.removeAllListeners('updater-download-progress')
      ipcRenderer.removeAllListeners('updater-update-downloaded')
    },
  },
  updateLanguage: (newLanguage) => {
    ipcRenderer.send('pls-update-language', newLanguage)
  },
  updateBeatHierarchyFlag: (newValue) => {
    ipcRenderer.send('pls-update-beat-hierarchy-flag', newValue)
  },
  license: {
    checkForActiveLicense: licenseServerAPIs.checkForActiveLicense,
    verifyLicense: licenseServerAPIs.verifyLicense,
    trial90days: licenseServerAPIs.trial90days,
    trial60days: licenseServerAPIs.trial60days,
    checkForPro: licenseServerAPIs.checkForPro,
    startTrial,
    deleteLicense,
    saveLicenseInfo,
  },
  reloadMenu: () => {
    ipcRenderer.send('pls-reload-menu')
  },
  template: {
    deleteTemplate: (templateId) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return deleteTemplate(templateId, userId)
    },
    editTemplateDetails: (templateId, templateDetails) => {
      const state = store.getState()
      const userId = selectors.userIdSelector(state.present)
      editTemplateDetails(templateId, templateDetails, userId)
    },
    startSaveAsTemplate: (itemType) => {
      const event = new Event('save-as-template-start', { bubbles: true, cancelable: false })
      event.itemType = itemType
      document.dispatchEvent(event)
    },
    saveTemplate: (payload) => {
      const event = new Event('save-custom-template', { bubbles: true, cancelable: false })
      event.payload = payload
      document.dispatchEvent(event)
    },
  },
  settings: {
    saveAppSetting,
  },
  os: () => (isWindows() ? 'windows' : isMacOS() ? 'macos' : isLinux() ? 'linux' : 'unknown'),
  isDevelopment: isDevelopment(),
  isWindows: () => !!isWindows(),
  isMacOS: () => !!isMacOS(),
  openExternal,
  createErrorReport,
  createFullErrorReport,
  handleCustomerServiceCode,
  log: logger,
  showOpenDialog,
  showErrorBox,
  node: {
    env: isDevelopment() ? 'development' : 'production',
  },
  rollbar: {
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || '',
    platform: process.platform,
  },
  export: {
    askToExport,
    export_config,
    saveExportConfigSettings,
    notifyUser,
    exportSaveDialog,
  },
  moveFromTemp: () => {
    const event = new Event('move-from-temp')
    document.dispatchEvent(event)
  },
  showItemInFolder: (fileURL) => {
    isStorageURL(fileURL).then((storageURL) => {
      if (!storageURL) {
        ipcRenderer.send('show-item-in-folder', fileURL)
      } else {
        backupPublicURL(fileURL).then((url) => ipcRenderer.send('download-file-and-show', url))
      }
    })
  },
  mpq: MPQ,
  rootElementSelectors: ['#react-root', '#dashboard__react__root'],
  templatesDisabled: false,
  exportDisabled: false,
  publishRCEOperations,
  fetchRCEOperations,
  listenForChangesToEditor,
  deleteChangeSignal,
  deleteOldChanges,
  listenForRCELock,
  lockRCE,
  releaseRCELock,
  machineIdSync,
  extractImages,
  firebase: {
    startUI,
    firebaseUI,
    onSessionChange,
    currentUser,
    fetchFiles,
    logOut,
    saveCustomTemplate,
    uploadExisting,
  },
  login: {
    launchLoginPopup: () => {
      ipcRenderer.send('pls-open-login-popup')
    },
  },
  storage: {
    isStorageURL,
    resolveToPublicUrl: (storageUrl) => {
      if (!storageUrl) return null
      const state = store.getState()

      const fileId = selectors.fileIdSelector(state.present)
      const userId = selectors.userIdSelector(state.present)
      if (!fileId || !userId) {
        return Promise.reject(
          'No file or you are not logged in.  Either way we cannot fetch a picture.'
        )
      }
      return imagePublicURL(storageUrl, fileId, userId)
    },
    saveImageToStorageBlob: (blob, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageBlobInFirebase(userId, name, blob)
    },
    saveImageToStorageFromURL: (url, name) => {
      const state = store.getState()
      const {
        client: { userId },
      } = state.present
      return saveImageToStorageFromURLInFirebase(userId, name, url)
    },
    resizeImage,
    downloadStorageImage,
  },
}

const components = connections.pltr(platform)

export const Navbar = components.Navbar
export const Grid = components.Grid
export const NavItem = components.NavItem
export const Nav = components.Nav
export const Col = components.Col
export const Row = components.Row
export const Button = components.Button
export const DeleteConfirmModal = components.DeleteConfirmModal
export const MessageModal = components.MessageModal
export const ColorPickerColor = components.ColorPickerColor
export const ItemsManagerModal = components.ItemsManagerModal
export const ListItem = components.ListItem
export const PlottrModal = components.PlottrModal
export const ModalBody = components.ModalBody
export const ModalHeader = components.ModalHeader
export const ModalTitle = components.ModalTitle
export const ModalFooter = components.ModalFooter
export const Form = components.Form
export const EditAttribute = components.EditAttribute
export const RichText = components.RichText
export const editorRegistry = components.editorRegistry
export const Image = components.Image
export const ImagePicker = components.ImagePicker
export const MiniColorPicker = components.MiniColorPicker
export const Spinner = components.Spinner
export const FunSpinner = components.FunSpinner
export const InputModal = components.InputModal
export const ColorPicker = components.ColorPicker
export const Switch = components.Switch
export const CardTemplateDetails = components.CardTemplateDetails
export const PlotlineTemplateDetails = components.PlotlineTemplateDetails
export const TemplateCreate = components.TemplateCreate
export const TemplateEdit = components.TemplateEdit
export const TemplatePicker = components.TemplatePicker
export const Beamer = components.Beamer
export const LanguagePicker = components.LanguagePicker
export const CategoryPicker = components.CategoryPicker
export const CharacterCategoriesModal = components.CharacterCategoriesModal
export const CharacterDetails = components.CharacterDetails
export const CharacterEditDetails = components.CharacterEditDetails
export const CharacterItem = components.CharacterItem
export const CharacterListView = components.CharacterListView
export const CustomAttrFilterList = components.CustomAttrFilterList
export const BookFilterList = components.BookFilterList
export const CharacterCategoryFilterList = components.CharacterCategoryFilterList
export const CharactersFilterList = components.CharactersFilterList
export const PlacesFilterList = components.PlacesFilterList
export const TagFilterList = components.TagFilterList
export const GenericFilterList = components.GenericFilterList
export const SortList = components.SortList
export const CharacterView = components.CharacterView
export const BookSelectList = components.BookSelectList
export const ErrorBoundary = components.ErrorBoundary
export const DashboardErrorBoundary = components.DashboardErrorBoundary
export const SelectList = components.SelectList
export const TagLabel = components.TagLabel
export const CustomAttributeModal = components.CustomAttributeModal
export const SubNav = components.SubNav
export const ProjectTemplateDetails = components.ProjectTemplateDetails
export const CharacterTemplateDetails = components.CharacterTemplateDetails
export const ActsConfigModal = components.ActsConfigModal
export const AskToSaveModal = components.AskToSaveModal
export const ActsHelpModal = components.ActsHelpModal
export const FilterList = components.FilterList
export const TagView = components.TagView
export const TagListView = components.TagListView
export const ExportDialog = components.ExportDialog
export const ExportNavItem = components.ExportNavItem
export const NoteListView = components.NoteListView
export const OutlineView = components.OutlineView
export const PlaceListView = components.PlaceListView
export const BookList = components.BookList
export const EditSeries = components.EditSeries
export const FileLocation = components.FileLocation
export const BookChooser = components.BookChooser
export const TimelineWrapper = components.TimelineWrapper
export const DashboardBody = components.DashboardBody
export const DashboardNav = components.DashboardNav
export const FirebaseLogin = components.FirebaseLogin
export const FullPageSpinner = components.FullPageSpinner
export const ChoiceView = components.ChoiceView
export const ExpiredView = components.ExpiredView
export const ProOnboarding = components.ProOnboarding
export const UpdateNotifier = components.UpdateNotifier
export const NewProjectInputModal = components.NewProjectInputModal
