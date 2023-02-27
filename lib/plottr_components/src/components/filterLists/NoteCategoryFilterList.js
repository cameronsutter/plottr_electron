import React, { Component } from 'react'
import PropTypes from 'react-proptypes'
import { t as i18n } from 'plottr_locales'
import GenericFilterList from './GenericFilterList'

import { checkDependencies } from '../checkDependencies'

const CharacterNoteCategoryFilterListConnector = (connector) => {
  class CharacterNoteCategoryFilterList extends Component {
    updateItems = (ids) => {
      this.props.updateItems('noteCategory', ids)
    }

    render() {
      const categoryFilterItems = [...this.props.categories]
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
      selectors: { categoriesFilterItemsSelector },
    },
  } = connector
  checkDependencies({ redux, categoriesFilterItemsSelector })

  if (redux) {
    const { connect } = redux

    return connect((state) => {
      return {
        categories: categoriesFilterItemsSelector(state.present),
      }
    })(CharacterNoteCategoryFilterList)
  }

  throw new Error('Could not connect CharacterNoteCategoryFilterList')
}

export default CharacterNoteCategoryFilterListConnector
