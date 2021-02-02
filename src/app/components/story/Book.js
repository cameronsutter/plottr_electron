import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import ImagePicker from '../images/ImagePicker'
import Image from '../images/Image'
import BookDialog from './BookDialog'
import { Glyphicon, ButtonGroup, Button } from 'react-bootstrap'
import cx from 'classnames'
import DeleteConfirmModal from '../dialogs/DeleteConfirmModal'
import { actions, selectors } from 'pltr/v2'

const BookActions = actions.book
const UIActions = actions.ui
const { canDeleteBookSelector } = selectors

class Book extends Component {
  state = { editing: false, hovering: false, deleting: false }

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
    this.props.uiActions.navigateToBookTimeline(this.props.book.id)
  }

  renderDelete() {
    if (!this.state.deleting) return null

    return (
      <DeleteConfirmModal
        name={this.props.book.title || i18n('Untitled')}
        onDelete={this.deleteBook}
        onCancel={this.cancelDelete}
      />
    )
  }

  renderHoverOptions() {
    return (
      <div className={cx('hover-options', { hovering: this.state.hovering })}>
        <ButtonGroup>
          <Button title={i18n('Edit')} onClick={() => this.setState({ editing: true })}>
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

  renderImage() {
    const { book } = this.props
    if (!book.imageId) return null

    return <Image responsive imageId={book.imageId} />
  }

  renderTitle() {
    const { book } = this.props
    if (book.imageId) return null

    return <h6>{book.title || i18n('Untitled')}</h6>
  }

  render() {
    const { book, ui } = this.props

    if (!book) {
      return (
        <div className={cx('book-container', 'add', { darkmode: ui.darkMode })}>
          <div className="book add" onClick={this.props.addBook}>
            <div className="front">
              <div className="cover add">
                <div className="book-container__add">
                  <h1>
                    <Glyphicon glyph="plus" />
                  </h1>
                </div>
              </div>
            </div>
            <div className="left-side add">
              <h2>
                <span>{i18n('New Book')}</span>
              </h2>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        className={cx('book-container', { darkmode: ui.darkMode })}
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
              <span>{book.title || i18n('Untitled')}</span>
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
    ui: PropTypes.object.isRequired,
    canDelete: PropTypes.bool,
    book: PropTypes.object,
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ui: state.present.ui,
    book: state.present.books[ownProps.bookId],
    canDelete: canDeleteBookSelector(state.present),
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(BookActions, dispatch),
    uiActions: bindActionCreators(UIActions, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Book)
