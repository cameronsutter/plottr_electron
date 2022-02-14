import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'
import { FaSignal } from 'react-icons/fa'

import { selectors } from 'pltr/v2'

import { t } from 'plottr_locales'

const OfflineBanner = ({ isInOfflineMode }) => {
  return isInOfflineMode ? (
    <div className="offline-mode-banner">
      {t('Offline')}
      <FaSignal />
    </div>
  ) : null
}

OfflineBanner.propTypes = {
  isInOfflineMode: PropTypes.bool,
}

export default connect((state) => ({
  isInOfflineMode: selectors.isInOfflineModeSelector(state.present),
}))(OfflineBanner)
