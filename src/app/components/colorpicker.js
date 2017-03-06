import React, { Component, PropTypes } from 'react'
import Modal from 'react-modal'
import colors from '../constants/CSScolors'
import { Input, Button, Row, Col } from 'react-bootstrap'

const customStyles = {content: {top: '70px'}}

class ColorPicker extends Component {
  constructor (props) {
    super(props)
    this.state = {color: null}
  }

  closeDialog (color = null) {
    this.props.closeDialog(color)
  }

  showColor () {
    var newColor = this.refs.hex.getValue()
    var regex = /#?([0123456789abcdef]{6})/
    var matches = regex.exec(newColor)
    if (matches) {
      this.setState({color: `#${matches[1]}`})
    } else {
      this.setState({color: newColor})
    }
  }

  render () {
    return (<Modal isOpen={true} onRequestClose={this.closeDialog.bind(this)} style={customStyles}>
      <h2 className='color-picker__title'>Pick a color</h2>
      <div className='color-picker__input-box form-horizontal'>
        <Row>
          <Col xs={3} />
          <Col xs={4}>
            <p style={{textAlign: 'right', marginTop: '32px'}}>Click on a color below or type a color here: </p>
          </Col>
          <Col xs={2}>
            <Input type='text' label='hex code' ref='hex' placeholder='e.g. #ffffff' onChange={this.showColor.bind(this)} />
          </Col>
          <Col xs={2}>
            <div style={{marginTop: '18px'}}>
              <div style={{backgroundColor: this.state.color}} className='color-picker__show-color'></div>
              <Button bsStyle='success' onClick={() => this.closeDialog(this.state.color)}>Choose</Button>
            </div>
          </Col>
        </Row>
      </div>
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
    return <Button title={color} onClick={() => this.closeDialog(color)} style={{backgroundColor: color}}></Button>
  }
}

ColorPicker.propTypes = {
  closeDialog: PropTypes.func.isRequired
}

export default ColorPicker
