import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t as i18n } from 'plottr_locales'
import { newIds } from 'pltr/v2'

import Form from '../Form'
import Modal from '../Modal'
import ButtonToolbar from '../ButtonToolbar'
import Col from '../Col'
import ControlLabel from '../ControlLabel'
import FormGroup from '../FormGroup'
import FormControl from '../FormControl'
import Button from '../Button'
import { checkDependencies } from '../checkDependencies'

const { objectId } = newIds

const BookDialogConnector = (connector) => {
  const {
    platform: { inBrowser, browserHistory },
  } = connector
  class BookDialog extends Component {
    constructor(props) {
      super(props)
      this.titleRef = null
      this.premiseRef = null
      this.genreRef = null
      this.themeRef = null
    }

    saveEdit = (saveAndOpen) => {
      const { book, books } = this.props

      let title = this.titleRef.value
      let premise = this.premiseRef.value
      let genre = this.genreRef.value
      let theme = this.themeRef.value
      const newBookId = objectId(books.allIds)

      if (!book) {
        this.props.actions.addBook(newBookId, { title, premise, genre, theme })
      } else {
        this.props.actions.editBook(book.id, { title, premise, genre, theme })
      }
      this.handleCancel()

      if (saveAndOpen) {
        this.navigateToBook(book?.id || newBookId)
      }
    }

    handleCancel = () => {
      this.props.uiActions.setBookDialogClose()
    }

    navigateToBook = (bookId) => {
      this.props.uiActions.navigateToBookTimeline(bookId, inBrowser, browserHistory)
    }

    renderToolBar() {
      return (
        <ButtonToolbar>
          <Button onClick={this.handleCancel}>{i18n('Cancel')}</Button>
          <Button bsStyle="success" onClick={() => this.saveEdit()}>
            {i18n('Save')}
          </Button>
          <Button className="pull-right" bsStyle="primary" onClick={() => this.saveEdit(true)}>
            {i18n('Save and Open')}
          </Button>
        </ButtonToolbar>
      )
    }

    renderBody() {
      const { book, bookNumber, bookDialogBookNumber } = this.props
      return (
        <Form horizontal>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Book #')}
            </Col>
            <Col sm={8}>
              <span className="lead">{bookNumber || bookDialogBookNumber}</span>
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
                defaultValue={book?.title}
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
                defaultValue={book?.premise}
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
                defaultValue={book?.genre}
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
                defaultValue={book?.theme}
              />
            </Col>
          </FormGroup>
        </Form>
      )
    }

    render() {
      return (
        <Modal
          animation={false}
          show={true}
          onHide={this.handleCancel}
          dialogClassName={cx('book-dialog', { darkmode: this.props.darkMode })}
        >
          <Modal.Body>{this.renderBody()}</Modal.Body>
          <Modal.Footer>{this.renderToolBar()}</Modal.Footer>
        </Modal>
      )
    }

    static propTypes = {
      bookId: PropTypes.number,
      cancel: PropTypes.func.isRequired,
      darkMode: PropTypes.bool,
      book: PropTypes.object,
      bookNumber: PropTypes.number,
      actions: PropTypes.object.isRequired,
      books: PropTypes.object.isRequired,
      uiActions: PropTypes.object.isRequired,
      bookDialogBookNumber: PropTypes.number,
    }
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  const BookActions = actions.book
  checkDependencies({ redux, actions, BookActions })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          darkMode: selectors.isDarkModeSelector(state.present),
          books: selectors.allBooksSelector(state.present),
          book: state.present.books[ownProps.bookId],
          bookNumber: state.present.books.allIds.indexOf(ownProps.bookId) + 1,
          bookDialogBookNumber: selectors.bookDialogBookNumberSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(BookActions, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(BookDialog)
  }

  throw new Error('Could not connect BookDialog')
}

export default BookDialogConnector
