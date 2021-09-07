import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

const CharacterCategoryFilterListConnector = (connector) => {
  const uncategorized = {
    id: null,
    name: 'Uncategorized',
    position: -1,
    type: 'text',
  }
  class CharacterCategoryFilterList extends Component {
    updateItems = (ids) => {
      this.props.updateItems('category', ids)
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

  CharacterCategoryFilterList.propTypes = {
    categories: PropTypes.array.isRequired,
    updateItems: PropTypes.func.isRequired,
    filteredItems: PropTypes.array,
  }

  const {
    redux,
    pltr: {
      selectors: { sortedCharacterCategoriesSelector },
    },
  } = connector

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        categories: sortedCharacterCategoriesSelector(state.present),
      }
    })(CharacterCategoryFilterList)
  }

  throw new Error('Could not connect CharacterCategoryFilterList')
}

export default CharacterCategoryFilterListConnector
