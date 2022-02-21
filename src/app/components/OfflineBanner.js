import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { FaSignal } from 'react-icons/fa'

import { selectors } from 'pltr/v2'

import { t } from 'plottr_locales'

const OfflineBanner = ({ isOffline, shouldBeInPro }) => {
  return isOffline && shouldBeInPro ? (
    <div className="offline-mode-banner">
      {t('Offline')}
      <FaSignal />
    </div>
  ) : null
}

OfflineBanner.propTypes = {
  isOffline: PropTypes.bool,
  shouldBeInPro: PropTypes.bool,
}

export default connect((state) => ({
  isOffline: selectors.isOfflineSelector(state.present),
  shouldBeInPro: selectors.shouldBeInProSelector(state.present),
}))(OfflineBanner)
