import React from 'react'
import { t as i18n } from 'plottr_locales'

import { checkDependencies } from '../../checkDependencies'

const DarkOptionsSelect = (connector) => {
  const {
    platform: { useSettingsInfo, setDarkMode },
  } = connector
  checkDependencies({ useSettingsInfo, setDarkMode })

  const DarkOptionsSelect = () => {
    const [settings, _, saveSetting] = useSettingsInfo()

    const changeSetting = (ev) => {
      saveSetting('user.dark', ev.target.value)
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

  return DarkOptionsSelect
}

export default DarkOptionsSelect
