import electron, { remote, shell, ipcRenderer } from 'electron'
import path from 'path'
import { ActionCreators } from 'redux-undo'
import { connections } from 'plottr_components'
import { readFileSync } from 'fs'
import { machineIdSync } from 'node-machine-id'
import log from 'electron-log'
import { is } from 'electron-util'

import { actions, selectors } from 'pltr/v2'
import {
  publishRCEOperations,
  fetchRCEOperations,
  listenForChangesToEditor,
  deleteChangeSignal,
  deleteOldChanges,
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
  showSaveDialogSync,
  newFile,
  uploadExisting,
  deleteCloudBackupFile,
} from './files'
import { logger } from './logger'
import { closeDashboard } from './dashboard-events'
import { fileSystemAPIs, licenseServerAPIs } from './api'

import { store } from './app/store'

import { BACKUP_BASE_PATH, TEMP_FILES_PATH } from './file-system/config_paths'
import { USER } from './file-system/stores'

import askToExport from './exporter/start_export'
import export_config from './exporter/default_config'

import extractImages from './common/extract_images'
import { resizeImage } from './common/resizeImage'

import { deleteTemplate, editTemplateDetails } from './common/utils/templates'
import { createFullErrorReport } from './common/utils/full_error_report'
import { createErrorReport } from './common/utils/error_reporter'
import MPQ from './common/utils/MPQ'
import { openExistingFile as _openExistingFile } from './common/utils/window_manager'
import {
  doesFileExist,
  removeFromKnownFiles,
  listOfflineFiles,
  sortAndSearch,
} from './common/utils/files'
import { handleCustomerServiceCode } from './common/utils/customer_service_codes'

const win = remote.getCurrentWindow()
const { app, dialog } = remote
const version = app.getVersion()

const moveItemToTrash = shell.moveItemToTrash

export const openFile = (filePath, id, unknown) => {
  ipcRenderer.send('open-known-file', filePath, id, unknown)
}

