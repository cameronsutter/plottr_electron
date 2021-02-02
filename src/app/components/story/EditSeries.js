import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Form,
  FormGroup,
  Col,
  Row,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
} from 'react-bootstrap'
import i18n from 'format-message'
import * as SeriesActions from 'actions/series'
import cx from 'classnames'

class EditSeries extends Component {
  state = { editing: false }

  constructor(props) {
    super(props)
    this.nameRef = React.createRef()
    this.premiseRef = React.createRef()
    this.genreRef = React.createRef()
    this.themeRef = React.createRef()
  }

  componentWillUnmount() {
    if (this.state.editing) this.saveEdit()
  }

  saveEdit = () => {
    let name = this.nameRef.current.value
    let premise = this.premiseRef.current.value
    let genre = this.genreRef.current.value
    let theme = this.themeRef.current.value
    this.props.actions.editSeries({ name, premise, genre, theme })
    this.setState({ editing: false })
  }

  checkForEdits = () => {
    const { series } = this.props
    const someEdited = ['name', 'premise', 'genre', 'theme'].some((field) => {
      return this[`${field}Ref`].value != series[field]
    })
    this.setState({ editing: someEdited })
  }

  renderToolBar() {
    return (
      <ButtonToolbar className={cx({ invisible: !this.state.editing })}>
        <Button bsStyle="success" onClick={this.saveEdit}>
          {i18n('Save')}
        </Button>
      </ButtonToolbar>
    )
  }

  renderBody() {
    const { series } = this.props
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Name')}
          </Col>
          <Col sm={4}>
            <FormControl
              type="text"
              ref={this.nameRef}
              defaultValue={series.name}
              onChange={this.checkForEdits}
            />
          </Col>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Premise')}
          </Col>
          <Col sm={4}>
            <FormControl
              type="text"
              ref={this.premiseRef}
              defaultValue={series.premise}
              onChange={this.checkForEdits}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Genre')}
          </Col>
          <Col sm={4}>
            <FormControl
              type="text"
              ref={this.genreRef}
              defaultValue={series.genre}
              onChange={this.checkForEdits}
            />
          </Col>
          <Col componentClass={ControlLabel} sm={1}>
            {i18n('Theme')}
          </Col>
          <Col sm={4}>
            <FormControl
              type="text"
              ref={this.themeRef}
              defaultValue={series.theme}
              onChange={this.checkForEdits}
            />
          </Col>
        </FormGroup>
      </Form>
    )
  }

  render() {
    return (
      <div className="edit-book__container">
        <h2>{i18n('Series')}</h2>
        {this.renderBody()}
        <Row>
          <Col sm={10}>{this.renderToolBar()}</Col>
        </Row>
      </div>
    )
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    series: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps(state) {
  return {
    ui: state.present.ui,
    series: state.present.series,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(SeriesActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditSeries)
