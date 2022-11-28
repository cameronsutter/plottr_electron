import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import cx from 'classnames'

import { t } from 'plottr_locales'

import ButtonGroup from '../ButtonGroup'
import Glyphicon from '../Glyphicon'
import Button from '../Button'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import UnconnectedImage from '../images/Image'
import UnconnectedImagePicker from '../images/ImagePicker'
import UnconnectedTemplatePicker from '../templates/TemplatePicker'

import { checkDependencies } from '../checkDependencies'

const BookConnector = (connector) => {
  const Image = UnconnectedImage(connector)
  const ImagePicker = UnconnectedImagePicker(connector)
  const TemplatePicker = UnconnectedTemplatePicker(connector)

  const templatesDisabled = connector.platform.templatesDisabled
  checkDependencies({ templatesDisabled })

  const {
    platform: { inBrowser, browserHistory },
  } = connector

  class Book extends Component {
    state = {
      hovering: false,
      deleting: false,
      showTemplatePicker: false,
      showImagePicker: false,
    }

    chooseImage = (newId) => {
      const imageId = newId == -1 ? null : newId
      this.props.actions.editBookImage(this.props.book.id, imageId)
      this.setState({ hovering: false })
    }

    deleteBook = (e) => {
      e.stopPropagation()
      this.props.actions.deleteBook(this.props.book.id)
    }

    cancelDelete = (e) => {
      e.stopPropagation()
      this.setState({ deleting: false, hovering: false })
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

    cancelPickImage = () => {
      this.setState({ hovering: false })
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

    handleOpenBookDialog = () => {
      const { uiActions, book } = this.props
      uiActions.openEditBookDialog(book.id)
    }

    renderHoverOptions() {
      return (
        <div className={cx('hover-options', { hovering: this.state.hovering })}>
          <ButtonGroup>
            <Button title={t('Edit')} onClick={this.handleOpenBookDialog}>
              <Glyphicon glyph="edit" />
            </Button>
            <ImagePicker
              chooseImage={this.chooseImage}
              selectedId={this.props.book.imageId}
              onClose={this.cancelPickImage}
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

    handleClickAddBook = () => {
      const { uiActions } = this.props
      uiActions.openNewBookDialog()
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
                    <div onClick={this.handleClickAddBook}>
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
      books: PropTypes.object,
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
          books: selectors.allBooksSelector(state.present),
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
