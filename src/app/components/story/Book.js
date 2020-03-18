import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import i18n from 'format-message'
import ImagePicker from '../images/ImagePicker'
import * as BookActions from 'actions/books'
import Image from '../images/Image'
import BookDialog from './BookDialog'

class Book extends Component {
  state = {editing: false}

  renderDialog () {
    console.log('editing?', this.state.editing)
    if (!this.state.editing) return null

    return <BookDialog bookId={this.props.book.id} modal={true} cancel={() => this.setState({editing: false})} />
  }

  renderImage () {
    const { book } = this.props
    if (book.imageId) {
      return <Image responsive imageId={book.imageId} />
    } else {
      return <ImagePicker chooseImage={id => this.props.actions.editBook(book.id, {imageId: id})} iconOnly />
    }
  }

  render () {
    const { book } = this.props

    return <div className='book-container'>
      { this.renderDialog() }
      <div className='book' onClick={() => this.setState({editing: true})}>
        <div className='front'>
          <div className='cover'>
            <h6>{book.name}</h6>
            <div className='book-container__cover-image-wrapper'>
              { this.renderImage() }
            </div>
          </div>
        </div>
        <div className='left-side'>
          <h2>
            <span>{book.name}</span>
          </h2>
        </div>
      </div>
    </div>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    book: PropTypes.object.isRequired,
    image: PropTypes.object
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