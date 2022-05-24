import React from 'react'
import { PropTypes } from 'prop-types'
import { t as i18n } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const DarkOptionsSelect = (connector) => {
  const {
    platform: {
      setDarkMode,
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({ setDarkMode, saveAppSetting })

  const DarkOptionsSelect = ({ settings }) => {
    const changeSetting = (ev) => {
      switch (ev.target.value) {
        case 'system': {
          saveAppSetting('user.themeSource', 'system')
          break
        }
        case 'light': {
          saveAppSetting('user.themeSource', 'manual')
          saveAppSetting('user.dark', 'light')
          break
        }
        case 'dark': {
          saveAppSetting('user.themeSource', 'manual')
          saveAppSetting('user.dark', 'dark')
          break
        }
      }
      // This, if present, talks to the external world to let it know
      // about the change.
      setDarkMode(ev.target.value)
    }

    const themeSource = settings.user.themeSource
    const selectedValue = settings.user.dark || 'system'

    return (
      <select value={themeSource === 'system' ? 'system' : selectedValue} onChange={changeSetting}>
        <option value="system">{i18n('System')}</option>
        <option value="dark">{i18n('Dark')}</option>
        <option value="light">{i18n('Light')}</option>
      </select>
    )
  }

  DarkOptionsSelect.propTypes = {
    settings: PropTypes.object.isRequired,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      settings: selectors.appSettingsSelector(state.present),
    }))(DarkOptionsSelect)
  }

  throw new Error('Could not connect DarkOptionsSelect')
}

export default DarkOptionsSelect
