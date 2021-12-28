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
global.state = state

const EXPORT_CONFIG = {
  saveSettings: true,
  savedType: 'word',
  scrivener: {
    general: {},
    outline: {
      export: true,
      columnOrRow: 'column',
      sceneCards: true,
      plotlineInTitle: true,
      attachments: true,
      description: true,
      descriptionHeading: true,
      where: 'synopsis',
      customAttributes: true,
      templates: true,
      filter: null,
    },
    characters: {
      export: true,
      heading: true,
      description: true,
      descriptionHeading: true,
      attachments: true,
      notesHeading: true,
      notes: true,
      customAttributes: true,
      templates: true,
      tags: true,
      categoryHeading: true,
      category: true,
    },
    places: {
      export: true,
      heading: true,
      description: true,
      descriptionHeading: true,
      attachments: true,
      notesHeading: true,
      notes: true,
      customAttributes: true,
      tags: true,
    },
    notes: {
      export: true,
      heading: true,
      attachments: true,
      content: true,
    },
  },
  word: {
    general: {
      titlePage: true,
    },
    outline: {
      export: true,
      columnOrRow: 'column',
      heading: true,
      sceneCards: true,
      plotlineInTitle: true,
      attachments: true,
      description: true,
      customAttributes: true,
      templates: true,
      filter: null,
    },
    characters: {
      export: true,
      heading: true,
      images: true,
      descriptionHeading: true,
      description: true,
      attachments: true,
      notesHeading: true,
      notes: true,
      customAttributes: true,
      templates: true,
      categoryHeading: true,
      category: true,
    },
    places: {
      export: true,
      heading: true,
      images: true,
      descriptionHeading: true,
      description: true,
      attachments: true,
      notesHeading: true,
      notes: true,
      customAttributes: true,
    },
    notes: {
      export: true,
      heading: true,
      images: true,
      attachments: true,
      content: true,
    },
  },
}

global.connector = {
  redux: {
    connect: (mapStateToProps, mapDispatchToProps) => (Component) => (props) => {
      let derivedState = mapStateToProps ? mapStateToProps(state, props) : {}
      if (typeof derivedState === 'function') {
        derivedState = derivedState(state, props)
      }

      return (
        <Component
          {...derivedState}
          {...(mapDispatchToProps && typeof mapDispatchToProps === 'function'
            ? mapDispatchToProps(identity, props)
            : typeof mapDispatchToProps === 'object'
            ? mapDispatchToProps
            : {})}
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
      get: () => {},
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
      useExportConfigInfo: () => [EXPORT_CONFIG, {}, {}],
    },
    moveFromTemp: () => {},
    showItemInFolder: () => {},
    tempFilesPath: '',
  },
}
