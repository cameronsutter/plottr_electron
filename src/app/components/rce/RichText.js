import React from 'react'
import PropTypes from 'react-proptypes'
import RichTextEditor from './RichTextEditor'
import RichTextViewer from './RichTextViewer'

const RichText = (props) => {

  // TODO: use darkmode

  if (props.editable) {
    return <RichTextEditor text={props.description} onChange={props.onChange} autoFocus={props.autofocus}/>
  } else {
    return <RichTextViewer text={props.description}/>
  }
}


RichText.propTypes = {
  description: PropTypes.any,
  onChange: PropTypes.func,
  editable: PropTypes.bool,
  autofocus: PropTypes.bool,
  darkMode: PropTypes.bool.isRequired,
}

export default RichText