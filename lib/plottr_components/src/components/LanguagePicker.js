import React, { useState } from 'react'
import PropTypes from 'react-proptypes'
import { localeNames, getCurrentLocale } from 'plottr_locales'

import { checkDependencies } from './checkDependencies'

const LanguagePickerConnector = (connector) => {
  const { platform } = connector
  const { settings } = platform

  checkDependencies({ settings })

  function LanguagePicker({ onSelectLanguage }) {
    const [locale, setLocale] = useState(getCurrentLocale(settings, platform))

    const onSelect = (event) => {
      onSelectLanguage(event.target.value)
      setLocale(getCurrentLocale(settings, platform))
    }

    const renderedOptions = Object.entries(localeNames).map((entry) => {
      return (
        <option key={entry[0]} value={entry[0]}>
          {entry[1]}
        </option>
      )
    })
    return (
      <select onChange={onSelect} value={locale}>
        {renderedOptions}
      </select>
    )
  }

  LanguagePicker.propTypes = {
    onSelectLanguage: PropTypes.func.isRequired,
  }

  return LanguagePicker
}

export default LanguagePickerConnector
