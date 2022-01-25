import React from 'react'
import { PropTypes } from 'prop-types'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'

import { checkDependencies } from '../../checkDependencies'

const AboutConnector = (connector) => {
  const {
    platform: {
      update: { checkForUpdates },
      isDevelopment,
      appVersion,
      openExternal,
      mpq,
      os,
    },
  } = connector
  checkDependencies({
    checkForUpdates,
    isDevelopment,
    appVersion,
    openExternal,
    mpq,
    os,
  })

  const About = ({ settings, started, expired }) => {
    const osIsUnknown = os() === 'unknown'

    const _checkForUpdates = () => {
      if (isDevelopment) return
      mpq.push('btn_check_for_updates')
      checkForUpdates()
    }

    const seeChangelog = () => {
      mpq.push('btn_see_changelog')
      openExternal('https://plottr.com/changelog')
    }

    const UpdateButton = () => {
      // Can't update an application on an unknown OS (e.g. OS is unknown on web)
      if (osIsUnknown) return null

      if ((started && !expired) || settings.canGetUpdates) {
        // in the free trial or valid license
        return (
          <dd>
            <Button bsSize="small" onClick={_checkForUpdates}>
              {t('Check for Updates')}
            </Button>
          </dd>
        )
      } else {
        return (
          <dd>
            <span className="text-danger">{t('Not Receiving Updates')}</span>
          </dd>
        )
      }
    }

    return (
      <div className="dashboard__about">
        <h1>{t('About Plottr')}</h1>
        <div className="dashboard__about__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Version')}</dt>
            <dd>{appVersion}</dd>
            {osIsUnknown ? null : <dt>{t('Updates')}</dt>}
            <UpdateButton />
            <dt>{t('Changelog')}</dt>
            <dd>
              <a href="#" onClick={seeChangelog}>
                {t("See What's New")}
              </a>
            </dd>
          </dl>
          <dl className="dl-horizontal">
            <dt>{t('Created By')}</dt>
            <dd>{t('Fictional Devices LLC')}</dd>
            <dd>Cameron Sutter</dd>
            <dd>Ryan Zee</dd>
          </dl>
        </div>
      </div>
    )
  }

  About.propTypes = {
    settings: PropTypes.object.isRequired,
    started: PropTypes.bool,
    expired: PropTypes.bool,
  }

  const {
    pltr: { selectors },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect((state) => ({
      settings: selectors.appSettingsSelector(state.present),
      started: selectors.trialStartedSelector(state.present),
      expired: selectors.trialExpiredSelector(state.present),
    }))(About)
  }

  throw new Error('Could not connect About')
}

export default AboutConnector
