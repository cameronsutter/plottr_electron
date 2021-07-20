import React from 'react'
import { t } from 'plottr_locales'
import { Button } from 'react-bootstrap'

const AboutConnector = (connector) => {
  const {
    platform: {
      license: { useTrialStatus },
      isDevelopment,
      appVersion,
      openExternal,
      mpq,
      settings,
    },
  } = connector

  const About = (props) => {
    const { started, expired } = useTrialStatus()

    const checkForUpdates = () => {
      if (isDevelopment) return
      mpq.push('btn_check_for_updates')
      checkForUpdates()
    }

    const seeChangelog = () => {
      mpq.push('btn_see_changelog')
      openExternal('https://plottr.com/changelog')
    }

    const UpdateButton = () => {
      if ((started && !expired) || settings.get('canGetUpdates')) {
        // in the free trial or valid license
        return (
          <dd>
            <Button bsSize="small" onClick={checkForUpdates}>
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
            <dt>{t('Updates')}</dt>
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

  return About
}

export default AboutConnector
