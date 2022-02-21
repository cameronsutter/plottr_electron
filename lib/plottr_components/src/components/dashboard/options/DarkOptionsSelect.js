import React from 'react'
import { PropTypes } from 'prop-types'
import { t as i18n } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const DarkOptionsSelect = (connector) => {
  const {
    platform: {
      settings: { saveAppSetting },
    },
  } = connector
  checkDependencies({ saveAppSetting })

  const DarkOptionsSelect = ({ settings }) => {
    const changeSetting = (ev) => {
      saveAppSetting('user.dark', ev.target.value)
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
