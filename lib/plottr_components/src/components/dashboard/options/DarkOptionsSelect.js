import React from 'react'
import { PropTypes } from 'prop-types'
import { t as i18n } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

// FIXME: consolidate dark mode settings.  It's currently in `ui`,
// `appSettings` and on the file system and how it gets set varies
// depending on whether you're opening the file or whatever.  We
// should remove it from `ui` and only rely on the value from
// `appSettings` because whether we're in dark mode or not is not
// file-dependent.
const DarkOptionsSelect = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
      setDarkMode,
    },
  } = connector
  checkDependencies({ saveAppSetting, setDarkMode })

  const DarkOptionsSelect = ({ settings }) => {
    const changeSetting = (ev) => {
      saveAppSetting('user.dark', ev.target.value)
      setDarkMode(ev.target.value)
    }

    return (
      <select value={settings.user.dark || 'system'} onChange={changeSetting}>
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
