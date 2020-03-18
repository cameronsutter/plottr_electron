import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import ImagePicker from '../images/ImagePicker'
import * as BookActions from 'actions/books'
import Image from '../images/Image'
import BookDialog from './BookDialog'
import { Glyphicon, ButtonGroup, Button } from 'react-bootstrap'
import cx from 'classnames'

class Book extends Component {
  state = {editing: false, hovering: false}

  addBook = () => {
    this.props.actions.addBook()
  }

  chooseImage = (newId) => {
    const id = newId == -1 ? null : newId
    this.props.actions.editBook(this.props.book.id, {imageId: id})
  }

  handleDelete = () => {
    let text = i18n('Do you want to delete this book: { book }?', {book: this.props.book.name})
    if (window.confirm(text)) {
      this.props.actions.deleteBook(this.props.book.id)
    }
  }

  renderHoverOptions () {
    return <div className={cx('hover-options', {hovering: this.state.hovering})}>
      <ButtonGroup>
        <Button onClick={() => this.setState({editing: true})}><Glyphicon glyph='edit' /></Button>
        <ImagePicker chooseImage={this.chooseImage} iconOnly />
        <Button bsStyle='danger' onClick={this.handleDelete}><Glyphicon glyph='trash' /></Button>
      </ButtonGroup>
    </div>
  }

  renderDialog () {
    if (!this.state.editing) return null

    return <BookDialog bookId={this.props.book.id} modal={true} cancel={() => this.setState({editing: false})} />
  }

  renderImage () {
    const { book } = this.props
    if (!book.imageId) return null

    return <Image responsive imageId={book.imageId} />
  }

  render () {
    const { book } = this.props

    if (!book) {
      return <div className='book-container add'>
        <div className='book add' onClick={this.addBook}>
          <div className='front'>
            <div className='cover add'>
              <div className='book-container__add'>
                <h1><Glyphicon glyph='plus' /></h1>
              </div>
            </div>
          </div>
          <div className='left-side add'>
            <h2>
              <span>{i18n('New Book')}</span>
            </h2>
          </div>
        </div>
      </div>
    }

    return <div
      className='book-container'
      onMouseEnter={() => this.setState({hovering: true})}
      onMouseLeave={() => this.setState({hovering: false})}
    >
      { this.renderHoverOptions() }
      { this.renderDialog() }
      <div className={cx('book', {hovering: this.state.hovering})} onClick={() => this.setState({editing: true})}>
        <div className='front'>
          <div className='cover'>
            <h6>{book.name || i18n('Untitled')}</h6>
            <div className='book-container__cover-image-wrapper'>
              { this.renderImage() }
            </div>
          </div>
        </div>
        <div className='left-side'>
          <h2>
            <span>{book.name || i18n('Untitled')}</span>
          </h2>
        </div>
      </div>
    </div>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    bookId: PropTypes.number,
    addBook: PropTypes.func,
    book: PropTypes.object,
  }
}

function mapStateToProps (state, ownProps) {
  return {
    ui: state.ui,
    book: state.books[ownProps.bookId],
  }
}

function mapDispatchToProps (dispatch) {
  return {
    actions: bindActionCreators(BookActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Book)