import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import {
  Modal,
  Form,
  FormGroup,
  Col,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
} from 'react-bootstrap'
import i18n from 'format-message'
import * as BookActions from 'actions/books'
import cx from 'classnames'

class BookDialog extends Component {
  constructor(props) {
    super(props)
    this.titleRef = React.createRef()
    this.premiseRef = React.createRef()
    this.genreRef = React.createRef()
    this.themeRef = React.createRef()
  }

  saveEdit = () => {
    const { book } = this.props

    let title = this.titleRef.current.value
    let premise = this.premiseRef.current.value
    let genre = this.genreRef.current.value
    let theme = this.themeRef.current.value
    this.props.actions.editBook(book.id, { title, premise, genre, theme })
    this.props.cancel()
  }

  renderToolBar() {
    return (
      <ButtonToolbar>
        <Button bsStyle="success" onClick={this.saveEdit}>
          {i18n('Save')}
        </Button>
        <Button onClick={this.props.cancel}>{i18n('Cancel')}</Button>
      </ButtonToolbar>
    )
  }

  renderBody() {
    const { book } = this.props
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Book #')}
          </Col>
          <Col sm={8}>
            <span className="lead">{this.props.bookNumber}</span>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Title')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref={this.titleRef} defaultValue={book.title} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Premise')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref={this.premiseRef} defaultValue={book.premise} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Genre')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref={this.genreRef} defaultValue={book.genre} />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>
            {i18n('Theme')}
          </Col>
          <Col sm={8}>
            <FormControl type="text" ref={this.themeRef} defaultValue={book.theme} />
          </Col>
        </FormGroup>
      </Form>
    )
  }

  render() {
    return (
      <Modal
        show={true}
        onHide={this.props.cancel}
        dialogClassName={cx('book-dialog', { darkmode: this.props.ui.darkMode })}
      >
        <Modal.Body>{this.renderBody()}</Modal.Body>
        <Modal.Footer>{this.renderToolBar()}</Modal.Footer>
      </Modal>
    )
  }

  static propTypes = {
    bookId: PropTypes.number.isRequired,
    cancel: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
    book: PropTypes.object,
    bookNumber: PropTypes.number,
    actions: PropTypes.object.isRequired,
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ui: state.present.ui,
    book: state.present.books[ownProps.bookId],
    bookNumber: state.present.books.allIds.indexOf(ownProps.bookId) + 1,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(BookActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BookDialog)
