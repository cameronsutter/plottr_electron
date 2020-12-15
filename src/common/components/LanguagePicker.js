import React from 'react'
import { localeNames, getCurrentLocale } from '../../../locales'
import SETTINGS from '../utils/settings'

export default function LanguagePicker (props) {

  const onSelect = (event) => {
    SETTINGS.set('locale', event.target.value)
  }

  const renderedOptions = Object.entries(localeNames).map(entry => {
    return <option key={entry[0]} value={entry[0]}>{entry[1]}</option>
  })
  return <select onChange={onSelect} value={getCurrentLocale(SETTINGS)}>
    { renderedOptions }
  </select>
}