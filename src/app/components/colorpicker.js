import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'react-proptypes'
import Modal from 'react-modal'
import { reds, oranges, greens, blues, purples, grays, whites, browns } from '../constants/CSScolors'
import { FormControl, FormGroup, ControlLabel, Button, Row, Col } from 'react-bootstrap'
import i18n from 'format-message'

const customStyles = {content: {top: '70px'}}

class ColorPicker extends Component {
  constructor (props) {
    super(props)
    this.state = {color: this.props.color}
  }

  closeDialog = (color) => {
    this.props.closeDialog(color)
  }

  showColor = () => {
    var newColor = ReactDOM.findDOMNode(this.refs.hexRef).value
    var regex = /#?([0123456789abcdef]{6})/
    var matches = regex.exec(newColor)
    if (matches) {
      this.setState({color: `#${matches[1]}`})
    } else {
      this.setState({color: newColor})
    }
  }

  render () {
    let klasses = 'color-picker__wrapper'
    if (this.props.darkMode == true) {
      klasses += ' darkmode'
      customStyles.content.backgroundColor = '#888'
    }
    return (<Modal isOpen={true} onRequestClose={() => this.closeDialog(this.props.color)} style={customStyles}>
      <div className={klasses}>
        <h2 className='color-picker__title'>{i18n('Pick a color')}</h2>
        <div className='color-picker__input-box form-horizontal'>
          <Row>
            <Col xs={5} >
              <h5 style={{marginTop: '26px'}} className='secondary-text'>{i18n('Click on a color below or type it in')}</h5>
            </Col>
            <Col xs={2} >
              <p style={{textAlign: 'right', marginTop: '32px'}}>{i18n('Current Color')}: </p>
            </Col>
            <Col xs={1} >
              <div title={this.state.color} style={{backgroundColor: this.state.color, marginTop: '16px'}} className='color-picker__show-color'></div>
            </Col>
            <Col xs={2}>
              <FormGroup>
                <ControlLabel>{i18n('hex code or name')}</ControlLabel>
                <FormControl type='text' ref='hexRef' placeholder='e.g. #ffffff'
                  defaultValue={this.state.color}
                  onKeyDown={(event) => {if (event.which === 27) this.closeDialog(this.state.color)}}
                  onKeyPress={(event) => {if (event.which === 13) this.closeDialog(this.state.color)}}
                  onChange={this.showColor} />
              </FormGroup>
            </Col>
            <Col xs={2}>
              <div style={{marginTop: '26px'}}>
                <Button bsStyle='success' onClick={() => this.closeDialog(this.state.color)}>{i18n('Choose')}</Button>
              </div>
            </Col>
          </Row>
        </div>
        <div>
          {this.renderColors()}
        </div>
      </div>
    </Modal>)
  }

  renderColors () {
    return <div className='color-picker__box-wrapper'>
      <p>{i18n('Reds')}</p>
      <div className='color-picker__box'>
        {reds.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Oranges')}</p>
      <div className='color-picker__box'>
        {oranges.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Greens')}</p>
      <div className='color-picker__box'>
        {greens.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Blues')}</p>
      <div className='color-picker__box'>
        {blues.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Purples')}</p>
      <div className='color-picker__box'>
        {purples.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Grays')}</p>
      <div className='color-picker__box'>
        {grays.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Whites')}</p>
      <div className='color-picker__box'>
        {whites.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
      <p>{i18n('Browns')}</p>
      <div className='color-picker__box'>
        {browns.map(c => <div key={'color-picker-color-' + c} className='color-picker__choice'>{this.renderColor(c)}</div>)}
      </div>
    </div>
  }

  renderColor (color) {
    return <Button title={color} onClick={() => this.closeDialog(color)} style={{backgroundColor: color}}></Button>
  }
}

ColorPicker.propTypes = {
  closeDialog: PropTypes.func.isRequired,
  color: PropTypes.string,
  darkMode: PropTypes.bool,
}

export default ColorPicker
