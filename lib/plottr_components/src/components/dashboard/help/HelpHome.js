import React, { useRef } from 'react'
import { t } from 'plottr_locales'
import { Button, FormControl, FormGroup } from 'react-bootstrap'
import { shell } from 'electron'
import { createErrorReport } from '../../../common/utils/full_error_report'
import { handleCustomerServiceCode } from '../../../common/utils/customer_service_codes'
import MPQ from '../../../common/utils/MPQ'

export default function HelpHome(props) {
  const serviceCodeRef = useRef(null)

  const submitCode = () => {
    const val = serviceCodeRef.current.value
    if (val) {
      handleCustomerServiceCode(val)
      serviceCodeRef.current.value = ''
    }
  }

  const l = (url) => {
    return () => {
      MPQ.push('btn_help_link', { url: url })
      shell.openExternal(`https://${url}`)
    }
  }

  const RenderWebView = () => {
    return React.createElement('webview', {
      src: 'https://docs.plottr.com',
      allowpopups: 'true',
    })
  }

  return (
    <div className="dashboard__help">
      <div style={{ flex: 0.16 }}>
        <h1>{t('Links')}</h1>
        <div className="dashboard__help__item links">
          <Button bsSize="large" bsStyle="link" onClick={l('learn.plottr.com/')}>
            {t('Tutorials')}
          </Button>
          <Button
            bsSize="large"
            bsStyle="link"
            onClick={l('docs.plottr.com/frequently-asked-questions/')}
          >
            {t('FAQ')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('plottr.com/demos/')}>
            {t('Demos')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('docs.plottr.com')}>
            {t('Documentation')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('feedback.getplottr.com')}>
            {t('Give Feedback')}
          </Button>
          <Button
            bsSize="large"
            bsStyle="link"
            onClick={l('www.facebook.com/groups/367650870614184')}
          >
            {t('Facebook Group')}
          </Button>
          <Button
            bsSize="large"
            bsStyle="link"
            onClick={l('docs.plottr.com/submit-a-ticket?help=Feature%20Request')}
          >
            {t('Request a Feature')}
          </Button>
          <Button bsSize="large" bsStyle="link" onClick={l('plottr.com/our-roadmap')}>
            {t('Roadmap')}
          </Button>
        </div>
        <hr />
      </div>
      <div style={{ flex: 0.16 }}>
        <h1>{t('Actions')}</h1>
        <div className="dashboard__help__item actions">
          <Button onClick={l('docs.plottr.com/submit-a-ticket?help=Technical%20Support')}>
            {t('Report a Problem')}
          </Button>
          <Button onClick={createErrorReport}>{t('Create an Error Report')}</Button>
          <div>
            <FormGroup controlId="customerServiceCode">
              <FormControl
                type="text"
                placeholder={t('Enter a Customer Service Code')}
                inputRef={(ref) => (serviceCodeRef.current = ref)}
              />
            </FormGroup>
            <Button onClick={submitCode}>{t('Submit')}</Button>
          </div>
        </div>
        <hr />
      </div>
      <div style={{ flex: 0.67 }}>
        <h1>{t('Documentation')}</h1>
        {RenderWebView()}
      </div>
    </div>
  )
}
