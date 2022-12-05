import React, { useEffect, useState } from 'react'
import { PropTypes } from 'prop-types'

import { t } from 'plottr_locales'

import Button from '../../Button'

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

  const About = ({ settings, inValidLicenseState, requestCheckForUpdates }) => {
    const [version, setVersion] = useState('')

    useEffect(() => {
      appVersion(setVersion)
    })

    const osIsUnknown = os() === 'unknown'

    const _checkForUpdates = () => {
      if (isDevelopment) return
      mpq.push('btn_check_for_updates')
      requestCheckForUpdates()
      checkForUpdates()
    }

    const seeChangelog = () => {
      mpq.push('btn_see_changelog')
      openExternal('https://plottr.com/changelog')
    }

    const UpdateButton = () => {
      // Can't update an application on an unknown OS (e.g. OS is unknown on web)
      if (osIsUnknown) return null

      if (inValidLicenseState || settings.canGetUpdates) {
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
        <hr />
        <div className="dashboard__about__wrapper">
          <dl className="dl-horizontal">
            <dt>{t('Version')}</dt>
            <dd>{version}</dd>
            {osIsUnknown ? null : <dt>{t('Updates')}</dt>}
            <UpdateButton />
            <dt>{t('Changelog')}</dt>
            <dd>
              <a href="#" onClick={seeChangelog} draggable={false}>
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
    requestCheckForUpdates: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    inValidLicenseState: PropTypes.bool,
  }

  const {
    pltr: { selectors, actions },
    redux,
  } = connector

  if (redux) {
    const { connect } = redux
    return connect(
      (state) => ({
        settings: selectors.appSettingsSelector(state.present),
        inValidLicenseState: selectors.isInSomeValidLicenseStateSelector(state.present),
      }),
      { requestCheckForUpdates: actions.applicationState.requestCheckForUpdates }
    )(About)
  }

  throw new Error('Could not connect About')
}

export default AboutConnector
