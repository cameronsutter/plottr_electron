import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Glyphicon } from 'react-bootstrap'
import * as UIActions from 'actions/ui'
import i18n from 'format-message'
import { sortedTagsSelector } from '../selectors/tags'
import TagFilterList from './filterLists/TagFilterList'
import BookFilterList from './filterLists/BookFilterList'
import CharacterCategoryFilterList from './filterLists/CharacterCategoryFilterList'

class CustomAttrFilterList extends Component {
  constructor (props) {
    super(props)
    this.state = { filteredItems: {} }
  }

  static getDerivedStateFromProps (props, state) {
    // TODO: this should be a selector
    let filteredItems = {tag: [], book: [], category: []}
    if (state.filteredItems) filteredItems = Object.assign({}, filteredItems, state.filteredItems, props.filteredItems)
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

  filterItem (value, attr) {
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

  filterList (attr) {
    var filteredItems = this.state.filteredItems
    if (!filteredItems[attr]) return
    if (filteredItems[attr].length > 0) {
      filteredItems[attr] = []
    } else {
      filteredItems[attr] = this.values(attr)
    }
    this.props.update(filteredItems)
    this.setState({filteredItems: filteredItems})
  }

  isChecked (value, attrName) {
    if (!this.state.filteredItems[attrName]) return false
    if (!this.state.filteredItems[attrName].length) return false
    return this.state.filteredItems[attrName].indexOf(value) !== -1
  }

  values (attrName) {
    // TODO: this should be a selector
    let values = this.props.items.map((item) => item[attrName])
    return _.uniq(values.filter((v) => v && v != ''))
  }

  renderFilterList (array, attr) {
    var items = array.map((i) => this.renderFilterItem(i, attr))
    return (
      <ul key={`${attr.name}-${items}`} className='filter-list__list'>
        {items}
        {this.renderBlank(attr)}
      </ul>
    )
  }

  renderFilterItem (value, attr) {
    var checked = 'unchecked'
    if (this.isChecked(value, attr.name)) {
      checked = 'eye-open'
    }
    return <li key={`${value}-${attr.name}`} onMouseDown={() => this.filterItem(value, attr.name)}>
      <Glyphicon glyph={checked} /> {value.substr(0, 18)}
    </li>
  }

  renderBlank (attr) {
    var checked = 'unchecked'
    if (this.isChecked('', attr.name)) {
      checked = 'eye-open'
    }
    return <li onMouseDown={() => this.filterItem('', attr.name)}>
      <Glyphicon glyph={checked} /> <em className='secondary-text'>[{i18n('blank')}]</em>
    </li>
  }

  renderList = (attr) => {
    const {name, type} = attr
    if (type != 'text') return null

    return <div key={name}>
      <p onClick={() => this.filterList(attr.name)}><em>{name}</em></p>
      { this.renderFilterList(this.values(attr.name), attr) }
    </div>
  }

  render () {
    const CAlists = this.props.customAttributes.map(this.renderList)
    return (
      <div className='filter-list flex'>
        <BookFilterList updateItems={this.updateFilter} filteredItems={[...this.state.filteredItems.book]}/>
        {this.props.showCategory ? <CharacterCategoryFilterList updateItems={this.updateFilter} filteredItems={[...this.state.filteredItems.category]}/> : null}
        <TagFilterList updateItems={this.updateFilter} filteredItems={[...this.state.filteredItems.tag]}/>
        { CAlists }
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
  showCategory: PropTypes.bool,
}

function mapStateToProps (state, ownProps) {
  let filteredItems = state.present.ui.characterFilter
  if (ownProps.type == 'places') filteredItems = state.present.ui.placeFilter
  return {
    tags: sortedTagsSelector(state.present),
    books: state.present.books,
    customAttributes: state.present.customAttributes[ownProps.type],
    items: ownProps.type == 'characters' ? state.present.characters : state.present.places,
    filteredItems,
    showCategory: ownProps.type == 'characters',
  }
}

function mapDispatchToProps (dispatch, ownProps) {
  let actions = bindActionCreators(UIActions, dispatch)
  return {
    update: ownProps.type == 'characters' ? actions.setCharacterFilter : actions.setPlaceFilter
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CustomAttrFilterList)
