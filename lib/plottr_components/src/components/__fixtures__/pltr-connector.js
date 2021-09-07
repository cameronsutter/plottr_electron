import React from 'react'
import * as pltr from 'pltr/v2'
import fileState from './example-state'

const identity = (x) => x

const state = { present: fileState }

const connector = {
  redux: {
    connect: (mapStateToProps, mapDispatchToProps) => (Component) => {
      const TheComponent = (props) => {
        return (
          <Component
            {...(mapStateToProps ? mapStateToProps(state, props) : {})}
            {...(mapDispatchToProps ? mapDispatchToProps(identity, props) : {})}
            {...props}
          />
        )
      }
      return TheComponent
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
    settings: {},
    openExternal: () => {},
    createErrorReport: () => {},
    log: {
      error: () => {},
      warn: () => {},
      info: () => {},
    },
    storage: {},
  },
}

export default connector
