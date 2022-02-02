import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t } from 'plottr_locales'
import UnconnectedBookDialog from './BookDialog'
import { Glyphicon, ButtonGroup, Button } from 'react-bootstrap'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedTemplatePicker from '../templates/TemplatePicker'

import { checkDependencies } from '../checkDependencies'

const BookConnector = (connector) => {
  const Image = UnconnectedImage(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const BookDialog = UnconnectedBookDialog(connector)
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  const templatesDisabled = connector.platform.templatesDisabled
  checkDependencies({ templatesDisabled })

  const {
    platform: { inBrowser, browserHistory },
  } = connector

  class Book extends Component {
    state = { editing: false, hovering: false, deleting: false, showTemplatePicker: false }

    chooseImage = (newId) => {
      const id = newId == -1 ? null : newId
      this.props.actions.editBook(this.props.book.id, { imageId: id })
    }

    deleteBook = (e) => {
      e.stopPropagation()
      this.props.actions.deleteBook(this.props.book.id)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false })
    }

    handleDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: true })
    }

    navigateToBook = () => {
      this.props.uiActions.navigateToBookTimeline(this.props.book.id, inBrowser, browserHistory)
    }

    handleChooseTemplate = (template) => {
      this.props.addBook(template)
      this.setState({ showTemplatePicker: false })
    }

    renderDelete() {
      if (!this.state.deleting) return null

      return (
        <DeleteConfirmModal
          name={this.props.book.title || t('Untitled')}
          onDelete={this.deleteBook}
          onCancel={this.cancelDelete}
        />
      )
    }

    renderHoverOptions() {
      return (
        <div className={cx('hover-options', { hovering: this.state.hovering })}>
          <ButtonGroup>
            <Button title={t('Edit')} onClick={() => this.setState({ editing: true })}>
              <Glyphicon glyph="edit" />
            </Button>
            <ImagePicker
              chooseImage={this.chooseImage}
              selectedId={this.props.book.imageId}
              iconOnly
              deleteButton
            />
            {this.props.canDelete ? (
              <Button bsStyle="danger" onClick={this.handleDelete}>
                <Glyphicon glyph="trash" />
              </Button>
            ) : null}
          </ButtonGroup>
        </div>
      )
    }

    renderDialog() {
      if (!this.state.editing) return null

      const { book, bookNumber } = this.props

      return (
        <BookDialog
          bookId={book.id}
          bookNumber={bookNumber}
          modal={true}
          cancel={() => this.setState({ editing: false })}
        />
      )
    }

    renderTemplatePicker() {
      if (!this.state.showTemplatePicker) return null

      return (
        <TemplatePicker
          types={['plotlines']}
          modal={true}
          isOpen={this.state.showTemplatePicker}
          close={() => this.setState({ showTemplatePicker: false })}
          onChooseTemplate={this.handleChooseTemplate}
        />
      )
    }

    renderImage() {
      const { book } = this.props
      if (!book.imageId) return null

      return <Image responsive imageId={book.imageId} />
    }

    renderTitle() {
      const { book } = this.props
      if (book.imageId) return null

      return <h6>{book.title || t('Untitled')}</h6>
    }

    render() {
      const { book, darkMode } = this.props

      if (!book) {
        return (
          <div className={cx('book-container', 'add', { darkmode: darkMode })}>
            {this.renderTemplatePicker()}
            <div className="book add">
              <div className="front">
                <div className="cover add">
                  <div className="book-container__add">
                    <div onClick={() => this.props.addBook(null)}>
                      <Glyphicon glyph="plus" />
                    </div>
                    <div
                      className={cx('use-template', { disabled: templatesDisabled })}
                      onClick={() => this.setState({ showTemplatePicker: true })}
                    >
                      {t('Start with Template')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="left-side add">
                <h2>
                  <span>{t('New Book')}</span>
                </h2>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div
          className={cx('book-container', { darkmode: darkMode })}
          onMouseEnter={() => this.setState({ hovering: true })}
          onMouseLeave={() => this.setState({ hovering: false })}
        >
          {this.renderHoverOptions()}
          {this.renderDialog()}
          {this.renderDelete()}
          <div
            className={cx('book', { hovering: this.state.hovering })}
            onClick={this.navigateToBook}
          >
            <div className="front">
              <div className="cover">
                {this.renderTitle()}
                <div className="book-container__cover-image-wrapper">{this.renderImage()}</div>
              </div>
            </div>
            <div className="left-side">
              <h2>
                <span>{book.title || t('Untitled')}</span>
              </h2>
            </div>
          </div>
        </div>
      )
    }

    static propTypes = {
      bookId: PropTypes.number,
      bookNumber: PropTypes.number,
      addBook: PropTypes.func,
      darkMode: PropTypes.bool,
      canDelete: PropTypes.bool,
      book: PropTypes.object,
      actions: PropTypes.object,
      uiActions: PropTypes.object,
    }
  }

  const {
    redux,
    pltr: { actions, selectors },
  } = connector
  checkDependencies({ redux, actions, selectors })

  if (redux) {
    const { connect, bindActionCreators } = redux

    return connect(
      (state, ownProps) => {
        return {
          darkMode: selectors.isDarkModeSelector(state.present),
          book: state.present.books[ownProps.bookId],
          canDelete: selectors.canDeleteBookSelector(state.present),
        }
      },
      (dispatch) => {
        return {
          actions: bindActionCreators(actions.book, dispatch),
          uiActions: bindActionCreators(actions.ui, dispatch),
        }
      }
    )(Book)
  }

  throw new Error('Could not connect Book')
}

export default BookConnector
