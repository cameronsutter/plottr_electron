import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { Glyphicon } from 'react-bootstrap'

export default class GenericFilterList extends Component {
  filterItem = (id) => {
    var filteredItems = this.props.filteredItems
    if (!filteredItems.includes(id)) {
      filteredItems.push(id)
    } else {
      const index = filteredItems.indexOf(id)
      if (index !== -1) filteredItems.splice(index, 1)
    }
    this.props.updateItems(filteredItems)
  }

  filterList = (list) => {
    var filteredItems = this.props.filteredItems
    if (filteredItems.length) {
      filteredItems = []
    } else {
      filteredItems = list.map((item) => item.id)
    }
    this.props.updateItems(filteredItems)
  }

  isChecked(id) {
    return this.props.filteredItems.includes(id)
  }

  renderFilterList(items, attr) {
    var renderedItems = items.map((i) => {
      return this.renderFilterItem(i, attr)
    })
    return <ul className="filter-list__list">{renderedItems}</ul>
  }

  renderFilterItem(item, attr) {
    if (!item) return null

    var checked = 'unchecked'
    if (this.isChecked(item.id)) {
      checked = 'eye-open'
    }
    return (
      <li key={item.id} onMouseDown={() => this.filterItem(item.id)}>
        <Glyphicon glyph={checked} /> {item[attr]}
      </li>
    )
  }

  render() {
    const { title, items, displayAttribute } = this.props
    return (
      <div>
        <p onClick={() => this.filterList(items)}>
          <em>{title}</em>
        </p>
        {this.renderFilterList(items, displayAttribute)}
      </div>
    )
  }
}

GenericFilterList.propTypes = {
  items: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  displayAttribute: PropTypes.string.isRequired,
  updateItems: PropTypes.func.isRequired,
  filteredItems: PropTypes.array,
}
