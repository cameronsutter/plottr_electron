import React from 'react'
import PropTypes from 'react-proptypes'
import RichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import UnconnectedRCEBoundary from './RCEBoundary'
import { addRecent, getFonts, getRecent } from './fonts'

const RichTextConnector = (connector) => {
  const RCEBoundary = UnconnectedRCEBoundary(connector)

  const {
    platform: { openExternal, log, createErrorReport },
  } = connector

  const RichText = (props) => {
    let body = null
    if (props.editable) {
      body = (
        <RichTextEditor
          className={props.className}
          onChange={props.onChange}
          autoFocus={props.autofocus}
          text={props.description}
          darkMode={props.darkMode}
          fonts={getFonts(props.os)}
          recentFonts={getRecent()}
          addRecent={addRecent}
          openExternal={openExternal}
        />
      )
    } else {
      body = (
        <RichTextViewer
          text={props.description}
          className={props.className}
          openExternal={openExternal}
          log={log}
        />
      )
    }

    return (
      <RCEBoundary createErrorReport={createErrorReport} log={log} openExternal={openExternal}>
        {body}
      </RCEBoundary>
    )
  }

  RichText.propTypes = {
    description: PropTypes.any,
    onChange: PropTypes.func,
    editable: PropTypes.bool,
    autofocus: PropTypes.bool,
    className: PropTypes.string,
    darkMode: PropTypes.bool.isRequired,
    os: PropTypes.oneOf(['windows', 'linux', 'macos']),
  }

  return RichText
}

export default RichTextConnector
