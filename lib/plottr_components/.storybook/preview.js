import React from 'react'
import { setupI18n } from 'plottr_locales'
import '../src/css/components.scss'
import '../src/css/fonts.css'
import * as pltr from 'pltr/v2'
import fileState from './example-state'

setupI18n(
  {
    get: () => null,
  },
  {}
)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
}

const identity = (x) => x

const state = { present: fileState }

global.connector = {
  redux: {
    connect: (mapStateToProps, mapDispatchToProps) => (Component) => (props) => {
      return (
        <Component
          {...(mapStateToProps ? mapStateToProps(state, props) : {})}
          {...(mapDispatchToProps && typeof mapDispatchToProps === 'function' ? mapDispatchToProps(identity, props) : (typeof mapDispatchToProps === 'object' ? mapDispatchToProps : {}))}
          {...props}
        />
      )
    },
    bindActionCreators: identity,
  },
  pltr,
  platform: {
    appVersion: '2021.4.6',
    template: {
      listTemplates: () => [],
      listCustomTemplates: () => [],
      deleteTemplate: () => {},
      editTemplateDetails: () => {},
      startSaveAsTemplate: () => {},
      saveTemplate: () => {},
    },
    settings: {
      get: () => undefined,
    },
    openExternal: () => {},
    createErrorReport: () => {},
    log: {
      error: () => {},
      warn: () => {},
      info: () => {},
    },
    user: {
      get: () => {}
    },
    os: 'windows',
    isDevelopment: false,
    isWindows: true,
    dialog: {},
    node: {
      env: 'production',
    },
    rollbar: {
      rollbarAccessToken: '',
      platform: 'windows',
    },
    export: {
      askToExport: () => {},
      export_config: {},
    },
    store: {
      useExportConfigInfo: () => {},
    },
    moveFromTemp: () => {},
    showItemInFolder: () => {},
    tempFilesPath: '',
  }
}
