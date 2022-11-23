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
      const { bookDialogBookId, books, actions } = this.props
      const currentBook = books[bookDialogBookId]

      let title = this.titleRef.value
      let premise = this.premiseRef.value
      let genre = this.genreRef.value
      let theme = this.themeRef.value
      const newBookId = objectId(books.allIds)

      if (!currentBook) {
        actions.addBook(title, premise, genre, theme)
      } else {
        actions.editBook(currentBook.id, title, premise, genre, theme)
      }
      this.handleCancel()

      if (saveAndOpen) {
        this.navigateToBook(currentBook?.id || newBookId)
      }
    }

    handleCancel = () => {
      this.props.uiActions.closeBookDialog()
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

    handleDown = (event) => {
      if (event.key === 'Enter') this.saveEdit()
    }

    renderBody() {
      const { books, bookNumber, bookDialogBookId } = this.props
      const currentBook = books[bookDialogBookId]
      console.log('currentBook', currentBook)
      return (
        <Form horizontal onKeyDown={this.handleDown}>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Book #')}
            </Col>
            <Col sm={8}>
              <span className="lead">{bookNumber}</span>
            </Col>
          </FormGroup>
          <FormGroup>
            <Col componentClass={ControlLabel} sm={3}>
              {i18n('Title')}
            </Col>
            <Col sm={8}>
              <FormControl
                autoFocus
                type="text"
                inputRef={(ref) => {
                  this.titleRef = ref
                }}
                defaultValue={currentBook?.title}
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
                defaultValue={currentBook?.premise}
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
                defaultValue={currentBook?.genre}
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
                defaultValue={currentBook?.theme}
              />
            </Col>
          </FormGroup>
        </Form>
      )
    }

    render() {
      console.log('props', this.props)
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
      bookNumber: PropTypes.number,
      actions: PropTypes.object.isRequired,
      books: PropTypes.object.isRequired,
      uiActions: PropTypes.object.isRequired,
      bookDialogBookId: PropTypes.number,
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
          bookNumber: selectors.bookNumberSelector(state.present),
          bookDialogBookId: selectors.bookDialogBookIdSelector(state.present),
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
