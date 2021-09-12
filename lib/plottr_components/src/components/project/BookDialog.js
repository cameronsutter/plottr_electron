import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
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
import { t as i18n } from 'plottr_locales'
import cx from 'classnames'

import { checkDependencies } from '../checkDependencies'

const BookDialogConnector = (connector) => {
  class BookDialog extends Component {
    constructor(props) {
      super(props)
      this.titleRef = null
      this.premiseRef = null
      this.genreRef = null
      this.themeRef = null
    }

    saveEdit = () => {
      const { book } = this.props

      let title = this.titleRef.value
      let premise = this.premiseRef.value
      let genre = this.genreRef.value
      let theme = this.themeRef.value
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
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.titleRef = ref
                }}
                defaultValue={book.title}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Premise')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.premiseRef = ref
                }}
                defaultValue={book.premise}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Genre')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.genreRef = ref
                }}
                defaultValue={book.genre}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Theme')}
            </Col>
            <Col sm={8}>
              <FormControl
                type="text"
                inputRef={(ref) => {
                  this.themeRef = ref
                }}
                defaultValue={book.theme}
              />
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

  const {
    redux,
    pltr: { actions },
  } = connector
  const BookActions = actions.book
  checkDependencies({ redux, actions, BookActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          ui: state.present.ui,
          book: state.present.books[ownProps.bookId],
          bookNumber: state.present.books.allIds.indexOf(ownProps.bookId) + 1,
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(BookActions, dispatch),
        }
      }
    )(BookDialog)
  }

  throw new Error('Could not connect BookDialog')
}

export default BookDialogConnector
