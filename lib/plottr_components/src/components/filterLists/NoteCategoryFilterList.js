import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

const CharacterNoteCategoryFilterListConnector = (connector) => {
  const uncategorized = {
    id: null,
    name: 'Uncategorized',
    position: -1,
    type: 'text',
  }
  class CharacterNoteCategoryFilterList extends Component {
    updateItems = (ids) => {
      this.props.updateItems('noteCategory', ids)
    }

    render() {
      const categoryFilterItems = [...this.props.categories, uncategorized]
      return (
        <GenericFilterList
          items={categoryFilterItems}
          title={i18n('Categories')}
          displayAttribute={'name'}
          updateItems={this.updateItems}
          filteredItems={this.props.filteredItems}
        />
      )
    }
  }

  CharacterNoteCategoryFilterList.propTypes = {
    categories: PropTypes.array.isRequired,
    updateItems: PropTypes.func.isRequired,
    filteredItems: PropTypes.array,
  }

  const {
    redux,
    pltr: {
      selectors: { sortedNoteCategoriesSelector },
    },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        categories: sortedNoteCategoriesSelector(state.present),
      }
    })(CharacterNoteCategoryFilterList)
  }

  throw new Error('Could not connect CharacterNoteCategoryFilterList')
}

export default CharacterNoteCategoryFilterListConnector
