import React, { Component, PropTypes } from 'react'
import Modal from 'react-modal'
import colors from '../constants/CSScolors'
import { Button } from 'react-bootstrap'

const customStyles = {content: {top: '70px'}}

class ColorPicker extends Component {
  closeDialog (color = null) {
    this.props.closeDialog(color)
  }

  render () {
    return (<Modal isOpen={true} onRequestClose={this.closeDialog.bind(this)} style={customStyles}>
      <h1>Pick a color</h1>
      <div className='color-picker__box'>
        {this.renderColors()}
      </div>
    </Modal>)
  }

  renderColors () {
    return colors.map((c) => {
      return <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>
    })
  }

  renderColor (color) {
    return <Button bsSize='small' onClick={() => this.closeDialog(color)} style={{backgroundColor: color}}>{color}</Button>
  }
}

ColorPicker.propTypes = {
  closeDialog: PropTypes.func.isRequired
}

export default ColorPicker
