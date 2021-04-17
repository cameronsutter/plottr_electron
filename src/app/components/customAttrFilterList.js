import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import TagFilterList from './filterLists/TagFilterList'
import BookFilterList from './filterLists/BookFilterList'
import CharacterCategoryFilterList from './filterLists/CharacterCategoryFilterList'
import PlacesFilterList from './filterLists/PlacesFilterList'
import CharactersFilterList from './filterLists/CharactersFilterList'
import CardColorFilterList from './filterLists/CardColorFilterList'

import { selectors, actions } from 'pltr/v2'

const UIActions = actions.ui
const { sortedTagsSelector } = selectors

class CustomAttrFilterList extends Component {
  constructor(props) {
    super(props)
    this.state = { filteredItems: {} }
  }

  static getDerivedStateFromProps(props, state) {
    // TODO: this should be a selector
    let filteredItems = { tag: [], book: [], category: [], color: [] }
    if (state.filteredItems)
      filteredItems = Object.assign({}, filteredItems, state.filteredItems, props.filteredItems)
    filteredItems = props.customAttributes.reduce((result, attr) => {
      if (attr.type == 'text') result[attr.name] = filteredItems[attr.name] || []
      return result
    }, filteredItems)

    return { filteredItems }
  }

  updateFilter = (type, ids) => {
    let filteredItems = this.state.filteredItems
    filteredItems[type] = ids

    this.props.update(filteredItems)
    this.setState({ filteredItems })
  }

  filterItem(value, attr) {
    var filteredItems = this.state.filteredItems
    if (!filteredItems[attr]) return
    if (!filteredItems[attr].includes(value)) {
      filteredItems[attr].push(value)
    } else {
      var index = filteredItems[attr].indexOf(value)
      if (index !== -1) filteredItems[attr].splice(index, 1)
    }
    this.props.update(filteredItems)
    this.setState({ filteredItems })
  }

  filterList(attr) {
    var filteredItems = this.state.filteredItems
    if (!filteredItems[attr]) return
    if (filteredItems[attr].length > 0) {
      filteredItems[attr] = []
    } else {
      filteredItems[attr] = this.values(attr)
    }
    this.props.update(filteredItems)
    this.setState({ filteredItems: filteredItems })
  }

  isChecked(value, attrName) {
    if (!this.state.filteredItems[attrName]) return false
    if (!this.state.filteredItems[attrName].length) return false
    return this.state.filteredItems[attrName].indexOf(value) !== -1
  }

  values(attrName) {
    // TODO: this should be a selector
    let values = this.props.items.map((item) => item[attrName])
    return _.uniq(values.filter((v) => v && v != ''))
  }

  renderFilterList(array, attr) {
    var items = array.map((i) => this.renderFilterItem(i, attr))
    return (
      <ul key={`${attr.name}-${items}`} className="filter-list__list">
        {items}
        {this.renderBlank(attr)}
      </ul>
    )
  }

  renderFilterItem(value, attr) {
    var checked = 'unchecked'
    if (this.isChecked(value, attr.name)) {
      checked = 'eye-open'
    }
    return (
      <li key={`${value}-${attr.name}`} onMouseDown={() => this.filterItem(value, attr.name)}>
        <Glyphicon glyph={checked} /> {value.substr(0, 18)}
      </li>
    )
  }

  renderBlank(attr) {
    var checked = 'unchecked'
    if (this.isChecked('', attr.name)) {
      checked = 'eye-open'
    }
    return (
      <li onMouseDown={() => this.filterItem('', attr.name)}>
        <Glyphicon glyph={checked} /> <em className="secondary-text">[{i18n('blank')}]</em>
      </li>
    )
  }

  renderList = (attr) => {
    const { name, type } = attr
    if (type != 'text') return null

    return (
      <div key={name}>
        <p onClick={() => this.filterList(attr.name)}>
          <em>{name}</em>
        </p>
        {this.renderFilterList(this.values(attr.name), attr)}
      </div>
    )
  }

