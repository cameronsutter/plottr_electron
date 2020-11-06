import React from 'react'
import t from 'format-message'
import { IoMdContact, IoIosDocument, IoMdSettings, IoIosHelpBuoy, IoMdTime, IoIosBrowsers } from 'react-icons/io'

export const tabs = [
  {name: t('Account'), view: 'account', icon: <IoMdContact/>},
  {name: t('Files'), view: 'files', icon: <IoIosDocument/>},
  {name: t('Templates'), view: 'templates', icon: <IoIosBrowsers/>}, // alternative: IoIosAlbums
  {name: t('Backups'), view: 'backups', icon: <IoMdTime/>},
  {name: t('Settings'), view: 'settings', icon: <IoMdSettings/>},
  {name: t('Help'), view: 'help', icon: <IoIosHelpBuoy/>},
]