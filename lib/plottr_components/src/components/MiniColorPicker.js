import React, { useEffect, useState, useRef } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'
import { colors } from 'pltr/v2'

import Button from './Button'

const { reds, oranges, greens, blues, purples, grays, whites, browns, defaults } = colors

const MiniColorPickerConnector = (connector) => {
  const MiniColorPicker = (props) => {
    const pickerRef = useRef(null)
    const [coords, setCoords] = useState({})

    useEffect(() => {
      const el = props.el?.current
      if (el && el.children[0]) setCoords(el.children[0].getBoundingClientRect())
    }, [props.el])

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside)

      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        props.close()
      }
    }

    const useCoords = () => {
      if (!coords.x) return {}

      // 35 = height of this button
      return { top: coords.y + 35 }
    }

    const renderColor = (color) => {
      return (
        <Button
          title={color}
          onMouseDown={() => props.chooseColor(color)}
          style={{ backgroundColor: color }}
        ></Button>
      )
    }

    return (
      <div
        className={cx('mini-color-picker', { darkmode: props.darkMode })}
        style={props.position || useCoords()}
        ref={pickerRef}
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
