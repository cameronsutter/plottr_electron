import React from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import FormControl from 'reeact-bootstrap/FormControl'
import Row from 'reeact-bootstrap/Row'
import Grid from 'reeact-bootstrap/Grid'
import Col from 'reeact-bootstrap/Col'

export default function RecentsHeader({ setSearchTerm }) {
  return (
    <Grid fluid>
      <Row>
        <Col xs={4} sm={8}>
          <h1>{t('Recent Projects')}</h1>
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
}
