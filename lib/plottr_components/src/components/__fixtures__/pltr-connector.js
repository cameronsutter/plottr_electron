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
    os: 'unknown',
    undo: () => {},
    redo: () => {},
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
    publishRCEOperations: () => {},
    fetchRCEOperations: () => {},
    listenForChangesToEditor: () => {},
    deleteChangeSignal: () => {},
    deleteOldChanges: () => {},
    listenForRCELock: (a, b, c, cb) => {
      cb({})
    },
    lockRCE: () => Promise.resolve({}),
    storage: {
      // TODO: update when the firebase sync PR is merged!
      imagePublicURL: () => Promise.resolve(''),
      isStorageURL: () => false,
      resolveToPublicUrl: () => {},
      saveImageToStorageBlob: () => {},
    },
  },
}

export default connector
