import React from 'react'
import { PropTypes } from 'prop-types'
import { connect } from 'react-redux'

import { selectors, actions } from 'pltr/v2'
import { ProOnboarding as ProOnboardingWizard } from 'connected-components'

const ProOnboarding = ({ isOnboarding, finishProOnboarding }) => {
  return (
    <div id="dashboard__react__root">
      <ProOnboardingWizard cancel={finishProOnboarding} />
    </div>
  )
}

ProOnboarding.propTypes = {
  isOnboarding: PropTypes.bool,
  finishProOnboarding: PropTypes.func.isRequired,
}

export default connect(
  (state) => ({
    isOnboarding: selectors.isOnboardingToProFromRootSelector(state.present),
  }),
  {
    finishProOnboarding: actions.applicationState.finishProOnboarding,
  }
)(ProOnboarding)
