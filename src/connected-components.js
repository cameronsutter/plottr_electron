import electron, { remote, shell, ipcRenderer } from 'electron'
import { connections } from 'plottr_components'

import {
  listTemplates,
  listCustomTemplates,
  deleteTemplate,
  editTemplateDetails,
} from './common/utils/templates'
import log from 'electron-log'
import { createErrorReport } from './common/utils/full_error_report'
import SETTINGS from './common/utils/settings'
import USER from './common/utils/user_info'
import { is } from 'electron-util'

const { app } = remote
const version = app.getVersion()

const platform = {
  electron,
  appVersion: version,
  template: {
    listTemplates,
    listCustomTemplates,
    deleteTemplate,
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
  settings: SETTINGS,
  user: USER,
  os: is.windows ? 'windows' : is.macos ? 'macos' : is.linux ? 'linux' : 'unknown',
  isDevelopment: is.development,
  isWindows: is.windows,
  openExternal: shell.openExternal,
  createErrorReport,
  log,
  node: {
    env: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  },
  rollbar: {
    rollbarAccessToken: process.env.ROLLBAR_ACCESS_TOKEN || '',
    platform: process.platform,
  },
}

const components = connections.pltr(platform)

export const DeleteConfirmModal = components.DeleteConfirmModal
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
