import { connect, bindActionCreators } from 'react-redux'
import { shell, ipcRenderer, remote } from 'electron'
import { pltr } from 'plottr_components/connections'

import {
  listTemplates,
  listCustomTemplates,
  deleteTemplate,
  editTemplateDetails,
} from './common/utils/templates'
import log from 'electron-log'
import { createErrorReport } from './common/utils/full_error_report'
import SETTINGS from './common/utils/settings'

const connector = {
  redux: {
    connect,
    bindActionCreators,
  },
  pltr,
  platform: {
    appVersion: '2021.4.6',
    template: {
      listTemplates,
      listCustomTemplates,
      deleteTemplate,
      editTemplateDetails,
      startSaveAsTemplate: () => {
        const win = remote.getCurrentWindow()
        ipcRenderer.sendTo(win.webContents.id, 'save-as-template-start', 'plotlines') // sends this message to this same process
      },
    },
    settings: SETTINGS,
    openExternal: shell.openExternal,
    createErrorReport,
    log,
  },
}

export default pltr(connector)
