import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, Row, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap'
import SETTINGS from '../../../common/utils/settings'
import i18n from 'format-message'


class ExportTab extends Component {

  // render series options (each book, whole series) (which changes depending on premium or not)
  // render normal options (characters, places, scrivener separation character, etc)

  render () {
    return <div>
        <h1 className='secondary-text'>{i18n('Export')}</h1>
        <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Name')}
          </Col>
          <Col sm={4}>
            <FormControl type='text' ref='name' defaultValue={series.name} />
          </Col>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Premise')}
          </Col>
          <Col sm={4}>
            <FormControl type='text' ref='premise' defaultValue={series.premise} />
          </Col>
        </FormGroup>
      </Form>
    </div>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    series: state.series,
    books: state.books,
  }
}

function mapDispatchToProps (dispatch) {
  return {
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExportTab)
