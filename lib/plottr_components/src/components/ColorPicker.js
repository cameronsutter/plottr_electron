import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { FormControl, FormGroup, ControlLabel, Button, Row, Col } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import { colors } from 'pltr/v2'
import { defaultStyles } from 'react-modal'
import UnconnectedPlottrModal from './PlottrModal'
import ColorPickerColor from './ColorPickerColor'

const { reds, oranges, greens, blues, purples, grays, whites, browns, defaults } = colors

const ColorPickerConnector = (connector) => {
  const PlottrModal = UnconnectedPlottrModal(connector)

  class ColorPicker extends Component {
    constructor(props) {
      super(props)
      this.state = { color: this.props.color }

      this.hexRef = null
    }

    componentDidMount() {
      window.SCROLLWITHKEYS = false
    }

    componentWillUnmount() {
      window.SCROLLWITHKEYS = true
    }

    closeDialog = (color) => {
      this.props.closeDialog(color)
    }

    showColor = () => {
      var newColor = this.hexRef.value
      var regex = /#?([0123456789abcdef]{6})/
      var matches = regex.exec(newColor)
      if (matches) {
        this.setState({ color: `#${matches[1]}` })
      } else {
        this.setState({ color: newColor })
      }
    }

    render() {
      return (
        <PlottrModal
          isOpen={true}
          onRequestClose={() => this.closeDialog(this.props.color)}
          styles={(defaultStyles, 'zIndex:1002')}
        >
          <div className="color-picker__wrapper">
            <h2 className="color-picker__title">{i18n('Pick a color')}</h2>
            <div className="color-picker__input-box form-horizontal">
              <Row>
                <Col xs={5}>
                  <h5 style={{ marginTop: '26px' }} className="secondary-text">
                    {i18n('Click on a color below or type it in')}
                  </h5>
                </Col>
                <Col xs={2}>
                  <p style={{ textAlign: 'right', marginTop: '32px' }}>{i18n('Current Color')}: </p>
                </Col>
                <Col xs={1}>
                  <div
                    title={this.state.color}
                    style={{ backgroundColor: this.state.color, marginTop: '16px' }}
                    className="color-picker__show-color"
                  ></div>
                </Col>
                <Col xs={2}>
                  <FormGroup>
                    <ControlLabel>{i18n('hex code or name')}</ControlLabel>
                    <FormControl
                      type="text"
                      inputRef={(ref) => {
                        this.hexRef = ref
                      }}
                      placeholder="e.g. #ffffff"
                      defaultValue={this.state.color}
                      onKeyDown={(event) => {
                        if (event.which === 27) this.closeDialog(this.state.color)
                      }}
                      onKeyPress={(event) => {
                        if (event.which === 13) this.closeDialog(this.state.color)
                      }}
                      onChange={this.showColor}
                    />
                  </FormGroup>
                </Col>
                <Col xs={2}>
                  <div style={{ marginTop: '26px' }}>
                    <Button bsStyle="success" onClick={() => this.closeDialog(this.state.color)}>
                      {i18n('Choose')}
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
            <div>{this.renderColors()}</div>
          </div>
        </PlottrModal>
      )
    }

    renderColors() {
      return (
        <div className="color-picker__box-wrapper">
          <p>{i18n('Default Colors')}</p>
          <div className="color-picker__box">
            {defaults.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Reds')}</p>
          <div className="color-picker__box">
            {reds.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Oranges')}</p>
          <div className="color-picker__box">
            {oranges.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Greens')}</p>
          <div className="color-picker__box">
            {greens.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Blues')}</p>
          <div className="color-picker__box">
            {blues.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Purples')}</p>
          <div className="color-picker__box">
            {purples.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Grays')}</p>
          <div className="color-picker__box">
            {grays.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Whites')}</p>
          <div className="color-picker__box">
            {whites.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
          <p>{i18n('Browns')}</p>
          <div className="color-picker__box">
            {browns.map((c) => (
              <ColorPickerColor
                key={`color-picker-color-${c}`}
                color={c}
                choose={this.closeDialog}
              />
            ))}
          </div>
        </div>
      )
    }

    renderColor(color) {
      return (
        <Button
          title={color}
          onClick={() => this.closeDialog(color)}
          style={{ backgroundColor: color }}
        ></Button>
      )
    }
  }

  ColorPicker.propTypes = {
    closeDialog: PropTypes.func.isRequired,
    color: PropTypes.string,
    darkMode: PropTypes.bool,
  }

  return ColorPicker
}

export default ColorPickerConnector
