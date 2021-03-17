import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

class BookFilterList extends Component {
  updateItems = (ids) => {
    this.props.updateItems('book', ids)
  }

  render() {
    let books = this.props.books.allIds.map((id) => {
      let book = { ...this.props.books[id.toString()] }
      book.title = book.title || i18n('Untitled')
      return book
    })
    let allItems = [{ id: 'series', title: i18n('Series') }, ...books]
    return (
      <GenericFilterList
        items={allItems}
        title={i18n('Books')}
        displayAttribute={'title'}
        updateItems={this.updateItems}
        filteredItems={this.props.filteredItems}
      />
    )
  }
}

BookFilterList.propTypes = {
  books: PropTypes.object.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}

function mapStateToProps(state) {
  return {
    books: state.present.books,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(BookFilterList)
