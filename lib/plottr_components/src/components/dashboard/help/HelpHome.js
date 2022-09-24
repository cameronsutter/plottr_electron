import React, { useRef } from 'react'
import PropTypes from 'react-proptypes'

import { t } from 'plottr_locales'

import FormGroup from '../../FormGroup'
import FormControl from '../../FormControl'
import Button from '../../Button'
import { checkDependencies } from '../../checkDependencies'
import { useState } from 'react'
import { useCallback } from 'react'

const HelpHomeConnector = (connector) => {
  const {
    platform: { os, mpq, openExternal, createFullErrorReport, handleCustomerServiceCode },
  } = connector
  checkDependencies({ os, mpq, openExternal, createFullErrorReport, handleCustomerServiceCode })

  const HelpHome = ({ withFullFileState }) => {
    const serviceCodeRef = useRef(null)
    const [searchTerm, setSearchTerm] = useState('')

    const handleSearch = useCallback(() => {
      if (!searchTerm) return

      mpq.push('searched_docs', { term: searchTerm })
      const encoded = searchTerm.replace(/\s/g, '+')
      openExternal(`https://docs.plottr.com/search?query=${encoded}`)
    }, [searchTerm])

    const submitCode = () => {
      const val = serviceCodeRef.current.value
      if (val) {
        handleCustomerServiceCode(val)
        serviceCodeRef.current.value = ''
      }
    }

    const l = (url) => {
      return () => {
        mpq.push('btn_help_link', { url: url })
        openExternal(`https://${url}`)
      }
    }

    const handleCreateErrorReport = () => {
      withFullFileState((state) => {
        createFullErrorReport(state.present)
      })
    }

    return (
      <div className="dashboard__help">
        <div style={{ flex: 0.16 }}>
          <h1>{t('Links')}</h1>
          <div className="dashboard__help__item links">
            <Button bsSize="large" bsStyle="link" onClick={l('youtube.com/c/Plottr')}>
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
            <Button bsSize="large" bsStyle="link" onClick={l('plottr.com/support')}>
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
            <Button onClick={l('plottr.com/support')}>{t('Report a Problem')}</Button>
            <Button onClick={handleCreateErrorReport}>{t('Create an Error Report')}</Button>
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
          <h1>{t('Search Documentation')}</h1>
          <div className="dashboard__help__search-docs">
            <div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('Search the knowledge base')}
              />
              <Button onClick={handleSearch}>{t('Search')}</Button>
              <p>{t('(Opens in a new browser window)')}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  HelpHome.propTypes = {
    isOnWeb: PropTypes.bool,
    withFullFileState: PropTypes.func,
  }

  const {
    redux,
    pltr: { selectors, actions },
  } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect(
      (state) => ({
        isOnWeb: selectors.isOnWebSelector(state.present),
      }),
      {
        withFullFileState: actions.project.withFullFileState,
      }
    )(HelpHome)
  }

  throw new Error('Could not connect HelpHome')
}

export default HelpHomeConnector
