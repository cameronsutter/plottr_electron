import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { ButtonToolbar, Button, DropdownButton,
  MenuItem, Input, Label, Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'

class FilterList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filteredItems: props.filteredItems || this.defaultFilteredItemsObj()
    }
  }

  defaultFilteredItemsObj () {
    return {tag: [], character: [], place: []}
  }

  filterItem (type, id) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[type].indexOf(id) === -1) {
      filteredItems[type].push(id)
    } else {
      var index = filteredItems[type].indexOf(id)
      if (index !== -1) filteredItems[type].splice(index, 1)
    }
    this.props.updateItems(filteredItems)
    this.setState({filteredItems: filteredItems})
  }

  filterList (type, list) {
    var filteredItems = this.state.filteredItems
    if (filteredItems[type].length > 0) {
      filteredItems[type] = []
    } else {
      filteredItems[type] = list.map((item) => item.id)
    }
    this.props.updateItems(filteredItems)
    this.setState({filteredItems: filteredItems})
  }

  isChecked (type, id) {
    return this.state.filteredItems[type].indexOf(id) !== -1
  }

  renderFilterList (array, type, attr) {
    var items = array.map((i) => {
      return this.renderFilterItem(i, type, attr)
    })
    return (
      <ul className='filter-list__list'>
        {items}
      </ul>
    )
  }

  renderFilterItem (item, type, attr) {
    var checked = 'unchecked'
    if (this.isChecked(type, item.id)) {
      checked = 'eye-open'
    }
    return (<li key={`${type}-${item.id}`} onMouseDown={() => this.filterItem(type, item.id)}>
        <Glyphicon glyph={checked} /> {item[attr]}
      </li>
    )
  }

  render () {
    return (
      <div className='filter-list'>
        <p onClick={() => this.filterList('character', this.props.characters)}><em>{i18n('Characters')}</em></p>
          {this.renderFilterList(this.props.characters, 'character', 'name')}
        <p onClick={() => this.filterList('place', this.props.places)}><em>{i18n('Places')}</em></p>
          {this.renderFilterList(this.props.places, 'place', 'name')}
        <p onClick={() => this.filterList('tag', this.props.tags)}><em>{i18n('Tags')}</em></p>
        {this.renderFilterList(this.props.tags, 'tag', 'title')}
      </div>
    )
  }
}


FilterList.propTypes = {
  characters: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
  updateItems: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  return {
    characters: state.characters,
    places: state.places,
    tags: state.tags
  }
}

function mapDispatchToProps (dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FilterList)
