import React from 'react'
import { t as i18n } from 'plottr_locales'
import { useSettingsInfo } from '../../../common/utils/store_hooks'
import { ipcRenderer } from 'electron'

export default function DarkOptionsSelect() {
  const [settings, _, saveSetting] = useSettingsInfo()

  const changeSetting = (ev) => {
    saveSetting('user.dark', ev.target.value)
    ipcRenderer.send('pls-set-dark-setting', ev.target.value)
  }

  return (
    <select value={settings.user.dark || 'system'} onChange={changeSetting}>
      <option value="system">{i18n('System')}</option>
      <option value="dark">{i18n('Dark')}</option>
      <option value="light">{i18n('Light')}</option>
    </select>
  )
}
