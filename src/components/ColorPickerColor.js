import React from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'react-proptypes'

function ColorPickerColor({ color, choose, style, buttonStyle, mini }, ref) {
  const fullButtonStyle = Object.assign({}, { backgroundColor: color }, buttonStyle || {})
  const className = `color-picker__choice ${mini ? 'color-picker__choice-mini' : ''}`
  return (
    <div className={className} ref={ref} style={style || {}}>
      <Button title={color} onClick={() => choose(color)} style={fullButtonStyle} />
    </div>
  )
}

ColorPickerColor.propTypes = {
  mini: PropTypes.bool,
  color: PropTypes.string.isRequired,
  choose: PropTypes.func.isRequired,
  style: PropTypes.object,
  buttonStyle: PropTypes.object,
}

export default React.forwardRef(ColorPickerColor)
