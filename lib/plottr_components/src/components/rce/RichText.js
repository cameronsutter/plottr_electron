import React from 'react'
import PropTypes from 'react-proptypes'
import UnconnectedRichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import UnconnectedRCEBoundary from './RCEBoundary'

const RichTextConnector = (connector) => {
  const RCEBoundary = UnconnectedRCEBoundary(connector)
  const RichTextEditor = UnconnectedRichTextEditor(connector)

  const {
    platform: {
      storage: { imagePublicURL, isStorageURL },
      openExternal,
      log,
      createErrorReport,
    },
  } = connector

  const RichText = (props) => {
    let body = null
    if (props.editable) {
      body = (
        <RichTextEditor
          id={props.id}
          fileId={props.fileId}
          className={props.className}
          onChange={props.onChange}
          autoFocus={props.autofocus}
          selection={props.selection}
          text={props.description}
          darkMode={props.darkMode}
        />
      )
    } else {
      // TODO: support live watching(?)
      body = (
        <RichTextViewer
          text={props.description}
          className={props.className}
          openExternal={openExternal}
          log={log}
          imagePublicURL={imagePublicURL}
          isStorageURL={isStorageURL}
        />
      )
    }

    return (
      <RCEBoundary createErrorReport={createErrorReport} openExternal={openExternal}>
        {body}
      </RCEBoundary>
    )
  }

  RichText.propTypes = {
    id: PropTypes.string,
    fileId: PropTypes.string,
    description: PropTypes.any,
    selection: PropTypes.object,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
    autofocus: PropTypes.bool,
    className: PropTypes.string,
    darkMode: PropTypes.bool.isRequired,
  }

  return RichText
}

export default RichTextConnector
