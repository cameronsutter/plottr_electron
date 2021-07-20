import React from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'
import { IoMdContact, IoIosDocument, IoMdSettings, IoIosHelpBuoy, IoMdTime } from 'react-icons/io'
// IoIosBrowsers
// (for templates tab)

export const tabs = [
  { name: t('Account'), view: 'account', icon: <IoMdContact /> },
  { name: t('Files'), view: 'files', icon: <IoIosDocument /> },
  { name: t('Backups'), view: 'backups', icon: <IoMdTime /> },
  { name: t('Settings'), view: 'options', icon: <IoMdSettings /> },
  { name: t('Help'), view: 'help', icon: <IoIosHelpBuoy /> },
]
// {name: t('Templates'), view: 'templates', icon: <IoIosBrowsers/>}, // alternative: IoIosAlbums

export default function DashboardNavigation({ currentView, setView }) {
  const renderTabs = () => {
    return tabs.map((t) => {
      const selected = currentView == t.view
      return (
        <div
          key={t.view}
          className={cx('dashboard__navigation-tab', { selected })}
          onClick={() => setView(t.view)}
        >
          <div>{t.icon}</div>
          <div>{t.name}</div>
        </div>
      )
    })
  }

  return <nav>{renderTabs()}</nav>
}

DashboardNavigation.propTypes = {
  currentView: PropTypes.string,
  setView: PropTypes.func,
}
