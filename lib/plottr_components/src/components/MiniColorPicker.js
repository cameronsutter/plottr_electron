import React from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'
import { colors } from 'pltr/v2'

import Button from './Button'

const { reds, oranges, greens, blues, purples, grays, whites, browns, defaults } = colors

const MiniColorPickerConnector = (connector) => {
  const MiniColorPicker = (props) => {
    const renderColor = (color) => {
      return (
        <Button
          title={color}
          onMouseDown={() => props.chooseColor(color)}
          style={{ backgroundColor: color }}
        ></Button>
      )
    }

    const communicateRefBack = (ref) => {
      if (props.childRef) props.childRef(ref)
    }

    return (
      <div
        ref={communicateRefBack}
        className={cx('mini-color-picker', { darkmode: props.darkMode })}
      >
        <p>{i18n('Default Colors')}</p>
        <div className="color-picker__box">
          {defaults.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Reds')}</p>
        <div className="color-picker__box">
          {reds.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Oranges')}</p>
        <div className="color-picker__box">
          {oranges.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Greens')}</p>
        <div className="color-picker__box">
          {greens.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Blues')}</p>
        <div className="color-picker__box">
          {blues.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Purples')}</p>
        <div className="color-picker__box">
          {purples.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Grays')}</p>
        <div className="color-picker__box">
          {grays.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Whites')}</p>
        <div className="color-picker__box">
          {whites.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
        <p>{i18n('Browns')}</p>
        <div className="color-picker__box">
          {browns.map((c) => (
            <div key={'color-picker-color-' + c} className="color-picker__choice">
              {renderColor(c)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  MiniColorPicker.propTypes = {
    childRef: PropTypes.func,
    el: PropTypes.object,
    close: PropTypes.func,
    chooseColor: PropTypes.func,
    darkMode: PropTypes.bool,
    position: PropTypes.object,
  }

  const {
    redux,
    pltr: { selectors },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => ({
      darkMode: selectors.isDarkModeSelector(state.present),
    }))(MiniColorPicker)
  }

  throw new Error('Could not connect MiniColorPicker')
}

export default MiniColorPickerConnector
