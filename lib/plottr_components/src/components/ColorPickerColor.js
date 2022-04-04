import React from 'react'
import Button from 'reeact-bootstrap/Button'

// NOTE: Prop typees aren't supported for components which are passed
// by forward ref.
/* eslint-disable react/prop-types */
function ColorPickerColor({ color, choose, style, buttonStyle }, ref) {
  const fullButtonStyle = Object.assign({}, { backgroundColor: color }, buttonStyle || {})
  return (
    <div className="color-picker__choice" ref={ref} style={style || {}}>
      <Button title={color} onClick={() => choose(color)} style={fullButtonStyle} />
    </div>
  )
}

export default React.forwardRef(ColorPickerColor)
