import React, { useState, useEffect } from 'react'
import { PropTypes } from 'react-proptypes'

import UnconnectedLanguagePicker from '../../../dist/components/LanguagePicker'

import { t, setupI18n } from 'plottr_locales'

const LanguagePicker = UnconnectedLanguagePicker(global.connector)

export default {
  title: 'Plottr/LanguagePicker',
  component: LanguagePicker,
  argTypes: {
    language: { control: { type: 'select', options: ['en', 'fr', 'es'] } },
  },
}

const EN_SETTINGS = {
  get: (setting) => {
    if (setting === 'locale') return 'en'
    return undefined
  },
}

const FR_SETTINGS = {
  get: (setting) => {
    if (setting === 'locale') return 'fr'
    return undefined
  },
}

const ES_SETTINGS = {
  get: (setting) => {
    if (setting === 'locale') return 'es'
    return undefined
  },
}

const switchLocale = (locale) => {
  switch (locale) {
    case 'en':
      return EN_SETTINGS
    case 'fr':
      return FR_SETTINGS
    case 'es':
      return ES_SETTINGS
  }
  return EN_SETTINGS
}

const Template = ({ language }) => {
  const [currentLanguage, setCurrentLanguage] = useState(language)

  useEffect(() => {
    setCurrentLanguage(language)
  }, [language])

  // setupI18n(switchLocale(language), {})

  return (
    <div>
      <LanguagePicker
        onSelectLanguage={(newLanguage) => {
          setCurrentLanguage(newLanguage)
          setupI18n(switchLocale(newLanguage), {})
        }}
        settings={switchLocale(currentLanguage)}
        platform={{}}
      />
      {t('Timeline')}
    </div>
  )
}

Template.propTypes = {
  language: PropTypes.string.isRequired,
}

export const Example = Template.bind({})
Example.args = {
  language: 'en',
}
