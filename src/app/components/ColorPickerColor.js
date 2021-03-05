import React from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'react-proptypes'

function ColorPickerColor({ color, choose, style, buttonStyle }, ref) {
  const fullButtonStyle = Object.assign({}, { backgroundColor: color }, buttonStyle || {})
  return (
    <div className="color-picker__choice" ref={ref} style={style || {}}>
      <Button title={color} onClick={() => choose(color)} style={fullButtonStyle} />
    </div>
  )
}

ColorPickerColor.propTypes = {
  color: PropTypes.string,
  choose: PropTypes.func,
  style: PropTypes.object,
  buttonStyle: PropTypes.object,
}

export default React.forwardRef(ColorPickerColor)
