import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as BookActions from 'actions/books'
import i18n from 'format-message'
import Book from './Book'
import { Glyphicon } from 'react-bootstrap'

class BookList extends Component {

  addBook = () => {
    this.props.actions.addBook()
  }

  renderBooks () {
    return this.props.books.allIds.map(id => <Book key={id} bookId={id} />)
  }

  render () {
    return <div className='book-list__container'>
      <h2>{`${i18n('Books')} `}<span onClick={this.addBook}><Glyphicon glyph='plus'/></span></h2>
      <div className='book-list__list'>
        { this.renderBooks() }
        <Book />
      </div>
    </div>
  }

  static propTypes = {
    ui: PropTypes.object.isRequired,
    books: PropTypes.object.isRequired,
    actions: PropTypes.object,
  }
}

function mapStateToProps (state) {
  return {
    ui: state.ui,
    books: state.books,
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
)(BookList)