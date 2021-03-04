import React from 'react'
import { Button } from 'react-bootstrap'
import PropTypes from 'react-proptypes'

function ColorPickerColor({ color, choose, style }, ref) {
  return (
    <div className="color-picker__choice" ref={ref} style={style || {}}>
      <Button title={color} onClick={() => choose(color)} style={{ backgroundColor: color }} />
    </div>
  )
}

ColorPickerColor.propTypes = {
  color: PropTypes.string,
  choose: PropTypes.func,
  style: PropTypes.object,
}

export default React.forwardRef(ColorPickerColor)
