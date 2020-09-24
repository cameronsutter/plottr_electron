import React from 'react'
import PropTypes from 'react-proptypes'
import RichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'
import ErrorBoundary from '../../containers/ErrorBoundary'
import { getFonts, getRecent, addRecent } from '../../helpers/fonts'

const RichText = (props) => {
  let body = null
  if (props.editable) {
    body = <RichTextEditor
      className={props.className}
      onChange={props.onChange}
      autoFocus={props.autofocus}
      text={props.description}
      darkMode={props.darkMode}
      fonts={getFonts()}
      recentFonts={getRecent()}
      addRecent={addRecent}
    />
  } else {
    body = <RichTextViewer text={props.description} className={props.className}/>
  }

  return <ErrorBoundary>{ body }</ErrorBoundary>
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