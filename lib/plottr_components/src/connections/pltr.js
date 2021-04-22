import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as pltr from 'pltr/v2'
import {
  DeleteConfirmModal,
  ColorPickerColor,
  ItemsManagerModal as UnconnectedItemsManagerModal,
  ListItem,
  PlottrModal as UnconnectedPlottrModal,
  EditAttribute as UnconnectedEditAttribute,
  RichText as UnconnectedRichText,
  editorRegistry,
  Image as UnconnectedImage,
  ImagePicker as UnconnectedImagePicker,
  MiniColorPicker,
  Spinner,
  FunSpinner,
  InputModal,
  ColorPicker as UnconnectedColorPicker,
  Switch,
  CardTemplateDetails,
  PlotlineTemplateDetails as UnconnectedPlotlineTemplateDetails,
  TemplateCreate as UnconnectedTemplateCreate,
  TemplateEdit,
  TemplatePicker as UnconnectedTemplatePicker,
  Beamer as UnconnectedBeamer,
  LanguagePicker as UnconnectedLanguagePicker,
  CategoryPicker as UnconnectedCategoryPicker,
  CharacterCategoriesModal as UnconnectedCharacterCategoriesModal,
  CharacterDetails as UnconnectedCharacterDetails,
  CharacterEditDetails as UnconnectedCharacterEditDetails,
  CharacterItem as UnconnectedCharacterItem,
  CharacterListView as UnconnectedCharacterListView,
  CustomAttrFilterList as UnconnectedCustomAttrFilterList,
  BookFilterList as UnconnectedBookFilterList,
  CharacterCategoryFilterList as UnconnectedCharacterCategoryFilterList,
  CharactersFilterList as UnconnectedCharactersFilterList,
  PlacesFilterList as UnconnectedPlacesFilterList,
  TagFilterList as UnconnectedTagFilterList,
  GenericFilterList,
  CardColorFilterList,
  SortList as UnconnectedSortList,
  CharacterView as UnconnectedCharacterView,
  BookSelectList as UnconnectedBookSelectList,
  ActsConfigModal as UnconnectedActsConfigModal,
  AskToSaveModal,
  ErrorBoundary as UnconnectedErrorBoundary,
  DashboardErrorBoundary as UnconnectedDashboardErrorBoundary,
  SelectList as UnconnectedSelectList,
  TagLabel,
  CustomAttributeModal as UnconnectedCustomAttributeModal,
  SubNav as UnconnectedSubNav,
  ProjectTemplateDetails,
  CharacterTemplateDetails,
} from '../components'

const connector = {
  redux: {
    connect,
    bindActionCreators,
  },
  pltr,
}

// Platform is an object which provides features which are specific to
// a given platform.  For example, opening a file or a URL.
//
// It should provide the following functions:
// {
//   electron: Object?,
//   openExternal: (Url) => IO,
//   log: {
//     info: (String) => IO,
//     error: (String) => IO,
//     warn: (String) => IO,
//   },
//   createErrorReport: (String) => IO,
//   appVersion: String,
//   template: {
//     listTemplates,
//     listCustomTemplates,
//     deleteTemplate,
//     editTemplateDetails,
//     startSaveAsTemplate,
//     saveTemplate,
//   },
//   electron?: Electron,
//   settings: {
//     get: String => Any
//   },
//   user: {
//     get: String => Any
//   },
//   os: string,
//   isDevelopment: bool,
//   isWindows: bool,
//   node: {
//     env: string,
//   }
//   rollbar: {
//     rollbarAccessToken: string,
//     platform: string,
//   }
// }

export default (platform) => {
  var connectorObject = { ...connector, platform }
  return {
    DeleteConfirmModal,
    ColorPickerColor,
    ItemsManagerModal: UnconnectedItemsManagerModal(connectorObject),
    ListItem,
    PlottrModal: UnconnectedPlottrModal(connectorObject),
    EditAttribute: UnconnectedEditAttribute(connectorObject),
    RichText: UnconnectedRichText(connectorObject),
    editorRegistry,
    Image: UnconnectedImage(connectorObject),
    ImagePicker: UnconnectedImagePicker(connectorObject),
    MiniColorPicker,
    Spinner,
    FunSpinner,
    InputModal,
    ColorPicker: UnconnectedColorPicker(connectorObject),
    Switch,
    CardTemplateDetails,
    PlotlineTemplateDetails: UnconnectedPlotlineTemplateDetails(connectorObject),
    TemplateCreate: UnconnectedTemplateCreate(connectorObject),
    TemplateEdit,
    TemplatePicker: UnconnectedTemplatePicker(connectorObject),
    Beamer: UnconnectedBeamer(connectorObject),
    LanguagePicker: UnconnectedLanguagePicker(connectorObject),
    CategoryPicker: UnconnectedCategoryPicker(connectorObject),
    CharacterCategoriesModal: UnconnectedCharacterCategoriesModal(connectorObject),
    CharacterDetails: UnconnectedCharacterDetails(connectorObject),
    CharacterEditDetails: UnconnectedCharacterEditDetails(connectorObject),
    CharacterItem: UnconnectedCharacterItem(connectorObject),
    CharacterListView: UnconnectedCharacterListView(connectorObject),
    CustomAttrFilterList: UnconnectedCustomAttrFilterList(connectorObject),
    BookFilterList: UnconnectedBookFilterList(connectorObject),
    CharacterCategoryFilterList: UnconnectedCharacterCategoryFilterList(connectorObject),
    CharactersFilterList: UnconnectedCharactersFilterList(connectorObject),
    PlacesFilterList: UnconnectedPlacesFilterList(connectorObject),
    TagFilterList: UnconnectedTagFilterList(connectorObject),
    GenericFilterList,
    CardColorFilterList,
    SortList: UnconnectedSortList(connectorObject),
    CharacterView: UnconnectedCharacterView(connectorObject),
    BookSelectList: UnconnectedBookSelectList(connectorObject),
    ActsConfigModal: UnconnectedActsConfigModal(connectorObject),
    AskToSaveModal,
    ErrorBoundary: UnconnectedErrorBoundary(connectorObject),
    DashboardErrorBoundary: UnconnectedDashboardErrorBoundary(connectorObject),
    SelectList: UnconnectedSelectList(connectorObject),
    TagLabel,
    CustomAttributeModal: UnconnectedCustomAttributeModal(connectorObject),
    SubNav: UnconnectedSubNav(connectorObject),
    ProjectTemplateDetails,
    CharacterTemplateDetails,
  }
}