  render() {
    const CAlists = this.props.customAttributes.map(this.renderList)
    const { showCharacters, showPlaces, showCategory, isSeries, showColor } = this.props
    const orEmpty = (value) => (value ? value : [])

    let cardColors = this.props.items.map((item) => item.color)
    let cardColorsSet = new Set(cardColors)
    let cardColorsToFilterBy = [...cardColorsSet]
    return (
      <div className="filter-list flex">
        {isSeries && (
          <BookFilterList
            updateItems={this.updateFilter}
            filteredItems={[...orEmpty(this.state.filteredItems.book)]}
          />
        )}
        {showCharacters ? (
          <CharactersFilterList
            updateItems={this.updateFilter}
            filteredItems={[...orEmpty(this.state.filteredItems.character)]}
          />
        ) : null}
        {showPlaces ? (
          <PlacesFilterList
            updateItems={this.updateFilter}
            filteredItems={[...orEmpty(this.state.filteredItems.place)]}
          />
        ) : null}
        {showCategory ? (
          <CharacterCategoryFilterList
            updateItems={this.updateFilter}
            filteredItems={[...orEmpty(this.state.filteredItems.category)]}
          />
        ) : null}
        <TagFilterList
          updateItems={this.updateFilter}
          filteredItems={[...orEmpty(this.state.filteredItems.tag)]}
        />
        {showColor && (
          <CardColorFilterList
            updateItems={this.updateFilter}
            colors={cardColorsToFilterBy}
            filteredItems={[...orEmpty(this.state.filteredItems.color)]}
          />
        )}
        {CAlists}
      </div>
    )
  }
}

CustomAttrFilterList.propTypes = {
  tags: PropTypes.array.isRequired,
  books: PropTypes.object.isRequired,
  customAttributes: PropTypes.array.isRequired,
  items: PropTypes.array.isRequired,
  filteredItems: PropTypes.object,
  type: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  showCategory: PropTypes.bool.isRequired,
  showCharacters: PropTypes.bool.isRequired,
  showPlaces: PropTypes.bool.isRequired,
  isSeries: PropTypes.bool,
  showColor: PropTypes.bool,
}

function chooseFilteredItems(state, type) {
  switch (type) {
    case 'characters':
      return state.present.ui.characterFilter
    case 'places':
      return state.present.ui.placeFilter
    case 'cards':
      return state.present.ui.timelineFilter
    default:
      console.error(`Trying to get filter for unsuported filter type: ${type}`)
      return {}
  }
}

function chooseCustomAttributes(state, type) {
  switch (type) {
    case 'characters':
      return state.present.customAttributes.characters
    case 'places':
      return state.present.customAttributes.places
    case 'cards':
      return state.present.customAttributes.scenes
    default:
      console.error(`Trying to get custom attributes unsuported type: ${type}`)
      return {}
  }
}

function mapStateToProps(state, { type }) {
  const filteredItems = chooseFilteredItems(state, type)
  return {
    tags: sortedTagsSelector(state.present),
    books: state.present.books,
    customAttributes: chooseCustomAttributes(state, type),
    items: state.present[type],
    filteredItems,
    showCharacters: type === 'cards',
    showPlaces: type === 'cards',
    showCategory: type === 'characters',
    isSeries: selectors.isSeriesSelector(state.present),
  }
}

function chooseUpdateFilter(dispatch, type) {
  const actions = bindActionCreators(UIActions, dispatch)
  switch (type) {
    case 'characters':
      return actions.setCharacterFilter
    case 'places':
      return actions.setPlaceFilter
    case 'cards':
      return actions.setTimelineFilter
    default:
      return (newFilter) => {
        console.error(`Trying to update filter to ${newFilter} for unsuported type: ${type}`)
      }
  }
}

function mapDispatchToProps(dispatch, { type }) {
  return {
    update: chooseUpdateFilter(dispatch, type),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomAttrFilterList)
