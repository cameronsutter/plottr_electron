import React from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'
import { tabs } from '../../utils/tabs'

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
