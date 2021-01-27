import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import { allCardsSelector } from '../selectors/cards'
import { sortedTagsSelector } from '../selectors/tags'
import { charactersSortedAtoZSelector } from '../selectors/characters'
import { placesSortedAtoZSelector } from '../selectors/places'
import { property, uniqBy } from 'lodash'

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
    const filteredItems = {
      ...this.state.filteredItems,
      ...(!this.state.filteredItems[type] ? { [type]: [] } : {}),
    }
    if (filteredItems[type].indexOf(id) === -1) {
      filteredItems[type].push(id)
    } else {
      var index = filteredItems[type].indexOf(id)
      if (index !== -1) filteredItems[type].splice(index, 1)
    }
    this.props.updateItems(filteredItems)
    this.setState({ filteredItems })
  }

  filterList = (type, list, idField = 'id') => {
    const filteredItems = { ...this.state.filteredItems }
    if (filteredItems[type].length > 0) {
      filteredItems[type] = []
    } else {
      filteredItems[type] = list.map((item) => item[idField])
    }
    this.props.updateItems(filteredItems)
    this.setState({ filteredItems })
  }

  isChecked(type, id) {
    if (!this.state.filteredItems[type]) return false
    if (!this.state.filteredItems[type].length) return false
    return this.state.filteredItems[type].indexOf(id) !== -1
  }

  renderFilterList(array, type, attr, extraItems = [], idField = 'id') {
    const items = array.map((i) => {
      return this.renderFilterItem(i, type, attr, idField)
    })
    return <ul className="filter-list__list">{[...items, ...extraItems]}</ul>
  }

  renderFilterItem(item, type, attr, idField = 'id') {
    if (!item) return null

    var checked = 'unchecked'
    if (this.isChecked(type, item[idField])) {
      checked = 'eye-open'
    }
    return (
      <li key={`${type}-${item.id}`} onMouseDown={() => this.filterItem(type, item[idField])}>
        <Glyphicon glyph={checked} /> {item[attr || type]}
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

  renderBlank(attributeName) {
    var checked = 'unchecked'
    if (this.isChecked(attributeName, '')) {
      checked = 'eye-open'
    }
    return (
      <li key={`${attributeName}-blank`} onMouseDown={() => this.filterItem(attributeName, '')}>
        <Glyphicon glyph={checked} /> <em className="secondary-text">[{i18n('blank')}]</em>
      </li>
    )
  }

  entitiesWithValues(entities, attributeName) {
    const entitiesWithInterestingValues = entities.filter(
      (v) => v[attributeName] && v[attributeName] != ''
    )
    return uniqBy(entitiesWithInterestingValues, property(attributeName))
  }

  renderCustomAttributes = (attribute) => {
    const { name, type } = attribute
    if (type != 'text') return null

    return (
      <div key={name}>
        <p onClick={() => this.filterList(name, this.props.customAttributes, name)}>
          <em>{name}</em>
        </p>
        {this.renderFilterList(
          this.entitiesWithValues(this.props.cards, name),
          name,
          null, // The name is the attribute on the entity.
          [this.renderBlank(name)],
          name
        )}
      </div>
    )
  }

  render() {
    const customAttributeLists = this.props.customAttributes.map(this.renderCustomAttributes)
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
        {customAttributeLists}
      </div>
    )
  }
}

FilterList.propTypes = {
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  books: PropTypes.object.isRequired,
  cards: PropTypes.array.isRequired,
  customAttributes: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired,
  renderBooks: PropTypes.bool,
  filteredItems: PropTypes.object,
}

function mapStateToProps(state) {
  return {
    characters: charactersSortedAtoZSelector(state.present),
    places: placesSortedAtoZSelector(state.present),
    tags: sortedTagsSelector(state.present),
    cards: allCardsSelector(state.present),
    books: state.present.books,
    customAttributes: state.present.customAttributes.scenes,
  }
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(FilterList)
