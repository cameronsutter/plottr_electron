import { t } from 'plottr_locales'
import { reloadWindow } from '../windows'
import { takeScreenshot } from '../helpers'

function buildViewMenu() {
  const submenu = [
    {
      label: t('Reload'),
      accelerator: 'CmdOrCtrl+R',
      click: reloadWindow,
    },
    {
      label: t('Take Screenshot') + '...',
      accelerator: 'CmdOrCtrl+P',
      click: takeScreenshot,
    },
  ]

  return {
    label: t('View'),
    submenu: submenu,
  }
}

export { buildViewMenu }
