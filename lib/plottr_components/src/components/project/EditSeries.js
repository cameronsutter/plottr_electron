import React, { useState, useEffect } from 'react'
import PropTypes from 'react-proptypes'
import { isEqual } from 'lodash'
import { Form } from 'react-bootstrap'
import cx from 'classnames'

import { t } from 'plottr_locales'

import ButtonToolbar from '../ButtonToolbar'
import Col from '../Col'
import Row from '../Row'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'

const EditSeriesConnector = (connector) => {
  const EditSeries = (props) => {
    const [editing, setEditing] = useState(false)
    const [previousSeries, setPreviousSeries] = useState(props.series)
    const [details, setDetails] = useState({
      name: props.series.name,
      premise: props.series.premise,
      genre: props.series.genre,
      theme: props.series.theme,
    })

    useEffect(() => {
      if (!isEqual(props.series, previousSeries)) {
        setPreviousSeries(props.series)
        setDetails(props.series)
      }
    }, [props.series])

    const saveEdit = () => {
      props.actions.editSeries(details)
      setEditing(false)
    }

    useEffect(() => {
      return () => {
        if (editing) saveEdit()
      }
    }, [])

    const checkForEdits = (e, which) => {
      const { series } = props

      let someEdited = ['name', 'premise', 'genre', 'theme']
        .filter((field) => field != which)
        .some((field) => details[field] != props[field])
      if (series[which] != e.target.value) someEdited = true

      setEditing(someEdited)
      setDetails({ ...details, [which]: e.target.value })
    }

    const renderToolBar = () => {
      return (
        <ButtonToolbar className={cx({ invisible: !editing })}>
          <Button bsStyle="success" onClick={saveEdit}>
            {t('Save')}
          </Button>
        </ButtonToolbar>
      )
    }

    const renderBody = () => {
      return (
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={1}>
              {t('Name')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={details.name}
                onChange={(e) => checkForEdits(e, 'name')}
              />
            </Col>
            <Col componentClass={ControlLabel} sm={1}>
              {t('Premise')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={details.premise}
                onChange={(e) => checkForEdits(e, 'premise')}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={1}>
              {t('Genre')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={details.genre}
                onChange={(e) => checkForEdits(e, 'genre')}
              />
            </Col>
            <Col componentClass={ControlLabel} sm={1}>
              {t('Theme')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={details.theme}
                onChange={(e) => checkForEdits(e, 'theme')}
              />
            </Col>
          </FormGroup>
        </Form>
      )
    }

    return (
      <div className="edit-book__container">
        <h2>{t('Series')}</h2>
        {renderBody()}
        <Row>
          <Col sm={10}>{renderToolBar()}</Col>
        </Row>
      </div>
    )
  }

  EditSeries.propTypes = {
    series: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }

  const {
    redux,
    pltr: { actions },
  } = connector
  const SeriesActions = actions.series
  checkDependencies({ redux, actions, SeriesActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          series: state.present.series,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(SeriesActions, dispatch),
        }
      }
    )(EditSeries)
  }

  throw new Error('Could not connect EditSeries')
}

export default EditSeriesConnector
