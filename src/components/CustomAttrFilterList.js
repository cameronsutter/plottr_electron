import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon } from 'react-bootstrap'
import { t as i18n } from 'plottr_locales'
import TagFilterListConnector from './filterLists/TagFilterList'
import BookFilterListConnector from './filterLists/BookFilterList'
import CharacterCategoryFilterListConnector from './filterLists/CharacterCategoryFilterList'
import PlacesFilterListConnector from './filterLists/PlacesFilterList'
import CharactersFilterListConnector from './filterLists/CharactersFilterList'
import NoteCategoryFilterListConnector from './filterLists/NoteCategoryFilterList'
import CardColorFilterList from './filterLists/CardColorFilterList'

import { checkDependencies } from './checkDependencies'

const CustomAttrFilterListConnector = (connector) => {
  const TagFilterList = TagFilterListConnector(connector)
  const BookFilterList = BookFilterListConnector(connector)
  const CharacterCategoryFilterList = CharacterCategoryFilterListConnector(connector)
  const PlacesFilterList = PlacesFilterListConnector(connector)
  const CharactersFilterList = CharactersFilterListConnector(connector)
  const NoteCategoryFilterList = NoteCategoryFilterListConnector(connector)

  const {
    platform: { log },
  } = connector

  checkDependencies({ log })

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
      const { showCharacters, showPlaces, showNoteCategory, showCategory, showBook, showColor } =
        this.props
      const orEmpty = (value) => (value ? value : [])

      const cardColors = this.props.items.map((item) => (!item.color ? null : item.color))
      const cardColorsSet = new Set(cardColors)
      const cardColorsToFilterBy = [...cardColorsSet]

      return (
        <div className="filter-list flex">
          {showBook && (
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
          {showNoteCategory ? (
            <NoteCategoryFilterList
              updateItems={this.updateFilter}
              filteredItems={[...orEmpty(this.state.filteredItems.noteCategory)]}
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
    showNoteCategory: PropTypes.bool.isRequired,
    showCharacters: PropTypes.bool.isRequired,
    showPlaces: PropTypes.bool.isRequired,
    showBook: PropTypes.bool.isRequired,
    showColor: PropTypes.bool,
  }

  const {
    redux,
    pltr: {
      actions,
      selectors: { sortedTagsSelector },
    },
  } = connector

  checkDependencies({ redux, actions, sortedTagsSelector })

  if (redux) {
    const { connect, bindActionCreators } = redux

    const chooseFilteredItems = (state, type) => {
      switch (type) {
        case 'characters':
          return state.present.ui.characterFilter
        case 'places':
          return state.present.ui.placeFilter
        case 'cards':
          return state.present.ui.timelineFilter
        case 'notes':
          return state.present.ui.noteFilter
        default:
          log.error(`Trying to get filter for unsuported filter type: ${type}`)
          return {}
      }
    }

    const chooseCustomAttributes = (state, type) => {
      switch (type) {
        case 'characters':
          return state.present.customAttributes.characters
        case 'places':
          return state.present.customAttributes.places
        case 'cards':
          return state.present.customAttributes.scenes
        case 'notes':
          return state.present.customAttributes.notes
        default:
          log.error(`Trying to get custom attributes unsuported type: ${type}`)
          return {}
      }
    }

    const mapStateToProps = (state, { type }) => {
      const filteredItems = chooseFilteredItems(state, type)
      return {
        tags: sortedTagsSelector(state.present),
        books: state.present.books,
        customAttributes: chooseCustomAttributes(state, type),
        items: state.present[type],
        filteredItems,
        showCharacters: type === 'cards' || type === 'notes',
        showPlaces: type === 'cards' || type === 'notes',
        showCategory: type === 'characters',
        showNoteCategory: type === 'notes',
        showBook: type === 'notes' || type === 'characters' || type === 'places',
      }
    }

    const chooseUpdateFilter = (dispatch, type) => {
      const uiActions = bindActionCreators(actions.ui, dispatch)
      switch (type) {
        case 'characters':
          return uiActions.setCharacterFilter
        case 'places':
          return uiActions.setPlaceFilter
        case 'cards':
          return uiActions.setTimelineFilter
        case 'notes':
          return uiActions.setNoteFilter
        default:
          return (newFilter) => {
            log.error(`Trying to update filter to ${newFilter} for unsuported type: ${type}`)
          }
      }
    }

    const mapDispatchToProps = (dispatch, { type }) => {
      return {
        update: chooseUpdateFilter(dispatch, type),
      }
    }

    return connect(mapStateToProps, mapDispatchToProps)(CustomAttrFilterList)
  }

  throw new Error('Could not connect CustomAttrFilterList')
}

export default CustomAttrFilterListConnector
