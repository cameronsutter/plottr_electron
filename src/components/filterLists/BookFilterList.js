import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

import { checkDependencies } from '../checkDependencies'

const BookFilterListConnector = (connector) => {
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

  const { redux } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        books: state.present.books,
      }
    })(BookFilterList)
  }

  throw new Error('Could not connect Book Filter List')
}

export default BookFilterListConnector
