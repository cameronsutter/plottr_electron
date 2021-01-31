import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { connect } from 'react-redux'
import { Glyphicon } from 'react-bootstrap'
import i18n from 'format-message'
import { sortedTagsSelector } from '../selectors/tags'
import TagFilterList from './TagFilterList'

export default class FilterLists extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filteredItems: props.filteredItems || this.defaultFilteredItemsObj(),
    }
  }

  defaultFilteredItemsObj() {
    return { tag: [], character: [], place: [], book: [] }
  }

  updateFilter = (type, ids) => {
    let filteredItems = this.state.filteredItems
    filteredItems[type] = ids

    this.props.updateItems(filteredItems)
    this.setState({ filteredItems: filteredItems })
  }

  render() {
    return (
      <div className="filter-list flex">
        <TagFilterList
          updateItems={this.updateFilter}
          filteredItems={this.state.filteredItems.tag}
        />
      </div>
    )
  }
}
