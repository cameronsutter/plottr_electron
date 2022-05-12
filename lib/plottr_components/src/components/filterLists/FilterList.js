import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'

import Glyphicon from '../Glyphicon'
import { checkDependencies } from '../checkDependencies'

const FilterListConnector = (connector) => {
  class FilterList extends Component {
    constructor(props) {
      super(props)
      this.state = {
        filteredItems: props.filteredItems || this.defaultFilteredItemsObj(),
      }
    }

    defaultFilteredItemsObj() {
      return { tag: [], character: [], place: [], book: [] }
    }

    filterItem = (type, id) => {
      var filteredItems = this.state.filteredItems
      if (filteredItems[type].indexOf(id) === -1) {
        filteredItems[type].push(id)
      } else {
        var index = filteredItems[type].indexOf(id)
        if (index !== -1) filteredItems[type].splice(index, 1)
      }
      this.props.updateItems(filteredItems)
      this.setState({ filteredItems: filteredItems })
    }

    filterList = (type, list) => {
      var filteredItems = this.state.filteredItems
      if (filteredItems[type].length > 0) {
        filteredItems[type] = []
      } else {
        filteredItems[type] = list.map((item) => item.id)
      }
      this.props.updateItems(filteredItems)
      this.setState({ filteredItems: filteredItems })
    }

    isChecked(type, id) {
      return this.state.filteredItems[type].indexOf(id) !== -1
    }

    renderFilterList(array, type, attr) {
      var items = array.map((i) => {
        return this.renderFilterItem(i, type, attr)
      })
      return <ul className="filter-list__list">{items}</ul>
    }

    renderFilterItem(item, type, attr) {
      if (!item) return null

      var checked = 'unchecked'
      if (this.isChecked(type, item.id)) {
        checked = 'eye-open'
      }
      return (
        <li key={`${type}-${item.id}`} onMouseDown={() => this.filterItem(type, item.id)}>
          <Glyphicon glyph={checked} /> {item[attr]}
        </li>
      )
    }

    renderBookList() {
      if (!this.props.renderBooks) return null

      const { books } = this.props

      const renderedBooks = books.allIds.map((id) => {
        const book = books[id] || books[id.toString()]
        return this.renderFilterItem(book, 'book', 'title')
      })

      let checked = 'unchecked'
      if (this.isChecked('book', 'series')) {
        checked = 'eye-open'
      }

      return (
        <div>
          <p>{i18n('Books')}</p>
          <ul className="filter-list__list">
            <li key="book-series" onMouseDown={() => this.filterItem('book', 'series')}>
              <Glyphicon glyph={checked} /> {i18n('Series')}
            </li>
            {renderedBooks}
          </ul>
        </div>
      )
    }

    render() {
      return (
        <div className="filter-list flex">
          {this.renderBookList()}
          <div>
            <p onClick={() => this.filterList('character', this.props.characters)}>
              <em>{i18n('Characters')}</em>
            </p>
            {this.renderFilterList(this.props.characters, 'character', 'name')}
          </div>
          <div>
            <p onClick={() => this.filterList('place', this.props.places)}>
              <em>{i18n('Places')}</em>
            </p>
            {this.renderFilterList(this.props.places, 'place', 'name')}
          </div>
          <div>
            <p onClick={() => this.filterList('tag', this.props.tags)}>
              <em>{i18n('Tags')}</em>
            </p>
            {this.renderFilterList(this.props.tags, 'tag', 'title')}
          </div>
        </div>
      )
    }
  }

  FilterList.propTypes = {
    characters: PropTypes.array.isRequired,
    places: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    books: PropTypes.object.isRequired,
    updateItems: PropTypes.func.isRequired,
    renderBooks: PropTypes.bool,
    filteredItems: PropTypes.object,
  }

  const { redux } = connector
  checkDependencies({ redux })

  if (redux) {
    const { connect } = redux
    const {
      pltr: {
        selectors: { charactersSortedAtoZSelector, placesSortedAtoZSelector, sortedTagsSelector },
      },
    } = connector
    checkDependencies({
      charactersSortedAtoZSelector,
      placesSortedAtoZSelector,
      sortedTagsSelector,
    })

    return connect((state) => {
      return {
        characters: charactersSortedAtoZSelector(state.present),
        places: placesSortedAtoZSelector(state.present),
        tags: sortedTagsSelector(state.present),
        books: state.present.books,
      }
    })(FilterList)
  }

  throw new Error('Could not connect FilterList')
}

export default FilterListConnector
