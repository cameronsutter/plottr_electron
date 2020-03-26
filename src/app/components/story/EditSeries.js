import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, Row, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap'
import i18n from 'format-message'
import * as SeriesActions from 'actions/series'

class EditSeries extends Component {

  componentWillUnmount () {
    this.saveEdit()
  }

  saveEdit = () => {
    let name = ReactDOM.findDOMNode(this.refs.name).value
    let premise = ReactDOM.findDOMNode(this.refs.premise).value
    let genre = ReactDOM.findDOMNode(this.refs.genre).value
    let theme = ReactDOM.findDOMNode(this.refs.theme).value
    this.props.actions.editSeries({name, premise, genre, theme})
  }

  renderToolBar () {
    return <ButtonToolbar>
      <Button bsStyle='success' onClick={this.saveEdit}>{i18n('Save')}</Button>
    </ButtonToolbar>
  }

  renderBody () {
    const { series } = this.props
    return <Form horizontal>
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
      <FormGroup>
        <Col componentClass={ControlLabel} sm={1}>
          {i18n('Genre')}
        </Col>
        <Col sm={4}>
          <FormControl type='text' ref='genre' defaultValue={series.genre} />
        </Col>
        <Col componentClass={ControlLabel} sm={1}>
          {i18n('Theme')}
        </Col>
        <Col sm={4}>
          <FormControl type='text' ref='theme' defaultValue={series.theme} />
        </Col>
      </FormGroup>
    </Form>
  }

  renderModal () {
    return <Modal show={true} onHide={this.props.cancel}>
      <Modal.Body>
        { this.renderBody() }
      </Modal.Body>
      <Modal.Footer>
        { this.renderToolBar() }
      </Modal.Footer>
    </Modal>
  }

  render () {
    if (this.props.modal) {
      this.renderModal()
    } else {
      return <div className='edit-book__container'>
        { this.renderBody() }
        <Row>
          <Col sm={10}>
            { this.renderToolBar() }
          </Col>
        </Row>
      </div>
    }
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state, ownProps) {
  return {
    ui: state.ui,
    series: state.series,
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(SeriesActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditSeries)