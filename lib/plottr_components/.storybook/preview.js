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
          {...(mapDispatchToProps ? mapDispatchToProps(identity, props) : {})}
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
    },
    settings: {
      get: () => undefined
    },
    openExternal: () => {},
    createErrorReport: () => {},
    openExternal: () => {},
    log: {
      error: () => {},
      warn: () => {},
      info: () => {},
    },
  },
}
