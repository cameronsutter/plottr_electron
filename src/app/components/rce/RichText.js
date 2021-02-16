import React from 'react'
import PropTypes from 'react-proptypes'
import RichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import RCEBoundary from './RCEBoundary'
import { helpers } from 'pltr/v2'
import { is } from 'electron-util'

const {
  fonts: { getFonts, getRecent, addRecent },
} = helpers

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
        fonts={getFonts(is)}
        recentFonts={getRecent()}
        addRecent={addRecent}
      />
    )
  } else {
    body = <RichTextViewer text={props.description} className={props.className} />
  }

  return <RCEBoundary>{body}</RCEBoundary>
}

RichText.propTypes = {
  description: PropTypes.any,
  onChange: PropTypes.func,
  editable: PropTypes.bool,
  autofocus: PropTypes.bool,
  className: PropTypes.string,
  darkMode: PropTypes.bool.isRequired,
}

export default RichText
