import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Modal, Form, FormGroup, Col, Row, ControlLabel, FormControl, ButtonToolbar, Button } from 'react-bootstrap'
import i18n from 'format-message'
import * as SeriesActions from 'actions/series'
import cx from 'classnames'

class EditSeries extends Component {
  state = {editing: false}

  componentWillUnmount () {
    if (this.state.editing) this.saveEdit()
  }

  saveEdit = () => {
    let name = findDOMNode(this.refs.name).value
    let premise = findDOMNode(this.refs.premise).value
    let genre = findDOMNode(this.refs.genre).value
    let theme = findDOMNode(this.refs.theme).value
    this.props.actions.editSeries({name, premise, genre, theme})
    this.setState({editing: false})
  }

  editMode = () => {
    if (!this.state.editing) this.setState({editing: true})
  }

  renderToolBar () {
    return <ButtonToolbar className={cx({invisible: !this.state.editing})}>
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
          <FormControl type='text' ref='name' defaultValue={series.name} onChange={this.editMode} />
        </Col>
        <Col componentClass={ControlLabel} sm={1}>
          {i18n('Premise')}
        </Col>
        <Col sm={4}>
          <FormControl type='text' ref='premise' defaultValue={series.premise} onChange={this.editMode} />
        </Col>
      </FormGroup>
      <FormGroup>
        <Col componentClass={ControlLabel} sm={1}>
          {i18n('Genre')}
        </Col>
        <Col sm={4}>
          <FormControl type='text' ref='genre' defaultValue={series.genre} onChange={this.editMode} />
        </Col>
        <Col componentClass={ControlLabel} sm={1}>
          {i18n('Theme')}
        </Col>
        <Col sm={4}>
          <FormControl type='text' ref='theme' defaultValue={series.theme} onChange={this.editMode} />
        </Col>
      </FormGroup>
    </Form>
  }

  render () {
    return <div className='edit-book__container'>
      { this.renderBody() }
      <Row>
        <Col sm={10}>
          { this.renderToolBar() }
        </Col>
      </Row>
    </div>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps (state) {
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