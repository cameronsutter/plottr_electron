import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import { Col, Grid, Row, FormControl } from 'react-bootstrap'

export default function RecentsHeader({ setSearchTerm, hasCurrentProLicense, isOnWeb }) {
  return (
    <Grid fluid>
      <Row>
        <Col xs={4} sm={8}>
          {hasCurrentProLicense && !isOnWeb ? (
            <div className="dashboard__recent-project">
              <h1>{t('Recent Projects')}</h1>
              <h6 className="accented-text">({t('Saved in the Cloud')})</h6>
            </div>
          ) : (
            <h1>{t('Recent Projects')}</h1>
          )}
        </Col>
        <Col xs={8} sm={4}>
          <FormControl
            type="search"
            placeholder={t('Search')}
            className="dashboard__search"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </Col>
      </Row>
    </Grid>
  )
}

RecentsHeader.propTypes = {
  setSearchTerm: PropTypes.func,
  hasCurrentProLicense: PropTypes.bool,
  isOnWeb: PropTypes.bool,
}
