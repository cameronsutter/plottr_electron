import React from 'react'
import PropTypes from 'react-proptypes'
import RichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'

const RichText = (props) => {
  if (props.editable) {
    return <RichTextEditor text={props.description} className={props.className} onChange={props.onChange} autoFocus={props.autofocus} darkMode={props.darkMode}/>
  } else {
    return <RichTextViewer text={props.description} className={props.className}/>
  }
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