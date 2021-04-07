import React from 'react'
import PropTypes from 'react-proptypes'
import { localeNames, getCurrentLocale } from 'plottr_locales'

const LanguagePickerConnector = (connector) => {
  const { platform } = connector
  const { settings } = platform

  function LanguagePicker({ onSelectLanguage }) {
    const onSelect = (event) => {
      onSelectLanguage(event.target.value)
    }

    const renderedOptions = Object.entries(localeNames).map((entry) => {
      return (
        <option key={entry[0]} value={entry[0]}>
          {entry[1]}
        </option>
      )
    })
    return (
      <select onChange={onSelect} value={getCurrentLocale(settings, platform)}>
        {renderedOptions}
      </select>
    )
  }

  LanguagePicker.propTypes = {
    onSelectLanguage: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    platform: PropTypes.object.isRequired,
  }

  return LanguagePicker
}

export default LanguagePickerConnector
