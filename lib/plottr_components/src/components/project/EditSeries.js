import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
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
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'

const EditSeriesConnector = (connector) => {
  class EditSeries extends Component {
    state = { editing: false }

    constructor(props) {
      super(props)

      const { series } = props
      this.state = {
        editing: false,
        name: series.name,
        premise: series.premise,
        genre: series.genre,
        theme: series.theme,
      }
    }

    componentWillUnmount() {
      if (this.state.editing) this.saveEdit()
    }

    saveEdit = () => {
      const name = this.state.name
      const premise = this.state.premise
      const genre = this.state.genre
      const theme = this.state.theme
      this.props.actions.editSeries({ name, premise, genre, theme })
      this.setState({ editing: false })
    }

    checkForEdits = (e, which) => {
      const { series } = this.props

      let someEdited = ['name', 'premise', 'genre', 'theme']
        .filter((field) => field != which)
        .some((field) => this.state[field] != series[field])
      if (series[which] != e.target.value) someEdited = true
      this.setState({ editing: someEdited, [which]: e.target.value })
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
      return (
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={1}>
              {i18n('Name')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={this.state.name}
                onChange={(e) => this.checkForEdits(e, 'name')}
              />
            </Col>
            <Col componentClass={ControlLabel} sm={1}>
              {i18n('Premise')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={this.state.premise}
                onChange={(e) => this.checkForEdits(e, 'premise')}
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
                value={this.state.genre}
                onChange={(e) => this.checkForEdits(e, 'genre')}
              />
            </Col>
            <Col componentClass={ControlLabel} sm={1}>
              {i18n('Theme')}
            </Col>
            <Col sm={4}>
              <FormControl
                type="text"
                value={this.state.theme}
                onChange={(e) => this.checkForEdits(e, 'theme')}
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

  const {
    redux,
    pltr: { actions },
  } = connector
  const SeriesActions = actions.series

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state) => {
        return {
          ui: state.present.ui,
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
