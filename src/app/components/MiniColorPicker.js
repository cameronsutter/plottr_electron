import React, { useEffect, useState, useRef } from 'react'
import { findDOMNode } from 'react-dom'
import { Button } from 'react-bootstrap'
import i18n from 'format-message'
import cx from 'classnames'
import { colors } from 'pltr/v2'

const { reds, oranges, greens, blues, purples, grays, whites, browns, defaults } = colors

export default function MiniColorPicker(props) {
  const pickerRef = useRef(null)
  const [coords, setCoords] = useState({})

  useEffect(() => {
    const el = findDOMNode(props.el.current)
    setCoords(el.getBoundingClientRect())
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

    // 80 = width of color picker (100) - width of button (20)
    return { left: coords.x + 80, top: coords.y + 33 }
  }

  const renderColor = (color) => {
    return (
      <Button
        title={color}
        onClick={() => props.chooseColor(color)}
        style={{ backgroundColor: color }}
      ></Button>
    )
  }

  return (
    <div className="mini-color-picker" style={useCoords()} ref={pickerRef}>
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