const idFromPath = (filePath) => {
  return filePath?.replace(/^plottr:\/\//, '')
}

const platform = {
  undo: () => {
    store.dispatch(ActionCreators.undo())
  },
  redo: () => {
    store.dispatch(ActionCreators.redo())
  },
  electron,
  appVersion: version,
  defaultBackupLocation: BACKUP_BASE_PATH,
  setDarkMode: (value) => {
    ipcRenderer.send('pls-set-dark-setting', value)
  },
  file: {
    createNew: (template) => {
      const state = store.getState()
      const {
        client: { emailAddress, userId, clientId },
        project: { fileList },
      } = state.present
      if (userId) {
        store.dispatch(actions.project.showLoader(true))
        store.dispatch(actions.project.startCreatingCloudFile())
        newFile(emailAddress, userId, fileList, state, clientId, template, openFile)
          .then((fileId) => {
            logger.info('Created new file.', fileId)
            store.dispatch(actions.project.showLoader(false))
            store.dispatch(actions.project.finishCreatingCloudFile())
          })
          .catch((error) => {
            logger.error('Error creating a new file', error)
            store.dispatch(actions.project.showLoader(false))
            store.dispatch(actions.project.finishCreatingCloudFile())
          })
      } else {
        ipcRenderer.send('create-new-file', template)
      }
    },
    openExistingFile: () => {
      const state = store.getState()
      const {
        client: { userId, emailAddress },
      } = state.present
      store.dispatch(actions.project.showLoader(true))
      _openExistingFile(!!userId, userId, emailAddress)
        .then(() => {
          logger.info('Opened existing file')
          store.dispatch(actions.project.showLoader(false))
        })
        .catch((error) => {
          logger.error('Error opening existing file', error)
          store.dispatch(actions.project.showLoader(false))
        })
    },
    doesFileExist,
    isTempFile: (filePath) => filePath.includes(TEMP_FILES_PATH),
    pathSep: path.sep,
    basename: path.basename,
    openKnownFile: (filePath, id, unknown) => {
      const state = store.getState()
      const {
        project: { selectedFile },
      } = state.present
      const fileId = selectedFile?.id
      if (filePath === selectedFile?.path || fileId === idFromPath(filePath)) {
        closeDashboard()
      } else {
        openFile(filePath, id, unknown)
      }
    },
    deleteKnownFile: (id, path) => {
      const state = store.getState()
      const {
        present: {
          project: { selectedFile },
          client: { userId, clientId },
        },
      } = state
      const isLoggedIn = selectors.isLoggedInSelector(state.present)
      const file = isLoggedIn && selectors.fileFromFileIdSelector(state.present, id)
      const isOnCloud = file?.isCloudFile
      if (isLoggedIn && isOnCloud) {
        const fileName = selectors.fileFromFileIdSelector(state.present, id).fileName
        store.dispatch(actions.project.showLoader(true))
        deleteCloudBackupFile(fileName)
          .then(() => {
            return deleteFile(id, userId, clientId)
          })
          .then(() => {
            if (selectedFile.id === idFromPath(path)) {
              store.dispatch(actions.project.selectFile(null))
            }
            logger.info(`Deleted file at path: ${path}`)
            store.dispatch(actions.project.showLoader(false))
          })
          .catch((error) => {
            logger.error(`Error deleting file at path: ${path}`, error)
            store.dispatch(actions.project.showLoader(false))
          })
      } else {
        ipcRenderer.send('delete-known-file', id, path, userId, clientId)
      }
    },
    editKnownFilePath,
    renameFile,
    removeFromKnownFiles,
    saveFile,
    readFileSync,
    moveItemToTrash,
    createFromSnowflake: (importedPath) => {
      ipcRenderer.send('create-from-snowflake', importedPath)
    },
    joinPath: path.join,
    listOfflineFiles,
    sortAndSearch,
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
    startTrial: fileSystemAPIs.startTrial,
    extendTrial: fileSystemAPIs.extendTrial,
    deleteLicense: fileSystemAPIs.deleteLicense,
    saveLicenseInfo: fileSystemAPIs.saveLicenseInfo,
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
    editTemplateDetails,
    startSaveAsTemplate: (itemType) => {
      const win = remote.getCurrentWindow()
      ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', itemType) // sends this message to this same process
    },
    saveTemplate: (payload) => {
      const win = remote.getCurrentWindow()
      ipcRenderer.sendTo(win.webContents.id, 'save-custom-template', payload)
    },
  },
  settings: {
    saveAppSetting: fileSystemAPIs.saveAppSetting,
  },
  user: USER,
  os: is.windows ? 'windows' : is.macos ? 'macos' : is.linux ? 'linux' : 'unknown',
  isDevelopment: is.development,
  isWindows: is.windows,
  isMacOS: is.macos,
  openExternal: shell.openExternal,
  createErrorReport,
  createFullErrorReport,
  handleCustomerServiceCode,
  log,
  dialog,
  showSaveDialogSync,
  showOpenDialogSync: (options) => dialog.showOpenDialogSync(win, options),
  node: {
    env: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  },
  rollbar: {
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || '',
    platform: process.platform,
  },
  export: {
    askToExport,
    export_config,
    saveExportConfigSettings: fileSystemAPIs.saveExportConfigSettings,
  },
  moveFromTemp: () => {
    const win = remote.getCurrentWindow()
    ipcRenderer.sendTo(win.webContents.id, 'move-from-temp')
  },
  showItemInFolder: (fileName) => {
    shell.showItemInFolder(fileName)
  },
  tempFilesPath: TEMP_FILES_PATH,
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
  storage: {
    isStorageURL,
    resolveToPublicUrl: (storageUrl) => {
      if (!storageUrl) return null
      const state = store.getState()
      const {
        client: { userId },
        project: { selectedFile },
      } = state.present
      const fileId = selectedFile?.id
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
    resizeImage: resizeImage,
  },
}

const components = connections.pltr(platform)

export const OverlayTrigger = components.OverlayTrigger
export const DeleteConfirmModal = components.DeleteConfirmModal
export const MessageModal = components.MessageModal
export const ColorPickerColor = components.ColorPickerColor
export const ItemsManagerModal = components.ItemsManagerModal
export const ListItem = components.ListItem
export const PlottrModal = components.PlottrModal
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
export const FirebaseLogin = components.FirebaseLogin
export const FullPageSpinner = components.FullPageSpinner
