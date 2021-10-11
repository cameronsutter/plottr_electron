import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import OnboardingStep from '../../../onboarding/OnboardingStep'
import { StepBody, StepFooter, StepHeader } from '../../../onboarding/Step'
import OnboardingButtonBar from '../../../onboarding/OnboardingButtonBar'
import { Button } from 'react-bootstrap'
import Switch from '../../../Switch'

const ProStep3Connector = (connector) => {
  const {
    platform: { useSettingsInfo },
  } = connector

  const ProStep3 = ({ finish }) => {
    const [settings, _size, saveSetting] = useSettingsInfo()

    const changeSetting = (ev) => {
      saveSetting('user.newFiles', ev.target.value)
    }

    const saveAll = () => {
      if (!settings.user.newFiles) {
        saveSetting('user.newFiles', 'cloud')
      }
      finish()
    }

    return (
      <OnboardingStep>
        <StepHeader>
          <h2>{t('Settings')}</h2>
          <p>{t('You can always change these later')}</p>
        </StepHeader>
        <StepBody>
          <div className="onboarding__settings">
            <div className="dashboard__options__item">
              <h4>{t('Where to save new projects:')}</h4>
              <select value={settings.user.newFiles || 'cloud'} onChange={changeSetting}>
                <option value="cloud">{t('In the Cloud')}</option>
                <option value="device">{t('On this Computer')}</option>
                <option value="ask">{t('Ask me each time')}</option>
              </select>
            </div>
            <div className="dashboard__options__item">
              <h4>{t('Save Backups')}</h4>
              <Switch
                isOn={!!settings.backup}
                handleToggle={() => saveSetting('backup', !settings.backup)}
                labelText={t('Automatically save daily backups')}
              />
            </div>
            <div className="dashboard__options__item">
              <h4>{t('Also save backups on this device')}</h4>
              <Switch
                isOn={!!settings.user.localBackups}
                handleToggle={() => saveSetting('user.localBackups', !settings.user.localBackups)}
                labelText={t('Save backups to this device as well as in the cloud')}
              />
            </div>
          </div>
        </StepBody>
        <StepFooter>
          <OnboardingButtonBar right>
            <p>{t('See? That was painless 😁')}</p>
            <Button bsSize="large" onClick={saveAll}>
              {t('Done!')}
            </Button>
          </OnboardingButtonBar>
        </StepFooter>
      </OnboardingStep>
    )
  }

  ProStep3.propTypes = {
    finish: PropTypes.func,
  }

  return ProStep3
}

export default ProStep3Connector
